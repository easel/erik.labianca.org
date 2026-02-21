---
title: "Solaris BrandZ Zones"
date: 2006-10-12T15:55:18+00:00
author: "Erik LaBianca"
draft: false
categories:
  - Sysadmin
description: "Setting up CentOS 3 inside a Solaris BrandZ zone on OpenSolaris Nevada 49 for development testing."
---

Sun has really been pushing innovation with Solaris recently, and since it's now freely available and open sourced, what better time to give it a test drive? With the Solaris Express Nevada 49 release (get it from http://www.opensolaris.org/os/downloads/on/ and click the CD Version or DVD Version links under step 3b) Sun has officially included their BrandZ extension to Solaris containers. BrandZ allows containers to be 'Branded', the upshot of it is that you can run an entire system under a lxrun-like technology.

Currently they fully support running CentOS 3 in a zone, which conveniently enough is what all our production services still run on. See http://www.opensolaris.org/os/community/brandz/install/ for the official howto guide. Here's how to I set up a CentOS 3 development system for testing on my SNV49 machine:

```
#zonecfg -z centos3-dev-2

centos3-dev-2: No such zone configured
Use 'create' to begin configuring a new zone.

zonecfg:centos3-dev-2> create -t SUNWlx
zonecfg:centos3-dev-2> set zonepath=/tank/centos3-dev-2
zonecfg:centos3-dev-2> add net
zonecfg:centos3-dev-2:net> set address=192.168.2.31/24
zonecfg:centos3-dev-2:net> set physical=e1000g0
zonecfg:centos3-dev-2:net> end
zonecfg:centos3-dev-2> commit
zonecfg:centos3-dev-2> exit



#zoneadm -z centos3-dev-2 install -d /tank/public/centos_fs_image.tar.bz2


cannot create ZFS dataset tank/centos3-dev-2: dataset already exists
Installing zone 'centos3-dev-2' at root directory '/tank/centos3-dev-2'
from archive '/tank/public/centos_fs_image.tar.bz2'

This process may take several minutes.
```
