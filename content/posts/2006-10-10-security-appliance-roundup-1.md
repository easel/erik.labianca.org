---
title: "Security Appliance Roundup"
date: 2006-10-10T11:55:06+00:00
author: "Erik LaBianca"
draft: false
categories:
  - Netadmin
description: "Evaluating firewall and VPN appliances including Cisco IOS, M0n0Wall, LEAF, Shorewall, and several others."
---

So I want to simplify and strengthen our network security at the
office. Currently we're using a mishmash of cisco IOS ipsec, pptp,
cbac/NAT and linux iptables host based firewalls. I'd like to
centralize everything, and add a more reliable vpdn solution to the
mix. In addition, I'd like better logging and traffic shaping
control.

## [Cisco 2600 with IOS 12 advanced firewall](http://www.cisco.com) ##

I've been running this for the last couple of years, on 2600 class
hardware. In general, its a very complete solution, but configuring
it can be extremely trying. I can't even remember the number of
times I've been stumped by some issue that 'should be working', only
to find out a month or two later that the problem was software
revision I was using. Cisco is very difficult to work with wrt
getting firmware updates for their software, and I typically don't
have good luck findout out what other version I'd need, anyway. The
cisco ipsec vpn implementation seems to be solid, as are their
routing abilities. The CBAC packet inspection system is where the
cisco starts to weaken as a firewall platform, however. Even just
inspecting standard TCP traffic can easily put the 2600 under enough
load that I can't really afford to run it between my internal
network and DMZ.

Cisco's single file configuration, plethora of hardware interfaces,
utterly complete routing support and general hardware reliability are
second to none however. If it were easier to get a bunch of ethernet
interfaces tied into a 2600, and it was in general easier to get
ahold of firmware updates and modules for the hardware I'd be
hardpressed to want to change.

We've also been using Cisco hardware for our vpn endpoints. At this
point they consist of a soho91 and a pair of 857w's. In general,
these are very capable endpoint routers, and obviously their ipsec
vpn connectivity to the 2600 is second to none. However, they lack
support for any sort of split horizon dns, so using dns at client
sides is trying at best. In addition, I've not gotten so far as to
even attempt to control access to the vpn at the remote ends, so I'm
stuck trusting that anybody managing to connect to one of the remote
endpoint networks (wired, wireless, or otherwise) is trustworthy. I
believe I ought to be able to apply CBAC or packet filter rules to
traffic arriving from the VPN but the complexity of figuring out how
to apply them in the face of cisco's ip stack traversal order has
prevented it.

In addition, the ios nat implementation doesn't seem to be able to
do any sort of hairpinning, which is pretty frustrating since our
mail server is snatted through the router. This means I can't send
smtp traffic from any of the vpn endpoints currently.

### [M0n0Wall](http://m0n0.ch) ###

This is another very nicely integrated freebsd based web managed
firewall implementation. It is designed to run on embedded hardware
such as Soekris or WRAP single board computers. It supports IPSEC
tunnels, split horizon dns using dnsmasq, but again is targetted
fairly directly at the SOHO market, with no support for vpdn or
static routing. I used it for several months running on my soekris
3ethernet box and had no problems with the functionality it
provided.

### [LEAF](http://leaf.sourceforge.net) ###

This is an interesting amalgam of linux software packages for
embedded hardware. Unfortunately, the price to be paid for the
flexibility of a full linux system is complexity. You'll have to
edit the files in /etc folder on a ramdisk, and figure out which
package they are a part of in order to get them 'backed up' to
compact flash so they will be available post reboot. The firewall
portion of LEAF is typically handled with shorewall.

### [Shoreline Firewall](http://www.shorewall.net/) ###

This is basically an iptables configuration script. It uses a series
of files (typically placed in /etc/shorewall) defining things like
interfaces, rules, and policies, and turns it all into a complete
set of iptables rules. It seems to be able to configure just about
any aspect of iptables you might want to, but the downside is that
it generates copious amounts of rules, which makes reading the
iptables -L output the old fashioned way pretty tough. The other
downside is obviously that you have to edit the files, and do it
correctly, or you risk blowing up all kinds of stuff.

### [Proxmox Firewall](http://www.proxmox.com) ###

This appears to be another shorewall based firewall solution. I did
manage to download and install it, but in its install process it
appears to have assigned itself an IP address using dhcp and then
started using it statically, and I have no idea what it is or how to
get it back. Oh well.

### [Gibraltar](http://www.gibraltar.at/) ###

Based on debian . Looks to be utterly feature complete (including
multiple dmvpn options, heartbeat failover support, lots of proxies,
etc), and it still knows how to back itself up / restore easily.
Runs off read only media, and according to their site they have some
VERY nice hardware solutions for a reasonable price. What I don't
like is that the UI is anything but user friendly. It's basically
just a series of web forms to cover up the standard debian
configuration files. When I tried to save the configuration to my
vmware hard drive, it wouldn't work, either, so at this point I'm
gonna have to backburner this option.

### [Smoothwall (GPL)](http://www.smoothwall.org) ###

This is very nicely integrated firewall package. It has explicit dsl
modem support, and a fairly strong community and selection of add-on
packages. However it is clearly aimed at the SOHO market. It doesn't
support multiple DMZ's, nor any static routing. The web interface
appears to be very nice, but you really have to be sure your needs
will fit directly within their model.

### [IPCop](http://www.ipcop.org) ###

This is the 'more open source' fork of smoothwall. It adds support
for the snort IDS, complete with automatic rule updates, a 'blue'
dmz interface (for wireless networks, I think), and in general is
another very nice package. But again it only supports ipsec vpn
(although it will handle dynamic vpn terminals using dyndns). It
also doesn't support any static routing that I can find.

### [Smoothwall Advanced Firewall](http://www.smoothwall.net) ###

This is the commercial version of smoothwall. They've been in the
business for a long time, and feature wise this looks like an
extremely compelling option. They provided me with a free evaluation
license, so I downloaded it and spent a few hours checking it out
while running in a VPC. In general it has a quite nice web
configuration interface, but again it really isn't designed for a
more complicated network. In particular, it doesn't appear to have
any mechanism to support static routing or layer 2 filtering, making
it difficult for me to use my class C block of IP addresses
effectively.

## Conclusion ##

None of the software firewall packages supported 4+ interfaces well,
and none handled layer 2 firewalling — both requirements for bridging
a block of static IPs into a DMZ without NAT. Given that, plus the HA
benefits, I pivoted to hardware appliances: the
[Juniper Netscreen 25](http://www.juniper.net/products/integrated/ns_2550.html),
[WatchGuard Firebox x750e](http://www.watchguard.com/products/core-e.asp),
and
[SonicWall 2040/3060](http://www.sonicwall.com/products/vpnapp.html).
