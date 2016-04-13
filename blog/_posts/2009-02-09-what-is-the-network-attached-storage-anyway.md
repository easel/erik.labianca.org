---
id: 108
title: What is Network Attached Storage, anyway?
date: 2009-02-09T20:24:51+00:00
author: erik
excerpt: |
  Network Attached Storage, or NAS. You'll see a lot of storage industry pros debating about what it really is, and why their flavor of NAS is better than their competitors.The term NAS comes from the fact that originally a NAS allowed "storage devices" which speak SCSI to be attached to a "network", speaking ethernet. But really then, what is it?
layout: post
guid: http://www.cto-at-large.com/?p=8
permalink: /2009/02/what-is-the-network-attached-storage-anyway/
categories:
  - Information
---
Network Attached Storage, or NAS. You&#8217;ll see a lot of storage industry pros debating about what it really is, and why their flavor of NAS is better than their competitors. The term NAS comes from the fact that originally a NAS allowed &#8220;storage devices&#8221; which speak SCSI to be attached to a &#8220;network&#8221;, speaking ethernet.

But really then, what is it? Actually, it&#8217;s just a file server, the same thing you get when you right-click on a folder and select &#8220;share&#8221; on your windows system. However, a good NAS appliance will have some or all of the following:

  * **Multi-protocol capability** &#8211;  CIFS, NFS, and iSCSI are all pretty basic anymore. However, if you need concurrent access to a filesystem from both NFS and CIFS look very closely at how the system mandles permissions and how it will effect you.
  * **Snapshot capability** &#8211; This allows you to store point-in-time snapshots of your shares. Windows XP and Vista have shell integration for this and vista even has this capability built-in.
  * **Redundancy** &#8211; A NAS will typically use some form of RAID to insulate you from data loss due to hard drive failure. Remember that hard drive failure is by no means the only way to lose data, however!

So why should you buy a NAS instead of just re-purposing that old machine gathering dust in the closet? Well, firstly, maybe you shouldn&#8217;t. There are several open source NAS appliances out there, and they work very well for many people. They are cheap, they work, and since they&#8217;re open source they&#8217;re documented and repairable by your local linux wizard.

However, you&#8217;ll still likely miss out on a few key differentiators:

  * **Performance and Scalability** &#8211; Enterprise-grade NAS appliances are designed to serve thousands of clients concurrently without a hiccup. This means NetApp, Sun 7000, BlueArc, EMC Celerra and some others. Anything running windows storage server and/or having less than a full tray of disks probably won&#8217;t be anything to write home about. But don&#8217;t assume an expensive unit will meet all your expectations just because it&#8217;s expensive. Demand a real demo of the actual product you&#8217;re considering buying running your applications. Unless you&#8217;re buying a lot of them, good luck, but you might be able to negotiate a 30-day money back if nothing else by trying.
  * **Hardware Integration** &#8211; Enterprise-grade NAS products will have tightly integrated software and hardware. They will know when a drive has failed and turn on a nice red light on that drives carrier. NetApp, at least, will even phone home and have another drive delivered to your door automatically if the unit is under contract.
  * **Reliability** &#8211; Enterprise-grade NAS products are engineered to meet strict uptime guidelines. They boot fast, they are designed not to crash, and they have had thousands of hours of R&D and testing put into their data protection techniques. They are also designed to support fully redundant operation and their recovery methodology is well known.
  * **Support** &#8211; Real NAS products are sold with support contracts. There is an aftermarket support industry, and a training and certification programs for folks who operate them. This makes it easier to keep them running and find folks to help do it.

In general, like in most things in life, you get what you pay for. The key is knowing if you need what you&#8217;ll get. Hopefully this overview has helped you to understand that a bit better. Comments welcome, of course.

**Downloadable NAS Appliances:**

  * [OpenFiler](http://www.openfiler.com/ "http://www.openfiler.com/")
  * [FreeNAS](http://www.freenas.org/ "http://www.freenas.org/")
  * [Nexenta](http://www.nexenta.com/ "http://www.nexenta.com/")