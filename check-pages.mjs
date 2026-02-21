import { chromium } from 'playwright';

const BASE_URL = 'http://localhost:1313';
const SCREENSHOT_DIR = '/tmp/blog-screenshots';

async function fetchSitemapUrls() {
  const resp = await fetch(`${BASE_URL}/sitemap.xml`);
  const xml = await resp.text();
  // Parse XML manually since we might not have xml2js
  const urls = [];
  const regex = /<loc>(.*?)<\/loc>/g;
  let match;
  while ((match = regex.exec(xml)) !== null) {
    // Convert production URLs to localhost
    const url = match[1].replace('https://erik.labianca.org', BASE_URL);
    urls.push(url);
  }
  return urls;
}

async function crawlForAdditionalUrls(page, knownUrls) {
  // Visit the home page and look for links we might have missed
  const additionalUrls = new Set();

  await page.goto(BASE_URL, { waitUntil: 'networkidle' });
  const links = await page.$$eval('a[href]', anchors => anchors.map(a => a.href));

  for (const link of links) {
    if (link.startsWith(BASE_URL) && !knownUrls.has(link)) {
      additionalUrls.add(link);
    }
  }

  // Check for search page, archives, about, etc.
  const commonPages = [
    '/search/', '/search',
    '/archives/', '/archives',
    '/about/', '/about',
    '/page/2/', '/page/3/',
  ];

  for (const p of commonPages) {
    const url = `${BASE_URL}${p}`;
    if (!knownUrls.has(url) && !additionalUrls.has(url)) {
      try {
        const resp = await fetch(url, { method: 'HEAD' });
        if (resp.ok) {
          additionalUrls.add(url);
        }
      } catch (e) {
        // ignore
      }
    }
  }

  return additionalUrls;
}

