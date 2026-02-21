---
title: "How to keep your personal data safe"
date: 2009-02-18T09:14:44+00:00
author: "Erik LaBianca"
draft: true
description: "Simple and straightforward steps to back up your personal data and keep it safe."
categories:
  - Information
tags:
  - Backup
  - Personal computer
---

Everybody worries about it. I've got over 30 GB worth of photo's archived at home, and I wouldn't want to lose a single one of them. The rule I try to follow is very simple. Some folks call it the [LOCKSS](http://www.lockss.org/lockss/Home) principle, which stands for Lots Of Copies Keeps Stuff Safe. Unfortunately, it's a little easier said than done, and many folks I know don't even say it, let alone do it!

Before we get into the details, let's cover a few ground rules.

1. You have data you care about on your personal computer. If you don't care about it, don't back it up, problem solved.
2. Since your data is worth something, you're willing to pay something to keep it. This is important, because the old saying is true, [there's no such thing as a free lunch](http://en.wikipedia.org/wiki/TANSTAAFL).
3. You know where your data is. Unfortunately, sometimes this is easier said than done, but if we start with simple stuff like photos and build out from there you can probably figure it out pretty easily.

Ok so now that's out of the way, how are we going to solve this problem?

It's pretty simple, really.

1. Create a data store. Ideally you would do this on a second hard drive. Internal or external, it's your choice, but usb external ones are cheap and easy so my first recommendation would be that. See the amazon links for a couple options. If you've got a monster system drive or are just feeling cheap, at least do yourself the favor of making a C:\Data folder or something like it so you conclusively where the important stuff is.
2. Consolidate your data. I know it's counterintuitive, but if you don't actively choose what to back up and what not to, your backups will quickly get out of control as you accumulate all the flotsam and jetsam flying around on the interwebs onto your hard drive. This step is as simple as making a few folders in data store, such as Documents, Pictures, and Music, and filling them up with the stuff you care about. If you have several computers, I'd suggest moving all the important data to a central computer and enabling file sharing between them in order to keep things simple.
3. Make some copies!

Making the copies is the fun part.

The simplest solution is to simply use another external USB drive and use old fashioned "copy" to drag the contents of your nice simple data folder to it. As you get more data, you may want something more advanced. There are lots of great free tools to handle keeping multiple copies of directory in sync with other, such as [synctoy](http://en.wikipedia.org/wiki/SyncToy), [rsync](http://samba.anu.edu.au/rsync/), and [unison](http://www.cis.upenn.edu/~bcpierce/unison/). You could also any of thousands of different pieces of backup software. I'd save that for later, however, as right now the goal is simplicity, and it's just about impossible to beat lots of raw copies.

Now that you've got at least two copies in your house, you need something off-site. Again, there's lots of options for this, but unfortunately most aren't free. Personally, I've been using [Mozy](http://mozy.com/) with good results, but I've also heard good things about [Carbonite](http://carbonite.com/), and frankly, if you're up for it you could also use rsync or unison with a remote host or a friends computer. The key here is to get a verifiable copy up and out of your physical location and updated regularly, and the internet is the easiest way to do that by far. Typically, these services will run about $5 per month for unlimited personal data, so piece of mind comes pretty cheap.

Finally, the most important part. Restoring. No backup is worth anything if you can't restore from it. The good news is, since you're just keeping spare copies on a USB drive, testing restore is easy: Take the drive to a friends computer, plug it in, and browse your files! Open a few up and make sure the they work. Then don't forget to bring your drive back home!

The online backup service might be a little trickier to verify restores from, but with Mozy you simply go to their web control panel and browse your backup files. A few clicks will download them to your PC where you can verify whether or not the backup worked.
