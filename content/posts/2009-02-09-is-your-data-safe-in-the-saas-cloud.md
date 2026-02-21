---
title: "Is your data safe in the SAAS cloud?"
date: 2009-02-09T22:34:22+00:00
author: "Erik LaBianca"
draft: false
description: "Examining the risks of storing data in cloud and SAAS applications and how to protect yourself."
categories:
  - Information
---

While I was browsing around the web, I found [Craig Burton's](http://www.craigburton.com/?p=2929) post about the state of blogging software. He's right, 100%. If you're trusting some free web service with the only copies of your blog content, you definitely run the risk of losing it all. See [this true story](http://puzzling.org/logs/thoughts/2009/January/3/backup-policies) if you need more convincing.

However, it really only gets worse. Lots of paid services make it very difficult to get a useful snapshot of your data out, as well. For instance, while [NetSuite](http://www.netsuite.com) provides a "full data export", it doesn't include any custom fields or custom tables. Given some of your most important data is likely to be in your customizations, will you be able to get your business back up and running quickly if that's the data you have? Granted, they do run out of an enterprise-grade data center and make backups, but what if they go out of business?

Google Docs, for instance, can't be backed up without a bunch of sketchy thirdy party scripts such as [this browser hack](http://1st-soft.net/gdd/) or [this command line application](http://code.google.com/p/gdatacopier/).

All that said, the key here is risk analysis. Most folks don't back up their home computers, so using a SAAS service that runs out of a datacenter (hopefully!) is probably better than leaving stuff sitting around on a single hard drive at home or the office.

Here's some of the factors to consider:

* Does the provider offer an SLA or otherwise warrant their ability to provide your service. What compensation does it offer? Probably not a alot...
* Does the provider have on-site redundancy? It's not inappropriate to check if they're using RAID and what level it is.
* Does the provider make backups of your data? On what schedule? Are they stored off-site? What's their recovery time objective for restoring that data in the event of a disaster?
* Can you make a backup of your data? Is that backup usable? If you can't test the restore, you probably shouldn't trust it. In some cases, the sheer size of this makes it impossible, but in most cases it shouldn't be. A simple URL you can click to download a full copy of the entire system locally is worth a lot. The free password management site [Clipperz](http://www.clipperz.com/blog) does a great job of this.
* Is there an exit strategy to an alternative product? Data is great, but what you really want is to keep using your data, and to do that will require an application.

What other questions should you ask of a prospective SAAS cloud application? What other applications out there are doing a good job, or a bad job of providing an exit strategy?
