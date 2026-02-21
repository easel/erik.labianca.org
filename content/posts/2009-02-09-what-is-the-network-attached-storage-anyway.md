---
title: "What is Network Attached Storage, anyway?"
date: 2009-02-09T20:24:51+00:00
author: "Erik LaBianca"
draft: true
description: "An overview of Network Attached Storage, what it is, and when you should consider buying one."
categories:
  - Information
---

Network Attached Storage, or NAS. You'll see a lot of storage industry pros debating about what it really is, and why their flavor of NAS is better than their competitors. The term NAS comes from the fact that originally a NAS allowed "storage devices" which speak SCSI to be attached to a "network", speaking ethernet.

But really then, what is it? Actually, it's just a file server, the same thing you get when you right-click on a folder and select "share" on your windows system. However, a good NAS appliance will have some or all of the following:

* **Multi-protocol capability** -- CIFS, NFS, and iSCSI are all pretty basic anymore. However, if you need concurrent access to a filesystem from both NFS and CIFS look very closely at how the system mandles permissions and how it will effect you.
* **Snapshot capability** -- This allows you to store point-in-time snapshots of your shares. Windows XP and Vista have shell integration for this and vista even has this capability built-in.
* **Redundancy** -- A NAS will typically use some form of RAID to insulate you from data loss due to hard drive failure. Remember that hard drive failure is by no means the only way to lose data, however!

So why should you buy a NAS instead of just re-purposing that old machine gathering dust in the closet? Well, firstly, maybe you shouldn't. There are several open source NAS appliances out there, and they work very well for many people. They are cheap, they work, and since they're open source they're documented and repairable by your local linux wizard.

However, you'll still likely miss out on a few key differentiators:

* **Performance and Scalability** -- Enterprise-grade NAS appliances are designed to serve thousands of clients concurrently without a hiccup. This means NetApp, Sun 7000, BlueArc, EMC Celerra and some others. Anything running windows storage server and/or having less than a full tray of disks probably won't be anything to write home about. But don't assume an expensive unit will meet all your expectations just because it's expensive. Demand a real demo of the actual product you're considering buying running your applications. Unless you're buying a lot of them, good luck, but you might be able to negotiate a 30-day money back if nothing else by trying.
* **Hardware Integration** -- Enterprise-grade NAS products will have tightly integrated software and hardware. They will know when a drive has failed and turn on a nice red light on that drives carrier. NetApp, at least, will even phone home and have another drive delivered to your door automatically if the unit is under contract.
* **Reliability** -- Enterprise-grade NAS products are engineered to meet strict uptime guidelines. They boot fast, they are designed not to crash, and they have had thousands of hours of R&D and testing put into their data protection techniques. They are also designed to support fully redundant operation and their recovery methodology is well known.
* **Support** -- Real NAS products are sold with support contracts. There is an aftermarket support industry, and a training and certification programs for folks who operate them. This makes it easier to keep them running and find folks to help do it.

In general, like in most things in life, you get what you pay for. The key is knowing if you need what you'll get. Hopefully this overview has helped you to understand that a bit better. Comments welcome, of course.

**Downloadable NAS Appliances:**

* [OpenFiler](http://www.openfiler.com/)
* [FreeNAS](http://www.freenas.org/)
* [Nexenta](http://www.nexenta.com/)
