---
title: "What's all the noise about VoIP, anyway?"
date: 2009-02-12T00:21:46+00:00
author: "Erik LaBianca"
draft: false
description: "An introduction to VoIP technology, how it compares to traditional telephony, and what it means for you."
tags:
  - telephony
  - VOIP
categories:
  - Information
---

You may have seen an advertisement on TV for [Vonage](http://www.vonage.com), or perhaps a telecomm integrator is pitching you a new VoIP PBX. Maybe you've got comcast "digital voice" or one of the equivalent business grade systems from incumbent carriers like AT&T, something like IP Flex or Business VoIP. Or perhaps you talk to your oversees friends for free using [Skype](http://www.skype.com), MSN or iChat. The fact is, VoIP is everywhere, but it remains confusing.

The good news is that it's conceptually very simple. First, let's break down the acronym. Voice over Internet Protocol. Now, that was easy! VoIP just means any technology used to transmit voice communications over the Internet. Unfortunately, from here on out it gets more complicated.

In order to understand VoIP, it's also important to understand the "old way", known as the [Public Switched Telephone Network](http://en.wikipedia.org/wiki/PSTN), or PSTN for short. This technology is based the same stuff invented by [Alexander Graham Bell in 1876](http://inventors.about.com/od/bstartinventors/a/telephone.htm), although over time it has morphed, become digitized, and a very advanced system of switches put in place. The key characteristic of the PSTN is that it always allocates a "pair of wires", digital or analog, between you and the person you are talking

You also need to understand a bit about the Internet. The Internet is a [packet-switched](http://en.wikipedia.org/wiki/Packet_switching) network, with providers establishing peering points and routing via the [BGP protocol](http://en.wikipedia.org/wiki/Border_Gateway_Protocol). The interesting thing about being packet switched is that between any two hosts on the Internet there is a multitude of possible routes. Bear in mind that only one route will be in use at a time. The key point here is that you don't have much control over which route will be used. In addition, all traffic between those two points is broken into individual packets, each of which might take a different path across the Internet.

So, put the two together and the issues become apparent. With analog telephony, you have a guaranteed path, and guaranteed performance. With VoIP, you have a dynamically allocated path based on breaking the transmission into tiny packets. This dynamically allocated path means variability, and quality voice communications require consistency.

There are lots of techniques to try to improve the consistency of Internet packet delivery, such as private networks, [high compression codecs](http://www.voip.com/blog/2008/05/g729-versus-g711.html), [Class of Service](http://en.wikipedia.org/wiki/Class_of_Service) tags, [Quality of Service](http://en.wikipedia.org/wiki/Quality_of_service), traffic shaping and many others. When implemented correctly CoS tagging and end-to-end QoS rules in conjunction with the wider signal bandwidth of a VoIP telephone can result in better than PSTN voice quality (typically measured using a [Mean Opinion Score or MOS](http://en.wikipedia.org/wiki/Mean_Opinion_Score)). However, since the Internet is not necessarily designed for voice transmission, VoIP signals are often not properly QoS'd and VoIP on the whole has gotten a band rap. This is why you'll see Comcast offering "[Digital Voice](http://blogs.zdnet.com/ip-telephony/?p=1350)" and AT&T offering "BVoIP using CoS" and trying to convince you they aren't selling that "crappy VoIP stuff".

Don't buy the BS, it's all VoIP, it's just more likely that they're doing it right.

So. What's in it for you? In short, everything and nothing. Practically, it means that voice calls around the world need not cost any more than across the office. In addition, since everything is handled digitally, you can easily route VoIP through a computer and get some benefits from communications convergence. Since VoIP runs over the internet, you can also move your "home phone" from one location to another with no hassles at all. You can even run a VoIP phone over Wifi ([or on your iPod](http://i.gizmodo.com/5148607/hands+on-with-jajahs-ipod-touch-voip-app)), making a cheap approximation of a cell phone without any contracts! Finally, VoIP falls outside the traditional regulatory domain of PSTN communications so you can save a few pennies in regulatory fees and tariff charges as well.

How do you know if it's right for you? In short, you'll need to try it out. Be aware that VoIP services that match the quality of PSTN services are likely to be price competitive. As usual, the "you get what you pay for" rule often applies, so beware of anything that seems too good to be true. The key to getting value from VoIP is to determine exactly what your needs are, try out the proposed system in production, and determine exactly how much money you'll save. From a business standpoint, without a clear ROI case, VoIP is probably not something to get excited about. Luckily, that case is usually easy to make!

Stay tuned for the next article about VoIP at your local office instead of across the internet.

**Useful References**

* Added 2009-02-13: [This post](http://voipschool.org/2009/02/the-different-flavors-of-voip/) at VoIPSchool has a great breakdown of some of the types of VoIP services out there.
