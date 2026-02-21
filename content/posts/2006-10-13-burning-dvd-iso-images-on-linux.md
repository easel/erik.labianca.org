---
title: "Burning DVD ISO images on Linux"
date: 2006-10-13T14:34:12+00:00
author: "Erik LaBianca"
draft: false
categories:
  - Tweaks
description: "How to burn DVD+R ISO images on Linux using growisofs when cdrecord fails with DVD+R media."
---

So I had a great idea... Why don't I buy a DVD burner and then start using DVD's to install software, make backups, etc, etc. Well... it was a nice idea, but then I had another great idea... Why don't I run windows XP 64 since I have an AMD Opteron system! Turns out none of the wonderful bundled DVD burning software will even install on XP64, let alone run, so there it sat.

I'd always used the win32 build cdrecord to burn iso images under windows anyway, since the [ISO Recorder Powertoy](http://isorecorder.alexfeinman.com/isorecorder.htm) doesn't work if windows doesn't have a driver for your CD burner, and I'd been stuck in that situation a few times. I figured cdrecord would work the same for burning DVD's. Well, aside from the possible licensing issues, at least with my drive, it doesn't. For reference, my drive is this:

```
hdd: _NEC DVD_RW ND-3500AG, ATAPI CD/DVD-ROM drive
```

I saw a bunch of documents out on the web saying that cdrecord was able to burn DVD's, just like a cd image using `cdrecord -dao <iso filename>`. I tried that. Several times. Every DVD was a coaster. Last time I had linux installed, I tried it under linux too, but since it was just a passing fancy I didn't dig into it.

Well yesterday I committed to running linux on my desktop for a while to get a project finished since I don't have any other linux development suitable machines available currently. I needed a DVD burned, and when I tried to have Dave burn one for me on his windows machine, it didn't work either! Something was up! I tried it using the `cdrecord`, and made another coaster. But this time I noticed something:

```
Device type    : Removable CD-ROM
Version        : 0
Response Format: 2
Capabilities   :
Vendor_info    : '_NEC    '
Identifikation : 'DVD_RW ND-3500AG'
Revision       : '2.18'
Device seems to be: Generic mmc2 DVD-R/DVD-RW.
cdrecord: Found DVD media: using cdr_mdvd.
Using Session At Once (SAO) for DVD mode.
Using Session At Once (SAO) for DVD mode.
Using Session At Once (SAO) for DVD mode.
Using generic SCSI-3/mmc DVD-R(W) driver (mmc_mdvd).
Driver flags   : SWABAUDIO BURNFREE
Supported modes: PACKET SAO
scsi_set_streaming
Speed set to 8467 KB/s
Starting to write CD/DVD at speed   6.0 in dummy SAO mode for single session.
```

Aha! Theres two types of DVDR media, and I have +R. This is a problem. Well, the cdrecord manpage claims autodetection support for plusr devices and media, but when I tried to force a +R driver...

```
erik@bambi ~]$ cdrecord  -dao driver=mmc_dvdplus dev=/dev/hdd /tmp/sol-nv-b49-x86-dvd.iso
Illegal driver type 'mmc_dvdplus'.
```

So therein lies the problem. Well, the good news is that I found the solution. A little bit of googling taught me about a great new program, growisofs ([http://fy.chalmers.se/~appro/linux/DVD+RW/](http://fy.chalmers.se/~appro/linux/DVD+RW/)). And it's even included in FC5, in the dvd+rw-tools package! Well, don't ask me why I didn't know this before, but growisofs works like a charm.

```
[erik@bambi ~]$ growisofs --Z /dev/hdd=/tmp/sol-nv-b49-x86-dvd.iso
Executing 'builtin_dd if=/tmp/sol-nv-b49-x86-dvd.iso of=/dev/hdd obs=32k seek=0'
```

To boot, it even displays progress information AND my disc was readable finally!
