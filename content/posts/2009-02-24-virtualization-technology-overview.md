---
title: "Virtualization Technology Overview"
date: 2009-02-24T09:00:05+00:00
author: "Erik LaBianca"
draft: true
description: "An overview of virtualization technologies from storage to runtime, and why they matter for modern IT."
categories:
  - Information
tags:
  - virtualization
---

One of the hottest buzzwords in technology today is virtualization. Unfortunately, virtualization by itself covers a vast array of potential technologies.

Let's look at the word itself first. Virtualization implies taking something "real" and "virtualizing" it, or making it "virtual". Typically, this is exactly what is going on with virtualization technologies, the differences lie in what exactly is being virtualized.

**Storage Virtualization**

At the very bottom of the technology stack lies storage virtualization. Unfortunately, the storage industry is probably the most arcane of all IT sectors, and the inability to agree on what truly comprises storage virtualization technology is a great case in point.

[![A typical server rack](http://upload.wikimedia.org/wikipedia/commons/thumb/f/f5/Rack001.jpg/202px-Rack001.jpg)](http://commons.wikipedia.org/wiki/Image:Rack001.jpg)

*Image via [Wikipedia](http://commons.wikipedia.org/wiki/Image:Rack001.jpg)*

From a layman's perspective storage virtualization should simply mean that your OS images don't have to worry about where their storage comes from, it's just there. Virtualization should allow it to be resized, move to new physical hardware, and isolated from hardware failure, all without effecting the running operating system and storage. In practice, vendors will call almost anything storage virtualization, so make sure you put on your skeptics hat when you hear them claiming to support it.

Coupled with server-side operating system virtualization, true storage virtualization delivers a one-two knockout punch to old fashioned IT. Expect to see this technology stabilize quickly as the industry gets excited about cloud computing.

**Operating System Hardware Virtualization**

Lately there's been lots of news over OS virtualization. [VMWare](http://www.vmware.com/), Xen, Parralels, [Sun xVM](http://sun.com/xvm), and [Microsoft Hyper-V](http://en.wikipedia.org/wiki/Hyper-V) are all this sort of technology. Newer Intel and AMD processors even have native instructions to make this sort of virtualization more efficient. In short, OS virtualization allows you to run several complete virtual systems on a single virtual machine host.

Operating system virtualization is revolutionary when it comes to maintaining datacenters. Most server applications are not cpu, memory, or even I/O bound. Rather, they are IT staff bound, meaning that every application gets to run on it's own server because IT doesn't dare install it any other way.

OS Virtualization separates the OS image from the hardware support, allowing you to provision a host operating system as specified by a specific application, while migrating it from machine to machine as needs dictate.

There is a ton of R&D going into OS virtualization, both on the client and server side. Modern hypervisors allow you to migrate a running virtual machine from one physical host to another, allow for automatic failover and load balancing, and integrate with backup software. At this point, if you are provisioning new server systems without using virtualization, you ought to be asking yourself why.

On the client side, OS virtualization is pretty cool for tech people, but in my book still isn't where it needs to be. There is no reason for most computer users to run their OS on native hardware, yet that hasn't happened. Until it does, you'll be stuck dealing with rebuilding your system every year or so to clear out the cruft or to handle a system migration. Technologies like VMWare ACE are trying to tackle this problem, but the technology has a long way to go before it catches up with server virtualization with respect hardware isolation.

**Operating System Partitioning**

Another very interesting technology in the operating system world is system partitioning. OpenSolaris Zones, FreeBSD Jails, [IBM](http://finance.yahoo.com/q?s=IBM) LPARS and Linux vServers are all variants of this technology. In short, the runtime environment of the operating system is partitioned off from the host system while continuing to share a kernel.

Since kernels tend to be pretty reliable, this allows you to have some of the principle benefits of hardware virtualization (application isolation) without many of the costs (performance and memory overhead).

Unfortunately, this type of technology hasn't really made any headway in the Microsoft stack, so it's not used very heavily. Nonetheless, it's something to keep your eyes on as the world moves towards cloud computing etc.

**Runtime Virtualization**

Moving farther up the application stack is runtime virtualization. [Microsoft .NET](http://www.microsoft.com/net/) and Java are the 800lb gorilla's in this space. Runtime virtualization brings much of the application isolation benefits of OS-level virtualization schemes without incurring the much of the complexity of maintaining multiple operating system images.

The downside is obviously that software has to be explicitly targeted at a virtualization friendly runtime. However, you should understand the development and deployment benefits of targeting such an environment before choosing a development platform for a new project. They are by no means insignificant, and a lot of very smart people are working very hard at moving this technology forward.

Projects using Runtime Virtualization that I find particularly interesting are JRuby and Jython for Java and IronRuby/IronPython for .NET. These projects bring the development benefits of modern scripting languages to the deployment benefits of runtime virtualization. Look for a lot more good stuff from these guys.
