---
id: 56
title: How to keep your personal data safe
date: 2009-02-18T09:14:44+00:00
author: erik
excerpt: "Everybody knows they should be backing up their personal data, but nobody does it. Here's some simple and straightforward steps to actually doing it."
layout: post
guid: http://www.cto-at-large.com/?p=56
permalink: /2009/02/how-to-keep-your-personal-data-safe/
aktt_notify_twitter:
  - yes
aktt_tweeted:
  - 1
categories:
  - Information
tags:
  - Backup
  - Personal computer
---
Everybody worries about it. I&#8217;ve got over 30 GB worth of photo&#8217;s archived at home, and I wouldn&#8217;t want to lose a single one of them. The rule I try to follow is very simple. Some folks call it the <a title="http://www.lockss.org/lockss/Home" href="http://www.lockss.org/lockss/Home" target="_blank">LOCKSS</a> principle, which stands for Lots Of Copies Keeps Stuff Safe. Unfortunately, it&#8217;s a little easier said than done, and many folks I know don&#8217;t even say it, let alone do it!

<div class="zemanta-img" style="margin: 1em; display: block;">
  <div style="width: 120px" class="wp-caption alignleft">
    <img title="Maybe he lost his data..." src="http://cache.daylife.com/imageserve/04bu0diaoe85T/110x150.jpg" alt="Maybe he lost his data..." width="110" height="150" />
    
    <p class="wp-caption-text">
      Image by Getty Images via Daylife
    </p>
  </div>
</div>

Before we get into the details, let&#8217;s cover a few ground rules.

  1. You have data you care about on your personal computer. If you don&#8217;t care about it, don&#8217;t back it up, problem solved.
  2. Since your data is worth something, you&#8217;re willing to pay something to keep it. This is important, because the old saying is true, <a class="zem_slink" title="TANSTAAFL" rel="wikipedia" href="http://en.wikipedia.org/wiki/TANSTAAFL">there&#8217;s no such thing as a free lunch</a>.
  3. You know where your data is. Unfortunately, sometimes this is easier said than done, but if we start with simple stuff like photos and build out from there you can probably figure it out pretty easily.

Ok so now that&#8217;s out of the way, how are we going to solve this problem?



It&#8217;s pretty simple, really.

  1. Create a data store. Ideally you would do this on a second hard drive. Internal or external, it&#8217;s your choice, but usb external ones are cheap and easy so my first recommendation would be that. See the amazon links for a couple options. If you&#8217;ve got a monster system drive or are just feeling cheap, at least do yourself the favor of making a C:\Data folder or something like it so you conclusively where the important stuff is.
  2. Consolidate your data. I know it&#8217;s counterintuitive, but if you don&#8217;t actively choose what to back up and what not to, your backups will quickly get out of control as you accumulate all the flotsam and jetsam flying around on the interwebs onto your hard drive. This step is as simple as making a few folders in data store, such as Documents, Pictures, and Music, and filling them up with the stuff you care about. If you have several computers, I&#8217;d suggest moving all the important data to a central computer and enabling file sharing between them in order to keep things simple.
  3. Make some copies!

Making the copies is the fun part.



The simplest solution is to simply use another external USB drive and use old fashioned &#8220;copy&#8221; to drag the contents of your nice simple data folder to it. As you get more data, you may want something more advanced. There are lots of great free tools to handle keeping multiple copies of directory in sync with other, such as <a title="http://en.wikipedia.org/wiki/SyncToy" href="http://en.wikipedia.org/wiki/SyncToy" target="_blank">synctoy</a>,&nbsp; <a title="http://samba.anu.edu.au/rsync/" href="http://samba.anu.edu.au/rsync/" target="_blank">rsync</a>, and <a title="http://www.cis.upenn.edu/~bcpierce/unison/" href="http://www.cis.upenn.edu/%7Ebcpierce/unison/" target="_blank">unison</a>. You could also any of thousands of different pieces of backup software. I&#8217;d save that for later, however, as right now the goal is simplicity, and it&#8217;s just about impossible to beat lots of raw copies.

