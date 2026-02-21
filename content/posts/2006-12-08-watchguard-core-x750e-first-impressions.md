---
title: "WatchGuard Core x750e first impressions"
date: 2006-12-08T23:41:59+00:00
author: "Erik LaBianca"
draft: false
description: "First impressions of the WatchGuard Core x750e firewall, which arrived DOA with a bad compact flash disk."
categories:
  - Hardware
  - Netadmin
---
So I finally got my WatchGuard eval unit. 2 months after I would have liked, but c'est la vie, I guess they had some employee turnover over there and my box got lost in the shuffle. Upon opening the box, everything looks very nice, and yes, its all red, and very cute looking. Turning it on, however, the LCD screen just says 'Booting OS ...' and never makes it farther... Not a great sign.

There is, however a yellow sticker on top that says I have to install Fireware Appliance Software on the device, and that I must hold down the up arrow on the front while turning it on. This I can do. So I do. And the box just says 'Booting OS ...' and never makes it further. So it's time to get all sorta of ninja-hacker-style on it's ass.

I plug in the included serial console cable, install [tutty](http://putty.dwalin.ru/) on my newly vistafied workstation and fiddle around until I determine that the watchguard is using 115200,n,8,1. This is what I see:

```
Press any key to continue.
```

So good little monkey that I am, I smash the spacebar a few times, and get this

```
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
```

Ok, so they're running a redhat variant. Well, I knew this was a linux based product, and I know redhat, so in general this is good news. 15 seconds later, grub times out and I see this:

```
  Booting 'Red Hat Linux (2.4.26-wgrd)'

root (hd0,2)
 Filesystem type is ext2fs, partition type 0x83
kernel /boot/bzImage ro root=/dev/hda3 console=ttyS0,115200 ramdisk_size=256000
 ide=nodma

Error 15: File not found

Press any key to continue...
```

Uh ok. So this isn't such great news. Getting really fancy and setting the boot loader to boot (hd0,0)/bzImage gives me this:

```text
root (hd0,2)
 Filesystem type is ext2fs, partition type 0x83
kernel (hd0,0)/bzImage ro root=/dev/hda3 console=ttyS0,115200 ramdisk_size=256000
 ide=nodma
[Linux-bzImage, setup=0xc00, size=0xbaa40]

Linux version 2.4.26-wgrd (root@X3-130) (gcc version 3.2.2 20030222 (Red Hat Linux 3.2.2-5)) #1 Thu Nov 10 07:46:53 PST 2005
BIOS-provided physical RAM map:
BIOS-e820: 0000000000000000 - 000000000009f800 (usable)
BIOS-e820: 000000000009f800 - 00000000000a0000 (reserved)
BIOS-e820: 00000000000f0000 - 0000000000100000 (reserved)
BIOS-e820: 0000000000100000 - 000000001f800000 (usable)
BIOS-e820: 00000000e0000000 - 00000000f0000000 (reserved)
BIOS-e820: 00000000fec00000 - 00000000fec01000 (reserved)
BIOS-e820: 00000000fee00000 - 00000000fee01000 (reserved)
BIOS-e820: 00000000ffb00000 - 0000000100000000 (reserved)
0MB HIGHMEM available.
504MB LOWMEM available.
On node 0 totalpages: 129024
zone(0): 4096 pages.
zone(1): 124928 pages.
zone(2): 0 pages.
DMI not present.
Kernel command line: ro root=/dev/hda3 console=ttyS0,115200 ramdisk_size=256000 ide=nodma
ide_setup: ide=nodma : Prevented DMA
Initializing CPU#0
Detected 1300.054 MHz processor.
Calibrating delay loop... 2595.22 BogoMIPS
Memory: 507732k/516096k available (1105k kernel code, 7976k reserved, 240k data, 260k init, 0k highmem)
Dentry cache hash table entries: 65536 (order: 7, 524288 bytes)
Inode cache hash table entries: 32768 (order: 6, 262144 bytes)
Mount cache hash table entries: 512 (order: 0, 4096 bytes)
Buffer cache hash table entries: 32768 (order: 5, 131072 bytes)
Page-cache hash table entries: 131072 (order: 7, 524288 bytes)
CPU: L1 I cache: 32K, L1 D cache: 32K
CPU: L2 cache: 512K
Intel machine check architecture supported.
Intel machine check reporting enabled on CPU#0.
CPU: Intel(R) Celeron(R) M processor 1300MHz stepping 05
Enabling fast FPU save and restore... done.
Enabling unmasked SIMD FPU exception support... done.
Checking 'hlt' instruction... OK.
POSIX conformance testing by UNIFIX
mtrr: v1.40 (20010327) Richard Gooch (rgooch@atnf.csiro.au)
mtrr: detected mtrr type: Intel
PCI: PCI BIOS revision 3.00 entry at 0xf9f70, last bus=5
PCI: Using configuration type 1
PCI: Probing PCI hardware
PCI: Probing PCI hardware (bus 00)
PCI: Ignoring BAR0-3 of IDE controller 00:1f.1
Transparent bridge - Intel Corp. 82801BAM/CAM PCI Bridge
PCI: Using IRQ router PIIX/ICH [8086/2641] at 00:1f.0
PCI: Found IRQ 11 for device 00:1c.0
PCI: Sharing IRQ 11 with 00:02.0
PCI: Sharing IRQ 11 with 00:1d.3
PCI: Sharing IRQ 11 with 01:00.0
PCI: Sharing IRQ 11 with 05:00.0
PCI: Found IRQ 12 for device 00:1c.1
PCI: Sharing IRQ 12 with 02:00.0
PCI: Sharing IRQ 12 with 05:01.0
PCI: Found IRQ 5 for device 00:1c.2
PCI: Sharing IRQ 5 with 00:1d.2
PCI: Sharing IRQ 5 with 00:1f.1
PCI: Sharing IRQ 5 with 03:00.0
PCI: Sharing IRQ 5 with 05:02.0
PCI: Found IRQ 10 for device 00:1c.3
PCI: Sharing IRQ 10 with 00:1d.1
PCI: Sharing IRQ 10 with 00:1f.3
PCI: Sharing IRQ 10 with 04:00.0
PCI: Sharing IRQ 10 with 05:03.0
isapnp: Scanning for PnP cards...
isapnp: No Plug & Play device found
Linux NET4.0 for Linux 2.4
Based upon Swansea University Computer Society NET3.039
Initializing RT netlink socket
Starting kswapd
VFS: Disk quotas vdquot_6.5.1
Journalled Block Device driver loaded
pty: 2048 Unix98 ptys configured
Serial driver version 5.05c (2001-07-08) with MANY_PORTS SHARE_IRQ SERIAL_PCI ISAPNP enabled
ttyS00 at 0x03f8 (irq = 4) is a 16550A
ttyS01 at 0x02f8 (irq = 3) is a 16550A
Real Time Clock Driver v1.10f
RAMDISK driver initialized: 16 RAM disks of 256000K size 1024 blocksize
Uniform Multi-Platform E-IDE driver Revision: 7.00beta4-2.4
ide: Assuming 33MHz system bus speed for PIO modes; override with idebus=xx
ICH6: IDE controller at PCI slot 00:1f.1
PCI: Found IRQ 5 for device 00:1f.1
PCI: Sharing IRQ 5 with 00:1c.2
PCI: Sharing IRQ 5 with 00:1d.2
PCI: Sharing IRQ 5 with 03:00.0
PCI: Sharing IRQ 5 with 05:02.0
ICH6: chipset revision 4
ICH6: not 100% native mode: will probe irqs later
ide0: BM-DMA at 0xf000-0xf007, BIOS settings: hda:pio, hdb:pio
hda: SanDisk SDCFJ-128, ATA DISK drive
ide0 at 0x1f0-0x1f7,0x3f6 on irq 14
hda: attached ide-disk driver.
hda: task_no_data_intr: status=0x51 { DriveReady SeekComplete Error }
hda: task_no_data_intr: error=0x04 { DriveStatusError }
hda: 250880 sectors (128 MB) w/1KiB Cache, CHS=980/8/32
Partition check:
hda: hda1 hda2 hda3 hda4 < hda5 hda6 hda7 hda8 >
NET4: Linux TCP/IP 1.0 for NET4.0
IP Protocols: ICMP, UDP, TCP, IGMP
IP: routing cache hash table of 4096 buckets, 32Kbytes
TCP: Hash tables configured (established 32768 bind 65536)
Linux IP multicast router 0.06 plus PIM-SM
NET4: Unix domain sockets 1.0/SMP for Linux NET4.0.
VFS: Mounted root (ext2 filesystem) readonly.
Freeing unused kernel memory: 260k freed
Warning: unable to open an initial console.
Kernel panic: No init found. Try passing init= option to kernel.
```

Pretty standard linux boot spam, but it looks like perhaps we've got a bad CF disk, given the seek errors. The real kicker is that punching the serial number from the back of the box into the 'activate online' page of the WatchGuard website is utterly unsuccessful as well.

In its defense, the red box is at least as good looking as I imagined it, and it IS exactly the solid state Linux 1u rackmount with a lot of Ethernet interfaces i've been looking for. Unfortunately, $3000 + service contracts is an awful lot of money for a cute box with software that doesn't work!

**Update 2006-12-10**

I spent too much of my weekend poking around with this and posting on the [WatchGuard forum](http://forum.watchguard.com), but I'm pretty convinced that this machine is just DOA. I can't get link lights on any of the Ethernet interfaces (sort of a show stopper for a firewall), and in addition the compact flash card doesn't seem to be loaded with the rescue image, let alone a full firewall OS. I was at least able to get onto the livesecurity website, turns out I'd transposed two digits of the serial number while reading it leaning over the firewall, and caught it when I recopied it from the box.

Being able to get on the website means I was able to get the software, and found out that it requires an explorer extension to complete the installer, which means it won't finish installing on xp64 or vista64. None of it seemed to want to run on vista either, but putting it into compatability mode seems to bring it to the same point as xp, meaning it won't finish installing because I can't activate the toolbar in a way it can find it since it installs into 32 bit explorer. The good news is that the important parts of the install do seem to have completed, at least all the files are on the disk. I was able to try to use fbxinstall to reinstall my CF image, but apparently that doesn't work on the e-series boxes, so I don't know if it failed due to bum hardware or not. Maybe its just me, but it seems making your installer dependent on activating a shell extension, for a firewall product of all things, seems like some dumb decision making.

I've opened a support ticket and started some dialog, but I'm not holding a lot of hope that I'll actually get a replacement unit in here in time to have it usable over the holidays. The responses I've gotten to my post on the forums indicate that the general user base of these boxes, 'experts' included, doesn't really have a clue what the underpinnings of the system look like, which is I guess for the most part a good thing. It does, however, tend to reduce the usefulness of their responses to my questions. DOA units also seems to be outside the radar of the average forum denizen, so I'm hoping my box is an isolated case. It does start making HA failover look pretty nice though.

**Update 2006-12-11**

I got a call from a 'fixer' at WatchGuard who has arranged for me to get a new unit overnighted. He concurs with my assessment that the unit is very much DoA. Kudo's to my sales guy and watchguard for stepping up on this one, I'm awaiting a functional unit with baited breath!
