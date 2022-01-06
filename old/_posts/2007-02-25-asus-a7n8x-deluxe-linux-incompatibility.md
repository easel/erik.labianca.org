---
id: 23
title: ASUS A7N8x Deluxe Linux (in)compatibility
date: 2007-02-25T12:53:22+00:00
author: erik
layout: post
guid: http://blogs.ilsw.com/erik/2007/02/25/asus-a7n8x-deluxe-linux-incompatibility/
permalink: /2007/02/asus-a7n8x-deluxe-linux-incompatibility/
categories:
  - Hardware
  - HTPC
---
Continuing in the vein of &#8216;stupid hardware problems&#8217;, this week I discovered that the ASUS A7N8x deluxe motherboard I&#8217;ve been trying to nurse along as the backbone of my MythTV PVR basically doesn&#8217;t play nicely with linux, period. Don&#8217;t ask me why I didn&#8217;t try searching the web a little harder before, since most of the threads I&#8217;ve referenced below are ancient. Basically there is something screwy with its ACPI implementation, SATA controller, and just about everything else. 

The issues apparently come and go with varying kernel versions, although I&#8217;m sure many folks don&#8217;t notice them since they don&#8217;t put the machine under heavy load or try to use both ethernet ports. For instance, the 3com and nvidia ethernet controllers absolutely will not stay bound to the same ethX devices after a warm reboot. Disabling one or the other ethernet card in the BIOS eliminates this problem fairly effectively.

Secondly, the machine crashes consistently under heavy I/O load. Sometimes it takes an hour, other times copying a video file from one drive to another will crash it immediately.

I&#8217;ve got it running with only a few crashes per week under FC5 by using the following kernel line 

`kernel /vmlinuz-2.6.18-1.2257.fc5 ro root=/dev/hda2 rhgb acpi=off noapic nolapic`. 

I&#8217;ve not yet tried an FC6 era kernel, but at this point since the general consensus is that the board runs windows reliably, I think I&#8217;m going to try and do some shuffling in order to make using windows on it a possibility.

References:

  * http://web.archive.org/web/20040117183728/http://attila.stevens-tech.edu/~dkopko/a7n8x.txt
  * http://www.nvnews.net/vbulletin/showthread.php?t=6946
  * http://lkml.org/lkml/2003/11/11/217