Now that you&#8217;ve got at least two copies in your house, you need something off-site. Again, there&#8217;s lots of options for this, but unfortunately most aren&#8217;t free. Personally, I&#8217;ve been using <a title="http://mozy.com/" href="http://mozy.com/" target="_blank">Mozy</a> with good results, but I&#8217;ve also heard good things about <a title="http://carbonite.com/" href="http://carbonite.com/" target="_blank">Carbonite</a>, and frankly, if you&#8217;re up for it you could also use rsync or unison with a remote host or a friends computer. The key here is to get a verifiable copy up and out of your physical location and updated regularly, and the internet is the easiest way to do that by far. Typically, these services will run about $5 per month for unlimited personal data, so piece of mind comes pretty cheap.

Finally, the most important part. Restoring. No backup is worth anything if you can&#8217;t restore from it. The good news is, since you&#8217;re just keeping spare copies on a USB drive, testing restore is easy: Take the drive to a friends computer, plug it in, and browse your files! Open a few up and make sure the they work. Then don&#8217;t forget to bring your drive back home!

The online backup service might be a little trickier to verify restores from, but with Mozy you simply go to their web control panel and browse your backup files. A few clicks will download them to your PC where you can verify whether or not the backup worked.

<h6 class="zemanta-related-title" style="font-size: 1em;">
  Related articles by Zemanta
</h6>

<ul class="zemanta-article-ul">
  <li class="zemanta-article-ul-li">
    <a href="http://r.zemanta.com/?u=http%3A//www.usnews.com/blogs/daves-download/2009/1/7/clickfree-backup-moves-off-pricey-disks-to-pricey-cable.html%3Fs_cid%3Drss%3Adaves-download%3Aclickfree-backup-moves-off-pricey-disks-to-pricey-cable&a=2553236&rid=320591e2-051a-4d97-855e-6bc5d73e6266&e=3eb8347bcc5c85f862696bbc930c1e49">Clickfree Backup Moves Off Pricey Disks to Pricey Cable</a> (usnews.com)
  </li>
  <li class="zemanta-article-ul-li">
    <a href="http://www.theregister.co.uk/2009/02/10/symantec_consumer_cloud/">Symantec takes on Mozy with cloud backup</a> (theregister.co.uk)
  </li>
  <li class="zemanta-article-ul-li">
    <a href="http://www.labnol.org/gadgets/strange-clicking-sound-in-hard-drive/5377/">Is Your Hard Disk Making Strange Clicking Sounds?</a> (labnol.org)
  </li>
  <li class="zemanta-article-ul-li">
    <a href="http://www.techcrunch.com/2008/12/09/backblaze-brings-its-dead-simple-online-backup-to-the-mac/">Backblaze Brings Its Dead Simple Online Backup To The Mac</a> (techcrunch.com)
  </li>
  <li class="zemanta-article-ul-li">
    <a href="http://designmind.frogdesign.com/blog/sandisk-launches-the-world%25E2%2580%2599s-first-backup-usb-flash-drives.html">SanDisk Launches the World&#8217;s First Backup USB Flash Drives</a> (designmind.frogdesign.com)
  </li>
  <li class="zemanta-article-ul-li">
    <a href="http://ptech.allthingsd.com/20090107/clickfree-backs-up-your-files-easily-so-youre-not-toast/">Clickfree Backs Up Your Files Easily, So You&#8217;re Not Toast [Personal Technology]</a> (ptech.allthingsd.com)
  </li>
  <li class="zemanta-article-ul-li">
    <a href="http://johngannonblog.com/2009/02/05/online-backup-is-the-trojan-horse-of-the-cloud/">Online backup is the Trojan Horse of the cloud</a> (johngannonblog.com)
  </li>
</ul>

<div style="margin-top: 10px; height: 15px;" class="zemanta-pixie">
  <a class="zemanta-pixie-a" href="http://reblog.zemanta.com/zemified/320591e2-051a-4d97-855e-6bc5d73e6266/" title="Zemified by Zemanta"><img style="border: medium none ; float: right;" class="zemanta-pixie-img" src="http://img.zemanta.com/reblog_e.png?x-id=320591e2-051a-4d97-855e-6bc5d73e6266" alt="Reblog this post [with Zemanta]" /></a>
</div>