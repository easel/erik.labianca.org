---
title: "Disk Benchmarks, Round 1"
date: 2006-10-10T11:55:18+00:00
author: "Erik LaBianca"
draft: false
categories:
  - Sysadmin
description: "Comparing filesystem benchmarks across Solaris ZFS and a 3ware RAID controller using filebench and bonnie++."
---

In the process of trying to figure out my VM performance problems,
I've been doing a lot of filesystem benchmarking. Unfortunately,
there isn't a lot of consistency between platforms or machine classes
as to benchmarking methodology, so I've had some trouble generating
comparable numbers. However, I've gotten the solaris filebench suite
running on linux, and bonnie++ running on solaris, so I can now
generate comparable numbers across both platforms.

One of my primary interests is the throughput I can get out of the
3ware 7506 raid controller in my unix nas box, both in order to
optimize it and in order to compare to other solutions and determine
if they will actually be an upgrade or not. In the process, I've
been benchmarking an older Dell Precision Workstation 420. It has 4
wd1200jb drives plugged into its onboard IDE boards (yes, they are
sharing ide channels), and is currently running opensolaris nv47. I
played around with a few different ZFS configurations, but eventually
settled on raidz, leaving me with 360G usable disk space. Here's
some of the numbers I got:

## Filebench Benchmarks

```text
Webserver IO Summary: 848559 ops 16865.4 ops/s, (5440/544 r/w)  91.8mb/s,    249us cpu/op,   0.3ms latency
Varmail IO Summary: 96110 ops 1913.1 ops/s, (294/295 r/w)   9.6mb/s,    618us cpu/op,  26.1ms latency
Fileserver IO Summary: 8000 ops 3964.1 ops/s, (497/493 r/w)  72.8mb/s,   1130us cpu/op,   0.9ms latency
```

Here are some benchmarks from my production file server, at a low
load time but nonetheless serving vmdk images for 8 virtual machines.
It is a 2x P4 Xeon 2.4ghz ,3GB RAM, 3ware 7506 controller with
raid5 x 5 + 1 hotswap WD1200JB PATA disks.

```text
Varmail IO Summary: 87754 ops 1454.5 ops/s, (224/224 r/w)   7.3mb/s,    142us cpu/op,  35.5ms latency
Webserver  IO Summary: 20312 ops 20208.2 ops/s, (6499/660 r/w) 108.4mb/s,    215us cpu/op,   0.7ms latency
Fileserver IO Summary: 7997 ops 1587.9 ops/s, (202/196 r/w)  29.8mb/s,   1122us cpu/op,  37.8ms latency
```