function sanitizeFilename(url) {
  return url
    .replace(BASE_URL, '')
    .replace(/\//g, '_')
    .replace(/[^a-zA-Z0-9_-]/g, '') || 'home';
}

async function checkPage(page, url) {
  const issues = [];
  const consoleErrors = [];
  const failedRequests = [];

  // Collect console errors
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  // Collect failed network requests
  page.on('requestfailed', request => {
    failedRequests.push({
      url: request.url(),
      failure: request.failure()?.errorText || 'unknown',
    });
  });

  // Track response status codes
  const responseErrors = [];
  page.on('response', response => {
    const status = response.status();
    if (status >= 400) {
      responseErrors.push({
        url: response.url(),
        status,
      });
    }
  });

  try {
    const response = await page.goto(url, {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    // Check main page response
    if (!response) {
      issues.push({ type: 'NO_RESPONSE', detail: 'No response received' });
    } else if (response.status() >= 400) {
      issues.push({ type: 'HTTP_ERROR', detail: `Status ${response.status()}` });
    }

    // Check page title
    const title = await page.title();
    if (!title || title.trim() === '') {
      issues.push({ type: 'EMPTY_TITLE', detail: 'Page has no title' });
    }

    // Check for meaningful content (not blank page)
    const bodyText = await page.evaluate(() => document.body?.innerText?.trim() || '');
    if (bodyText.length < 10) {
      issues.push({ type: 'BLANK_PAGE', detail: `Body text is only ${bodyText.length} chars` });
    }

    // Check for broken images
    const imageResults = await page.evaluate(() => {
      const images = Array.from(document.querySelectorAll('img'));
      return images.map(img => ({
        src: img.src,
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight,
        complete: img.complete,
        alt: img.alt,
      }));
    });

    for (const img of imageResults) {
      if (img.complete && img.naturalWidth === 0) {
        issues.push({ type: 'BROKEN_IMAGE', detail: `Image failed to load: ${img.src}` });
      }
      if (!img.alt && img.src) {
        issues.push({ type: 'MISSING_ALT', detail: `Image missing alt text: ${img.src}` });
      }
    }

    // Add console errors
    for (const err of consoleErrors) {
      issues.push({ type: 'CONSOLE_ERROR', detail: err });
    }

    // Add failed requests
    for (const req of failedRequests) {
      issues.push({ type: 'FAILED_REQUEST', detail: `${req.url} - ${req.failure}` });
    }

    // Add response errors (sub-resources like CSS, JS, images returning 404 etc.)
    for (const resp of responseErrors) {
      // Don't double-report the main page error
      if (resp.url !== url) {
        issues.push({ type: 'RESOURCE_ERROR', detail: `${resp.url} returned ${resp.status}` });
      }
    }

    // Take screenshot
    const filename = sanitizeFilename(url);
    await page.screenshot({
      path: `${SCREENSHOT_DIR}/${filename}.png`,
      fullPage: true
    });

    // Check for layout issues - overlapping elements, content overflow
    const layoutIssues = await page.evaluate(() => {
      const issues = [];
      // Check if main content area exists
      const main = document.querySelector('main') || document.querySelector('.main') || document.querySelector('#content') || document.querySelector('article');
      if (!main) {
        issues.push('No main content area found (no main, .main, #content, or article element)');
      }

      // Check for horizontal overflow
      if (document.documentElement.scrollWidth > document.documentElement.clientWidth + 5) {
        issues.push(`Horizontal overflow detected: scrollWidth=${document.documentElement.scrollWidth} > clientWidth=${document.documentElement.clientWidth}`);
      }

      return issues;
    });

    for (const li of layoutIssues) {
      issues.push({ type: 'LAYOUT_ISSUE', detail: li });
    }

  } catch (err) {
    issues.push({ type: 'PAGE_ERROR', detail: err.message });
  }

  // Remove event listeners by creating fresh context per page
  page.removeAllListeners('console');
  page.removeAllListeners('requestfailed');
  page.removeAllListeners('response');

  return issues;
}

async function main() {
  console.log('=== Blog Page Checker ===\n');

  // Get URLs from sitemap
  console.log('Fetching sitemap...');
  const sitemapUrls = await fetchSitemapUrls();
  console.log(`Found ${sitemapUrls.length} URLs in sitemap`);

  // Launch browser
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
  });
  const page = await context.newPage();

  // Crawl for additional URLs
  console.log('Crawling for additional URLs...');
  const urlSet = new Set(sitemapUrls);
  const additionalUrls = await crawlForAdditionalUrls(page, urlSet);
  for (const u of additionalUrls) {
    urlSet.add(u);
  }

  const allUrls = [...urlSet].sort();
  console.log(`Total unique URLs to check: ${allUrls.length}`);
  if (additionalUrls.size > 0) {
    console.log(`  (${additionalUrls.size} additional URLs found via crawling)`);
  }
  console.log('');

  // Check each page
  const results = [];
  let pagesWithIssues = 0;
  let totalIssues = 0;

  for (let i = 0; i < allUrls.length; i++) {
    const url = allUrls[i];
    const shortUrl = url.replace(BASE_URL, '') || '/';
    process.stdout.write(`[${i + 1}/${allUrls.length}] Checking ${shortUrl}...`);

    const issues = await checkPage(page, url);
    results.push({ url: shortUrl, issues });

    if (issues.length > 0) {
      pagesWithIssues++;
      totalIssues += issues.length;
      console.log(` ${issues.length} issue(s)`);
    } else {
      console.log(' OK');
    }
  }

  await browser.close();

  // Generate report
  console.log('\n' + '='.repeat(70));
  console.log('REPORT SUMMARY');
  console.log('='.repeat(70));
  console.log(`Total pages checked: ${allUrls.length}`);
  console.log(`Pages with issues: ${pagesWithIssues}`);
  console.log(`Total issues found: ${totalIssues}`);
  console.log(`Screenshots saved to: ${SCREENSHOT_DIR}`);
  console.log('');

  // Categorize issues
  const issuesByType = {};
  for (const result of results) {
    for (const issue of result.issues) {
      if (!issuesByType[issue.type]) {
        issuesByType[issue.type] = [];
      }
      issuesByType[issue.type].push({ page: result.url, ...issue });
    }
  }

  if (Object.keys(issuesByType).length > 0) {
    console.log('ISSUES BY TYPE:');
    console.log('-'.repeat(70));

    for (const [type, issues] of Object.entries(issuesByType)) {
      console.log(`\n${type} (${issues.length} occurrence(s)):`);
      for (const issue of issues) {
        console.log(`  Page: ${issue.page}`);
        console.log(`    ${issue.detail}`);
      }
    }
  } else {
    console.log('No issues found! The site looks healthy.');
  }

  // Per-page detail for pages with issues
  const pagesWithProblems = results.filter(r => r.issues.length > 0);
  if (pagesWithProblems.length > 0) {
    console.log('\n' + '-'.repeat(70));
    console.log('DETAILED PER-PAGE ISSUES:');
    console.log('-'.repeat(70));
    for (const result of pagesWithProblems) {
      console.log(`\n${result.url}:`);
      for (const issue of result.issues) {
        console.log(`  [${issue.type}] ${issue.detail}`);
      }
    }
  }

  console.log('\n' + '='.repeat(70));

  // Overall health assessment
  console.log('\nOVERALL HEALTH ASSESSMENT:');
  if (totalIssues === 0) {
    console.log('EXCELLENT - No issues detected across all pages.');
  } else if (totalIssues <= 5) {
    console.log('GOOD - Minor issues detected, mostly cosmetic.');
  } else if (totalIssues <= 20) {
    console.log('FAIR - Several issues found that should be addressed.');
  } else {
    console.log('NEEDS ATTENTION - Significant number of issues found.');
  }

  console.log('');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
