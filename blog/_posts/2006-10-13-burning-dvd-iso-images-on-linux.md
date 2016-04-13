---
id: 11
title: Burning DVD ISO images on Linux
date: 2006-10-13T14:34:12+00:00
author: erik
layout: post
guid: http://b.www.ilsw.com/blogs/erik/2006/10/13/burning-dvd-iso-images-on-linux/
permalink: /2006/10/burning-dvd-iso-images-on-linux/
categories:
  - Tweaks
---
So I had a great idea&#8230; Why don&#8217;t I buy a DVD burner and then start using DVD&#8217;s to install software, make backups, etc, etc. Well&#8230; it was a nice idea, but then I had another great idea&#8230; Why don&#8217;t I run windows XP 64 since I have an AMD Opteron system! Turns out none of the wonderful bundled DVD burning software will even install on XP64, let alone run, so there it sat.

I&#8217;d always used the win32 build cdrecord to burn iso images under windows anyway, since the \[ISO Recorder Powertoy\](http://isorecorder.alexfeinman.com/isorecorder.htm) doesn&#8217;t work if windows doesn&#8217;t have a driver for your CD burner, and I&#8217;d been stuck in that situation a few times. I figured cdrecord would work the same for burning DVD&#8217;s. Well, aside from the possible licensing issues, at least with my drive, it doesn&#8217;t. For reference, my drive is this:

<pre>hdd: _NEC DVD_RW ND-3500AG, ATAPI CD/DVD-ROM drive
</pre>

I saw a bunch of documents out on the web saying that cdrecord was able to burn DVD&#8217;s, just like a cd image using \`cdrecord -dao <iso filename>\`. I tried that. Several times. Every DVD was a coaster. Last time I had linux installed, I tried it under linux too, but since it was just a passing fancy I didn&#8217;t dig into it.

Well yesterday I committed to running linux on my desktop for a while to get a project finished since I don&#8217;t have any other linux development suitable machines available currently. I needed a DVD burned, and when I tried to have Dave burn one for me on his windows machine, it didn&#8217;t work either! Something was up! I tried it using the \`cdrecord\`, and made another coaster. But this time I noticed something:

<pre>Device type    : Removable CD-ROM
Version        : 0
Response Format: 2
Capabilities   :
Vendor_info    : '_NEC    '
Identifikation : 'DVD_RW ND-3500AG'
Revision       : '2.18'
Device seems to be: Generic mmc2 &lt;blink>DVD-R/DVD-RW.&lt;/blink>
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
</pre>

Aha! Theres two types of DVDR media, and I have +R. This is a problem. Well, the cdrecord manpage claims autodetection support for plusr devices and media, but when I tried to force a +R driver&#8230;

<pre>erik@bambi ~]$ cdrecord  -dao driver=mmc_dvdplus dev=/dev/hdd /tmp/sol-nv-b49-x86-dvd.iso
Illegal driver type 'mmc_dvdplus'.
</pre>

So therein lies the problem. Well, the good news is that I found the solution. A little bit of googling taught me about a great new program, growisofs (http://fy.chalmers.se/~appro/linux/DVD+RW/). And it&#8217;s even included in FC5, in the dvd+rw-tools package! Well, don&#8217;t ask me why I didn&#8217;t know this before, but growisofs works like a charm.

<pre>[erik@bambi ~]$ growisofs --Z /dev/hdd=/tmp/sol-nv-b49-x86-dvd.iso
Executing 'builtin_dd if=/tmp/sol-nv-b49-x86-dvd.iso of=/dev/hdd obs=32k seek=0'
</pre>

To boot, it even displays progress information AND my disc was readable finally!