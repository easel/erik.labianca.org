# Agentic Development Guide

This document describes conventions for AI agents working in this repository.

## Project Overview

- **Site:** [erik.labianca.org](https://erik.labianca.org/)
- **Generator:** [Hugo](https://gohugo.io/) with [PaperMod](https://github.com/adityatelange/hugo-PaperMod) theme
- **Hosting:** GitHub Pages via GitHub Actions
- **Repo layout:** Bare-repo + worktree via [worktrunk](https://github.com/max-sixty/worktrunk) (`wt`)

## Repository Structure

```
content/
  posts/            # Blog posts (markdown)
  about.md          # About page
  archives.md       # Archive layout page
  search.md         # Search layout page
archetypes/
  default.md        # Template for hugo new
layouts/
  shortcodes/
    details.html    # Collapsible <details> sections (use instead of raw HTML)
themes/PaperMod/    # Theme (git submodule — do not edit)
static/             # Static assets (images, files)
old/                # Legacy WordPress content (_posts, _config.yml) — reference only
hugo.yaml           # Site configuration
justfile            # Task runner commands (just)
lefthook.yml        # Pre-commit hook config
.rumdl.toml         # Markdown linter config (rumdl)
check-pages.mjs     # Playwright page checker (crawls sitemap, screenshots pages)
package.json        # Node deps (playwright for page checks)
.github/workflows/
  hugo.yml          # Deploy to GitHub Pages on push to master
  pr.yml            # PR check — validates Hugo build on pull requests
```

## Branching and Merging

The `next` branch is the working branch. Changes are merged to `master`
for deployment. Use regular merges (not squash) to keep histories joined —
squash merges break shared history and cause add/add conflicts on subsequent
merges.

### Worktrees

This repo uses worktrunk for branch/worktree management:

```bash
wt switch -c my-feature       # create branch + worktree
wt switch my-feature           # switch to existing worktree
wt list                        # see all worktrees
wt merge                       # squash + merge + cleanup
```

For parallel agent work:
```bash
wt switch -x claude -c task-name -- 'description of work'
```

After creating a new worktree, run `lefthook install` inside it to activate
pre-commit hooks (hooks are per-worktree).

## Creating a New Blog Post

```bash
just new my-slug    # creates content/posts/YYYY-MM-DD-my-slug.md
```

Or manually: `hugo new content posts/YYYY-MM-DD-slug-title.md`

This creates a draft post from the archetype. Front matter format:

```yaml
---
title: "Post Title"
date: 2026-02-20
draft: false
tags: ["tag1", "tag2"]
categories: ["category"]
description: "Brief description for RSS and social cards"
composition: human-authored   # or model-primary / mixed — see Content Provenance
---
```

### Content Guidelines

- Use standard markdown, not HTML — raw HTML in markdown triggers build warnings
  that block commits (via the lefthook lint check)
- For collapsible sections, use the `details` shortcode instead of raw
  `<details>`/`<summary>` tags:
  ```
  {{</* details "Click to expand" */>}}
  Content here (supports full markdown)
  {{</* /details */>}}
  ```
- Use fenced code blocks with language identifiers (```bash, ```go, etc.)
- Place images in `static/images/posts/` and reference as `/images/posts/filename.png`
- Keep front matter `description` under 160 characters for SEO
- Set `draft: true` while working, `draft: false` when ready to publish

### Content Policy

This is a technical blog. Only publish **pure technical posts** — hands-on
problem-solving, benchmarks, configuration guides, debugging notes. The
following types of content are drafted (hidden) and should stay that way:

- **Management/business opinion** — naive takes on org theory, hiring advice, vendor tips
- **Explainer/overview pieces** — VoIP, NAS, virtualization, DVCS advocacy
- **Industry commentary** — opinion on industry news, social media takes
- **Blog housekeeping** — "first post", location changes, site merges

The imported WordPress content has broken external image references that have
been removed. Do not re-add external image URLs from the original WordPress
site (erik.labianca.org/blog/wp-content/) — they are dead.

## Content Provenance (innsigle)

Every file matched by `content_globs` in `.innsigle/config.json` carries a
signed claim in `.innsigle/public/claims/`, and each page renders a colophon
showing who signed it and how it was composed. Both are published under
`/.well-known/innsigle/`.

**If you change anything under `content/`, you must re-seal.**

```bash
just seal          # re-sign (needs 1Password unlocked)
just verify-seals  # check; runs in pre-commit and in CI
```

### Why this needs a check rather than care

The failure is silent. The colophon partial re-hashes the markdown source at
build time and compares it to the digest in the claim. If they differ it
renders **nothing** — no seal, no error, and the Hugo build still succeeds. A
site that has quietly lost every seal looks exactly like one that never had
them. `just verify-seals` is the only thing that notices, which is why it runs
in pre-commit and as a CI step in both workflows.

### Rules

- `composition:` in front matter is authoritative and must be one of
  `model-primary`, `human-authored`, `mixed`. Sealing derives the claim from
  it, and `innsigle doctor --hugo` fails if the two disagree.
- Be accurate about it. A post drafted by a model and then edited is `mixed`,
  not `human-authored`. The point of the seal is that the label is true.
- Commit the regenerated files in `.innsigle/public/claims/` alongside the
  content change. They are what CI verifies and what the site serves.
- Never commit a private key. Signing material lives in 1Password, referenced
  by `onepassword.private_key_ref` in `.innsigle/config.json`.
- `just verify-seals` needs no secrets, so it is safe everywhere. `just seal`
  needs the private key and can only run locally.

### Setup

innsigle is not published on npm. Install the pinned version:

```bash
npm i -g github:DocumentDrivenDX/innsigle#v0.6.1
```

CI installs the same tag. When bumping it, change `justfile`,
`.github/workflows/pr.yml` and `.github/workflows/hugo.yml` together.

See `.innsigle/AGENTS.md` for the tool's own layout and contract.

## Developer Tooling

### Task Runner (just)

[just](https://github.com/casey/just) is the command runner. Run `just` with
no arguments to see available commands:

```bash
just serve    # dev server at localhost:1313 with drafts (correct baseURL)
just build    # production build (matches CI)
just lint     # Hugo warnings + markdown lint (rumdl)
just fmt      # autoformat markdown files
just new foo  # create post content/posts/YYYY-MM-DD-foo.md
just check    # run Playwright page checks against local server
just deploy   # push next → master (triggers deploy)

just seal         # re-sign content after editing (needs 1Password)
just verify-seals # check every seal (public keys only, also runs in CI)
```

### baseURL gotcha

`hugo.yaml` sets `baseURL: https://erik.labianca.org/`. Running bare
`hugo server` without overriding this causes the browser to redirect to
the production site instead of localhost. **Always use `just serve`** — it
passes `--baseURL http://localhost:1313 --appendPort=false` to fix this.

### Pre-commit Hooks (lefthook)

[lefthook](https://github.com/evilmartians/lefthook) runs `hugo --gc --minify`
on every commit to catch build errors before they reach CI.

Setup (one-time per worktree): `lefthook install`

Checks that run on every commit:
- **hugo-build** — build must succeed
- **hugo-lint** — build must produce zero warnings (catches raw HTML, deprecated
  features, etc.). Two known PaperMod deprecations are filtered; see `justfile`.
- **markdown-lint** — `rumdl check content/` must pass (line length, code block
  languages, bare URLs, heading structure, etc.)
- **innsigle-seals** — `just verify-seals`; every claim must match its source
  and its front matter. Fix with `just seal`, then commit the updated claims.

If a commit is blocked, fix the issue and commit again. Run `just fmt` to
autofix most markdown issues.

### Markdown Linter (rumdl)

[rumdl](https://github.com/rvben/rumdl) is a Rust-based markdown linter and
formatter. Config lives in `.rumdl.toml`.

```bash
just lint     # check Hugo warnings + markdown lint
just fmt      # autoformat markdown (rewrap, fix code blocks, etc.)
rumdl check content/   # lint only
rumdl fmt content/     # format only
```

Key rules enforced:
- **MD013** — lines must not exceed 80 characters (code blocks and tables
  excluded)
- **MD040** — fenced code blocks must have a language identifier
- **MD034** — bare URLs must use angle brackets or link syntax
- **MD071** — blank line required after YAML front matter

### Page Checker (check-pages.mjs)

`just check` runs a Playwright-based page checker that:
1. Fetches all URLs from the sitemap
2. Crawls for additional URLs (archives, search, pagination)
3. Checks each page for: HTTP errors, blank pages, broken images, missing
   alt text, console errors, failed requests, layout issues (horizontal overflow)
4. Saves full-page screenshots to `/tmp/blog-screenshots/`

Requires `hugo server` running on `localhost:1313` (use `just serve` in
another terminal). Install deps first: `npm install`.

## Preview and Build

```bash
just serve                  # dev server with drafts at localhost:1313 (preferred)
just build                  # production build
hugo server -D              # dev server with drafts (bare — has baseURL redirect issue)
hugo server                 # dev server without drafts
hugo                        # build to public/
```

The dev server live-reloads on file changes.

## CI/CD

- **PR checks** (`pr.yml`): verifies innsigle seals, then builds and lints.
  All must pass before merging.
- **Deploy** (`hugo.yml`): On push to `master`, verifies seals, lints, builds
  and deploys to GitHub Pages at `erik.labianca.org` (custom domain via CNAME
  to `easel.github.io`).

Both workflows install innsigle from a pinned git tag and run
`just verify-seals` before building, so a post edited without re-sealing fails
CI instead of deploying with no seal.

Hugo is pinned to **0.167.0 extended** in both workflows, and local Hugo should
match. The pin, the `locale` config key and the PaperMod submodule have to move
together — Hugo deprecated `.Language.LanguageCode` and
`.Language.LanguageDirection` in 0.158.0 and upstream PaperMod still calls
both.

## Theme Customization

The PaperMod theme is a git submodule. To override theme templates:
1. Copy the template from `themes/PaperMod/layouts/` to `layouts/`
2. Edit the copy — Hugo uses your local `layouts/` over the theme's

Do NOT edit files inside `themes/PaperMod/` directly.

## Quality Checks Before Merging

1. `just build` completes without errors
2. `just lint` passes
3. `just verify-seals` passes — run `just seal` first if you touched `content/`
4. `just serve` — all posts render correctly, and each shows its colophon
5. `just check` — no broken pages, images, or layout issues (requires local server running)
6. RSS feed works (`/index.xml`); `/posts/index.xml` and `/agent/index.xml` too
7. Front matter is complete (title, date, tags, description, composition)

## Content Syndication

Posts can include pre-written social media text via `syndication:` front matter
fields. See [SYNDICATION.md](./SYNDICATION.md) for the full strategy.

### Front matter fields

```yaml
syndication:
  twitter_text: "Short text (~280 chars) to accompany the blog link on X"
  linkedin_hook: |
    Standalone LinkedIn post. Delivers the key insight natively.
    No link in body. Soft CTA at end.
```

Both fields are optional. When present, the share UI on each post shows
collapsible sections with the pre-written text and copy buttons.

- **`twitter_text`** — Used as the pre-filled tweet text (with blog link
  appended automatically). Falls back to post title if absent.
- **`linkedin_hook`** — Standalone post for LinkedIn. Should deliver value
  without requiring a click-through. Displayed in a copyable text block.

### Implementation files

- `layouts/partials/share_icons.html` — Share buttons + syndication text UI
- `layouts/partials/extend_footer.html` — Copy-to-clipboard JavaScript
- `assets/css/extended/syndication.css` — Styling (auto-loaded by PaperMod)

Activated by `showShareButtons: true` in `hugo.yaml`.

## Agent Coordination

When multiple agents work in parallel:
- Each agent should work in its own worktree (`wt switch -c task-name`)
- Run `lefthook install` after creating a new worktree
- Avoid editing the same files across worktrees
- Configuration changes (hugo.yaml) should be coordinated — only one agent at a time
- Merge frequently to avoid drift
