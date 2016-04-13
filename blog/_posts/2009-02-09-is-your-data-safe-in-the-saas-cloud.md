---
id: 109
title: Is your data safe in the SAAS cloud?
date: 2009-02-09T22:34:22+00:00
author: erik
excerpt: |
  Data stored in online "cloud" or "SAAS" applications is necessarily well protected. It's important to understand the risks of using these applications and protect yourself as much as possible.
layout: post
guid: http://www.cto-at-large.com/?p=5
permalink: /2009/02/is-your-data-safe-in-the-saas-cloud/
categories:
  - Information
---
While I was browsing around the web, I found <a title="http://www.craigburton.com/?p=2929" href="http://www.craigburton.com/?p=2929" target="_blank">Craig Burton&#8217;s</a> post about the state of blogging software. He&#8217;s right, 100%. If you&#8217;re trusting some free web service with the only copies of your blog content, you definitely run the risk of losing it all. See [this true story](http://puzzling.org/logs/thoughts/2009/January/3/backup-policies) if you need more convincing.

However, it really only gets worse. Lots of paid services make it very difficult to get a useful snapshot of your data out, as well. For instance, while [NetSuite](http://www.netsuite.com) provides a &#8220;full data export&#8221;, it doesn&#8217;t include any custom fields or custom tables. Given some of your most important data is likely to be in your customizations, will you be able to get your business back up and running quickly if that&#8217;s the data you have? Granted, they do run out of an enterprise-grade data center and make backups, but what if they go out of business?

Google Docs, for instance, can&#8217;t be backed up without a bunch of sketchy thirdy party scripts such as <a title="http://1st-soft.net/gdd/" href="http://1st-soft.net/gdd/" target="_blank">this browser hack</a> or <a title="http://code.google.com/p/gdatacopier/" href="http://code.google.com/p/gdatacopier/" target="_blank">this command line application</a>.

All that said, the key here is risk analysis. Most folks don&#8217;t back up their home computers, so using a SAAS service that runs out of a datacenter (hopefully!) is probably better than leaving stuff sitting around on a single hard drive at home or the office.

Here&#8217;s some of the factors to consider:

  * Does the provider offer an SLA or otherwise warrant their ability to provide your service. What compensation does it offer? Probably not a alot&#8230;
  * Does the provider have on-site redundancy? It&#8217;s not inappropriate to check if they&#8217;re using RAID and what level it is.
  * Does the provider make backups of your data? On what schedule? Are they stored off-site? What&#8217;s their recovery time objective for restoring that data in the event of a disaster?
  * Can you make a backup of your data? Is that backup usable? If you can&#8217;t test the restore, you probably shouldn&#8217;t trust it. In some cases, the sheer size of this makes it impossible, but in most cases it shouldn&#8217;t be. A simple URL you can click to download a full copy of the entire system locally is worth a lot. The free password management site <a title="http://www.clipperz.com/blog" href="http://www.clipperz.com/blog" target="_blank">Clipperz</a> does a great job of this.
  * Is there an exit strategy to an alternative product? Data is great, but what you really want is to keep using your data, and to do that will require an application.

What other questions should you ask of a prospective SAAS cloud application? What other applications out there are doing a good job, or a bad job of providing an exit strategy?