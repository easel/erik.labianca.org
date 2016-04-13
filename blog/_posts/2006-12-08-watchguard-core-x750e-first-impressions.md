---
id: 19
title: WatchGuard Core x750e first impressions
date: 2006-12-08T23:41:59+00:00
author: erik
layout: post
guid: http://blogs.ilsw.com/erik/2006/12/08/watchguard-core-x750e-first-impressions/
permalink: /2006/12/watchguard-core-x750e-first-impressions/
categories:
  - Hardware
  - Netadmin
---
So I finally got my WatchGuard eval unit. 2 months after I would have liked, but c&#8217;est la vie, I guess they had some employee turnover over there and my box got lost in the shuffle. Upon opening the box, everything looks very nice, and yes, its all red, and very cute looking. Turning it on, however, the LCD screen just says &#8216;Booting OS &#8230;&#8217; and never makes it farther&#8230; Not a great sign.

There is, however a yellow sticker on top that says I have to install Fireware Appliance Software on the device, and that I must hold down the up arrow on the front while turning it on. This I can do. So I do. And the box just says &#8216;Booting OS &#8230;&#8217; and never makes it further. So it&#8217;s time to get all sorta of ninja-hacker-style on it&#8217;s ass. 

I plug in the included serial console cable, install \[tutty\](http://putty.dwalin.ru/) on my newly vistafied workstation and fiddle around until I determine that the watchguard is using 115200,n,8,1. This is what I see:

    
    Press any key to continue.
    
    

So good little monkey that I am, I smash the spacebar a few times, and get this

    
     +-------------------------------------------------------------------------+
     | Red Hat Linux (2.4.26-wgrd)                                             |
     |                                                                         |
     |                                                                         |
     |                                                                         |
     |                                                                         |
     |                                                                         |
     |                                                                         |
     |                                                                         |
     |                                                                         |
     |                                                                         |
     |                                                                         |
     |                                                                         |
     +-------------------------------------------------------------------------+
          Use the ^ and v keys to select which entry is highlighted.
          Press enter to boot the selected OS, 'e' to edit the
          commands before booting, 'a' to modify the kernel arguments
          before booting, or 'c' for a command-line.
    
        GRUB  version 0.93  (638K lower / 515072K upper memory)
    
     [ Minimal BASH-like line editing is supported.  For the first word, TAB
       lists possible command completions.  Anywhere else TAB lists the possible
    
    

Ok, so they&#8217;re running a redhat variant. Well, I knew this was a linux based product, and I know redhat, so in general this is good news. 15 seconds later, grub times out and I see this:

    
      Booting 'Red Hat Linux (2.4.26-wgrd)'
    
    root (hd0,2)
     Filesystem type is ext2fs, partition type 0x83
    kernel /boot/bzImage ro root=/dev/hda3 console=ttyS0,115200 ramdisk_size=256000
     ide=nodma
    
    Error 15: File not found
    
    Press any key to continue...
    

Uh ok. So this isn&#8217;t such great news. Getting really fancy and setting the boot loader to boot (hd0,0)/bzImage gives me this:

<textarea rows="24" cols="80"><br /> root (hd0,2)<br /> Filesystem type is ext2fs, partition type 0x83<br /> kernel (hd0,0)/bzImage ro root=/dev/hda3 console=ttyS0,115200 ramdisk_size=2560<br /> 00 ide=nodma<br /> [Linux-bzImage, setup=0xc00, size=0xbaa40]</p> 

<p>
  Linux version 2.4.26-wgrd (root@X3-130) (gcc version 3.2.2 20030222 (Red Hat Lin ux 3.2.2-5)) #1 Thu Nov 10 07:46:53 PST 2005<br /> BIOS-provided physical RAM map:<br /> BIOS-e820: 0000000000000000 &#8211; 000000000009f800 (usable)<br /> BIOS-e820: 000000000009f800 &#8211; 00000000000a0000 (reserved)<br /> BIOS-e820: 00000000000f0000 &#8211; 0000000000100000 (reserved)<br /> BIOS-e820: 0000000000100000 &#8211; 000000001f800000 (usable)<br /> BIOS-e820: 00000000e0000000 &#8211; 00000000f0000000 (reserved)<br /> BIOS-e820: 00000000fec00000 &#8211; 00000000fec01000 (reserved)<br /> BIOS-e820: 00000000fee00000 &#8211; 00000000fee01000 (reserved)<br /> BIOS-e820: 00000000ffb00000 &#8211; 0000000100000000 (reserved)<br /> 0MB HIGHMEM available.<br /> 504MB LOWMEM available.<br /> On node 0 totalpages: 129024<br /> zone(0): 4096 pages.<br /> zone(1): 124928 pages.<br /> zone(2): 0 pages.<br /> DMI not present.<br /> Kernel command line: ro root=/dev/hda3 console=ttyS0,115200 ramdisk_size=256000 ide=nodma<br /> ide_setup: ide=nodma : Prevented DMA<br /> Initializing CPU#0<br /> Detected 1300.054 MHz processor.<br /> Calibrating delay loop&#8230; 2595.22 BogoMIPS<br /> Memory: 507732k/516096k available (1105k kernel code, 7976k reserved, 240k data, 260k init, 0k highmem)<br /> Dentry cache hash table entries: 65536 (order: 7, 524288 bytes)<br /> Inode cache hash table entries: 32768 (order: 6, 262144 bytes)<br /> Mount cache hash table entries: 512 (order: 0, 4096 bytes)<br /> Buffer cache hash table entries: 32768 (order: 5, 131072 bytes)<br /> Page-cache hash table entries: 131072 (order: 7, 524288 bytes)<br /> CPU: L1 I cache: 32K, L1 D cache: 32K<br /> CPU: L2 cache: 512K<br /> Intel machine check architecture supported.<br /> Intel machine check reporting enabled on CPU#0.<br /> CPU: Intel(R) Celeron(R) M processor 1300MHz stepping 05<br /> Enabling fast FPU save and restore&#8230; done.<br /> Enabling unmasked SIMD FPU exception support&#8230; done.<br /> Checking &#8216;hlt&#8217; instruction&#8230; OK.<br /> POSIX conformance testing by UNIFIX<br /> mtrr: v1.40 (20010327) Richard Gooch (rgooch@atnf.csiro.au)<br /> mtrr: detected mtrr type: Intel<br /> PCI: PCI BIOS revision 3.00 entry at 0xf9f70, last bus=5<br /> PCI: Using configuration type 1<br /> PCI: Probing PCI hardware<br /> PCI: Probing PCI hardware (bus 00)<br /> PCI: Ignoring BAR0-3 of IDE controller 00:1f.1<br /> Transparent bridge &#8211; Intel Corp. 82801BAM/CAM PCI Bridge<br /> PCI: Using IRQ router PIIX/ICH [8086/2641] at 00:1f.0<br /> PCI: Found IRQ 11 for device 00:1c.0<br /> PCI: Sharing IRQ 11 with 00:02.0<br /> PCI: Sharing IRQ 11 with 00:1d.3<br /> PCI: Sharing IRQ 11 with 01:00.0<br /> PCI: Sharing IRQ 11 with 05:00.0<br /> PCI: Found IRQ 12 for device 00:1c.1<br /> PCI: Sharing IRQ 12 with 02:00.0<br /> PCI: Sharing IRQ 12 with 05:01.0<br /> PCI: Found IRQ 5 for device 00:1c.2<br /> PCI: Sharing IRQ 5 with 00:1d.2<br /> PCI: Sharing IRQ 5 with 00:1f.1<br /> PCI: Sharing IRQ 5 with 03:00.0<br /> PCI: Sharing IRQ 5 with 05:02.0<br /> PCI: Found IRQ 10 for device 00:1c.3<br /> PCI: Sharing IRQ 10 with 00:1d.1<br /> PCI: Sharing IRQ 10 with 00:1f.3<br /> PCI: Sharing IRQ 10 with 04:00.0<br /> PCI: Sharing IRQ 10 with 05:03.0<br /> isapnp: Scanning for PnP cards&#8230;<br /> isapnp: No Plug & Play device found<br /> Linux NET4.0 for Linux 2.4<br /> Based upon Swansea University Computer Society NET3.039<br /> Initializing RT netlink socket<br /> Starting kswapd<br /> VFS: Disk quotas vdquot_6.5.1<br /> Journalled Block Device driver loaded<br /> pty: 2048 Unix98 ptys configured<br /> Serial driver version 5.05c (2001-07-08) with MANY_PORTS SHARE_IRQ SERIAL_PCI ISAPNP enabled<br /> ttyS00 at 0x03f8 (irq = 4) is a 16550A<br /> ttyS01 at 0x02f8 (irq = 3) is a 16550A<br /> Real Time Clock Driver v1.10f<br /> RAMDISK driver initialized: 16 RAM disks of 256000K size 1024 blocksize<br /> Uniform Multi-Platform E-IDE driver Revision: 7.00beta4-2.4<br /> ide: Assuming 33MHz system bus speed for PIO modes; override with idebus=xx<br /> ICH6: IDE controller at PCI slot 00:1f.1<br /> PCI: Found IRQ 5 for device 00:1f.1<br /> PCI: Sharing IRQ 5 with 00:1c.2<br /> PCI: Sharing IRQ 5 with 00:1d.2<br /> PCI: Sharing IRQ 5 with 03:00.0<br /> PCI: Sharing IRQ 5 with 05:02.0<br /> ICH6: chipset revision 4<br /> ICH6: not 100% native mode: will probe irqs later<br /> ide0: BM-DMA at 0xf000-0xf007, BIOS settings: hda:pio, hdb:pio<br /> hda: SanDisk SDCFJ-128, ATA DISK drive<br /> ide0 at 0x1f0-0x1f7,0x3f6 on irq 14<br /> hda: attached ide-disk driver.<br /> hda: task_no_data_intr: status=0x51 { DriveReady SeekComplete Error }<br /> hda: task_no_data_intr: error=0x04 { DriveStatusError }<br /> hda: 250880 sectors (128 MB) w/1KiB Cache, CHS=980/8/32<br /> Partition check:<br /> hda: hda1 hda2 hda3 hda4 < hda5 hda6 hda7 hda8 ><br /> NET4: Linux TCP/IP 1.0 for NET4.0<br /> IP Protocols: ICMP, UDP, TCP, IGMP<br /> IP: routing cache hash table of 4096 buckets, 32Kbytes<br /> TCP: Hash tables configured (established 32768 bind 65536)<br /> Linux IP multicast router 0.06 plus PIM-SM<br /> NET4: Unix domain sockets 1.0/SMP for Linux NET4.0.<br /> VFS: Mounted root (ext2 filesystem) readonly.<br /> Freeing unused kernel memory: 260k freed<br /> Warning: unable to open an initial console.<br /> Kernel panic: No init found. Try passing init= option to kernel.<br /> </textarea>
</p>

<p>
  Pretty standard linux boot spam, but it looks like perhaps we&#8217;ve got a bad CF disk, given the seek errors. The real kicker is that punching the serial number from the back of the box into the &#8216;activate online&#8217; page of the WatchGuard website is utterly unsuccessful as well.
</p>

<p>
  In its defense, the red box is at least as good looking as I imagined it, and it IS exactly the solid state Linux 1u rackmount with a lot of Ethernet interfaces i&#8217;ve been looking for. Unfortunately, $3000 + service contracts is an awful lot of money for a cute box with software that doesn&#8217;t work!
</p>

<p>
  <strong>Update 2006-12-10</strong>
</p>

<p>
  I spent too much of my weekend poking around with this and posting on the [WatchGuard forum](http://forum.watchguard.com), but I&#8217;m pretty convinced that this machine is just DOA. I can&#8217;t get link lights on any of the Ethernet interfaces (sort of a show stopper for a firewall), and in addition the compact flash card doesn&#8217;t seem to be loaded with the rescue image, let alone a full firewall OS. I was at least able to get onto the livesecurity website, turns out I&#8217;d transposed two digits of the serial number while reading it leaning over the firewall, and caught it when I recopied it from the box.
</p>

<p>
  Being able to get on the website means I was able to get the software, and found out that it requires an explorer extension to complete the installer, which means it won&#8217;t finish installing on xp64 or vista64. None of it seemed to want to run on vista either, but putting it into compatability mode seems to bring it to the same point as xp, meaning it won&#8217;t finish installing because I can&#8217;t activate the toolbar in a way it can find it since it installs into 32 bit explorer. The good news is that the important parts of the install do seem to have completed, at least all the files are on the disk. I was able to try to use fbxinstall to reinstall my CF image, but apparently that does&#8217;nt work on the e-series boxes, so I don&#8217;t know if it failed due to bum hardware or not. Maybe its just me, but it seems making your installer dependent on activating a shell extension, for a firewall product of all things, seems like some dumb decision making.
</p>

<p>
  I&#8217;ve opened a support ticket and started some dialog, but I&#8217;m not holding a lot of hope that I&#8217;ll actually get a replacement unit in here in time to have it usable over the holidays. The responses I&#8217;ve gotten to my post on the forums indicate that the general user base of these boxes, &#8216;experts&#8217; included, doesn&#8217;t really have a clue what the underpinnings of the system look like, which is I guess for the most part a good thing. It does, however, tend to reduce the usefulness of their responses to my questions. DOA units also seems to be outside the radar of the average forum denizen, so I&#8217;m hoping my box is an isolated case. It does start making HA failover look pretty nice though.
</p>

<p>
  <strong>Update 2006-12-11</strong>
</p>

<p>
  I got a call from a &#8216;fixer&#8217; at WatchGuard who has arranged for me to get a new unit overnighted. He concurs with my assessment that the unit is very much DoA. Kudo&#8217;s to my sales guy and watchguard for stepping up on this one, I&#8217;m awaiting a functional unit with baited breath!
</p>