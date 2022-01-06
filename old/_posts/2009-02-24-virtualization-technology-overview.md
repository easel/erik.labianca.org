---
id: 92
title: Virtualization Technology Overview
date: 2009-02-24T09:00:05+00:00
author: erik
layout: post
guid: http://www.cto-at-large.com/?p=92
permalink: /2009/02/virtualization-technology-overview/
aktt_notify_twitter:
  - yes
aktt_tweeted:
  - 1
categories:
  - Information
tags:
  - virtualization
---
One of the hottest buzzwords in technology today is virtualization. Unforrtunately, virtualization by itself covers a vast array of potential technologies.

Let&#8217;s look at the word itself first. Virtualization implies taking something &#8220;real&#8221; and &#8220;virtualizing&#8221; it, or making it &#8220;virtual&#8221;. Typically, this is exactly what is going on with virtualization technologies, the differences lie in what exactly is being virtualized.

**Storage Virtualization**

At the very bottom of the technology stack lies storage virtualization. Unfortunately, the storage industry is probably the most arcane of all IT sectors, and the inability to agree on what truly comprises storage virtualization technology is a great case in point.

<div class="zemanta-img" style="margin: 1em; display: block;">
  <div>
    <dl class="wp-caption alignright" style="width: 212px;">
      <dt class="wp-caption-dt">
        <a href="http://commons.wikipedia.org/wiki/Image:Rack001.jpg"><img title="A typical server &quot;rack&quot;, commonly se..." src="http://upload.wikimedia.org/wikipedia/commons/thumb/f/f5/Rack001.jpg/202px-Rack001.jpg" alt="A typical server &quot;rack&quot;, commonly se..." width="202" height="269" /></a>
      </dt>
      
      <dd class="wp-caption-dd zemanta-img-attribution" style="font-size: 0.8em;">
        Image via <a href="http://commons.wikipedia.org/wiki/Image:Rack001.jpg">Wikipedia</a>
      </dd>
    </dl>
  </div>
</div>

From a layman&#8217;s perspective storage virtualization should simply mean that your OS images don&#8217;t have to worry about where their storage comes from, it&#8217;s just there. Virtualization should allow it to be resized, move to new physical hardware, and isolated from hardware failure, all without effecting the running operating system and storage. In practice, vendors will call almost anything storage virtualization, so make sure you put on your skeptics hat when you hear them claiming to support it.

Coupled with server-side operating system virtualization, true storage virtualization delivers a one-two knockout punch to old fashioned IT. Expect to see this technology stabilize quickly as the industry gets excited about cloud compuing.

**Operating System Hardware Virtualization**

Lately there&#8217;s been lots of news over OS virtualization. <a class="zem_slink" title="VMware" rel="homepage" href="http://www.vmware.com/">VMWare</a>, Xen, Parralels, <a class="zem_slink" title="Sun xVM" rel="homepage" href="http://sun.com/xvm">Sun xVM</a>, and <a class="zem_slink" title="Hyper-V" rel="wikipedia" href="http://en.wikipedia.org/wiki/Hyper-V">Microsoft Hyper-V</a> are all this sort of technology. Newer Intel and AMD processors even have native instructions to make this sort of virtualization more efficient. In short, OS virtualization allows you to run several complete virtual systems on a single virtual machine host.

Operating system virtualization is revolutionary when it comes to maintaining datacenters. Most server applications are not cpu, memory, or even I/O bound. Rather, they are IT staff bound, meaning that every application gets to run on it&#8217;s own server because IT doesn&#8217;t dare install it any other way.

OS Virtualization seperates the OS image from the hardware support, allowing you to provision a host operating system as specified by a specific application, while migrating it from machine to machine as needs dictate.

There is a ton of R&D going into OS virtualization, both on the client and server side. Modern hypervisors allow you to migrate a running virtual machine from one physical host to another, allow for automatic failover and load balancing, and integrate with backup software. At this point, if you are provisioning new server systems without using virtualization, you ought to be asking yourself why.

On the client side, OS virtualization is pretty cool for tech people, but in my book still isn&#8217;t where it needs to be. There is no reason for most computer users to run their OS on native hardware, yet that hasn&#8217;t happened. Until it does, you&#8217;ll be stuck dealing with rebuilding your system every year or so to clear out the cruft or to handle a system migration. Technologies like VMWare ACE are trying to tackle this proble, but the technology has a long way to go before it catches up with server virtulization with respect hardware isolation.

**Operating System Partitioning**

Another very interesting technology in the operating sytem world is system partitioning. OpenSolaris Zones, FreeBSD Jails, <a class="zem_slink" title="NYSE: IBM" rel="stockexchange" href="http://finance.yahoo.com/q?s=IBM">IBM</a> LPARS and Linux vServers are all variants of this technology. In short, the runtime environment of the operating system is partitioned off from the host system while continuing to share a kernel.

Since kernels tend to be pretty reliable, this allows you to have some of the principle benefits of hardware virtualization (application isolation) without many of the costs (performance and memory overhead).

Unfortunately, this type of technology hasn&#8217;t really made any headway in the Microsoft stack, so it&#8217;s not used very heavily. Nonetheless, it&#8217;s something to keep your eyes on as the world moves towards cloud computing etc.

**Runtime Virtualization**

Moving farther up the application stack is runtime virtualization. <a class="zem_slink" title=".NET Framework" rel="homepage" href="http://www.microsoft.com/net/">Microsoft .NET</a> and Java are the 800lb gorilla&#8217;s in thie space. Runtime virtualization brings much of the application isolation benefits of OS-level virtualization schemes without incurring the much of the complexity of maintaining multiple operating system images.

The downside is obviously that software has to be explicitly targetted at a virtualization friendly runtime. However, you should understand the development and deployment benefits of targetting such an environment before choosing a development platform for a new project. They are by no means insignificant, and a lot of very smart people are working very hard at moving this technology forward.

Projects using Runtime Virtualization that I find particularly interesting are JRuby and Jython for Java and IronRuby/IronPython for .NET. These projects bring the development benefits of modern scripting languages to the deployment benefits of runtime virtualization. Look for a lot more good stuff from these guys.

**
  
** 

<div class="zemanta-pixie" style="margin-top: 10px; height: 15px;">
  <a class="zemanta-pixie-a" title="Zemified by Zemanta" href="http://reblog.zemanta.com/zemified/8505ec57-e353-4f6f-aefa-5b64f97fa8e1/"><img class="zemanta-pixie-img" style="border: medium none; float: right;" src="http://img.zemanta.com/reblog_e.png?x-id=8505ec57-e353-4f6f-aefa-5b64f97fa8e1" alt="Reblog this post [with Zemanta]" /></a>
</div>