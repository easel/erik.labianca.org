---
title: "Security Appliance Roundup Part 2"
date: 2006-10-12T13:55:14+00:00
author: "Erik LaBianca"
draft: false
categories:
  - Uncategorized
description: "Continuing the firewall search with Smoothwall and pivoting to hardware appliances like the Netscreen 25."
---

Smoothwall came through with a demo license for me in just a matter of minutes, and I spend a couple hours playing with it. It has a fairly complete web interface, but unfortunately even with all its fancy features I saw absolutely nothing that would allow me to operate it as a layer 2 firewall (bridging my static ip addresses into a dmz) nor does it have support for routing said static ip address without NAT. Given we have clients and servers on static IP addresses and a class C address block to boot, it seems a waste to have to static nat them all and deal with that complexity when a dual dmz solution with layer 2 support would take care of it. So it's back to the drawing board.

Given none of the software firewall packages seem to support 4 or more interfaces well, nor do many support layer 2 firewalling, I'm looking at hardware solutions. Going with a hardware appliance type solution seems to open up the options significantly with respect to high availability, as well, which actually seems like a really intelligent thing to do since I really can't afford for the system to be down as long as it would take to get a replacement.

Currently, my top pick seems to be the [netscreen 25](http://www.juniper.net/products/integrated/ns_2550.html). It offers the features I need, and at a retail price around $2500 it seems like a solid deal.

Other units I'm looking at are the [WatchGuard Firebox x750e](http://www.watchguard.com/products/core-e.asp) and the [sonicwall 2040 or 3060](http://www.sonicwall.com/products/vpnapp.html)
