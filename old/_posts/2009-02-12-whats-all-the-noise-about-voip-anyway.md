---
id: 112
title: 'What&#039;s all the noise about VoIP, anyway?'
date: 2009-02-12T00:21:46+00:00
author: erik
excerpt: "What's all the noise about VoIP? In short, it's the way we'll all talk on the telephone in a few years, so you'd better learn a bit about it! Read the rest of the article to get started."
layout: post
guid: http://www.cto-at-large.com/?p=25
permalink: /2009/02/whats-all-the-noise-about-voip-anyway/
categories:
  - Information
tags:
  - telephony
  - VOIP
---
You may have seen an advertisement on TV for <a title="http://www.vonage.com" href="http://www.vonage.com" target="_blank">Vonage</a>, or perhaps a telecomm integrator is pitching you a new VoIP PBX. Maybe you&#8217;ve got comcast &#8220;digital voice&#8221; or one of the equivalent business grade systems from incumbent carriers like AT&T, something like IP Flex or Business VoIP. Or perhaps you talk to your oversees friends for free using <a title="http://www.vonage.com" href="http://www.vonage.com" target="_blank">Skype</a>, MSN or iChat. The fact is, VoIP is everywhere, but it remains confusing.

The good news is that it&#8217;s conceptually very simple. First, let&#8217;s break down the acronym. Voice over Internet Protocol. Now, that was easy! VoIP just means any technology used to transmit voice communications over the Internet. Unfortunately, from here on out it gets more complicated.

<div id="attachment_30" style="width: 407px" class="wp-caption alignleft">
  <a title="http://www.cisco.com/en/US/products/hw/phones/ps379/ps1855/index.html" href="http://www.cisco.com/en/US/products/hw/phones/ps379/ps1855/index.html" target="_blank"><img class="size-full wp-image-30" title="The Cisco 7960 VoIP Handset" src="http://erik.labianca.org/blog/wp-content/uploads/2009/02/cisco_7960.jpg" alt="A high quality VoIP compatible handset." width="397" height="348" /></a>
  
  <p class="wp-caption-text">
    A high quality VoIP compatible handset.
  </p>
</div>

In order to understand VoIP, it&#8217;s also important to understand the &#8220;old way&#8221;, known as the <a title="http://en.wikipedia.org/wiki/PSTN" href="http://en.wikipedia.org/wiki/PSTN" target="_blank">Public Switched Telephone Network</a>, or PSTN for short. This technology is based the same stuff invented by <a title="http://inventors.about.com/od/bstartinventors/a/telephone.htm" href="http://inventors.about.com/od/bstartinventors/a/telephone.htm" target="_blank">Alexander Graham Bell in 1876</a>, although over time it has morphed, become digitized, and a very advanced system of switches put in place. The key characteristic of the PSTN is that it always allocates a &#8220;pair of wires&#8221;, digital or analog, between you and the person you are talking

You also need to understand a bit about the Internet. The Internet is a <a title="http://en.wikipedia.org/wiki/Packet_switching" href="http://en.wikipedia.org/wiki/Packet_switching" target="_blank">packet-switched</a> network, with providers establishing peering points and routing via the <a title="http://en.wikipedia.org/wiki/Border_Gateway_Protocol" href="http://en.wikipedia.org/wiki/Border_Gateway_Protocol" target="_blank">BGP protocol</a>. The interesting thing about being packet switched is that between any two hosts on the Internet there is a multitude of possible routes. Bear in mind that only one route will be in use at a time. The key point here is that you don&#8217;t have much control over which route will be used. In addition, all traffic between those two points is broken into individual packets, each of which might take a different path across the Internet.

So, put the two together and the issues become apparent. With analog telephony, you have a guaranteed path, and guaranteed performance. With VoIP, you have a dynamically allocated path based on breaking the transmission into tiny packets. This dynamically allocated path means variability, and quality voice communications require consistency.

There are lots of techniques to try to improve the consistency of Internet packet delivery, such as private networks, <a title="http://www.voip.com/blog/2008/05/g729-versus-g711.html" href="http://www.voip.com/blog/2008/05/g729-versus-g711.html" target="_blank">high compression codecs</a>, <a title="http://en.wikipedia.org/wiki/Class_of_Service" href="http://en.wikipedia.org/wiki/Class_of_Service" target="_blank">Class of Service</a> tags, <a title="http://en.wikipedia.org/wiki/Quality_of_service" href="http://en.wikipedia.org/wiki/Quality_of_service" target="_blank">Quality of Service</a>, traffic shaping and many others. When implemented correctly CoS tagging and end-to-end QoS rules in conjunction with the wider signal bandwidth of a VoIP telephone can result in better than PSTN voice quality (typically measured using a <a title="http://en.wikipedia.org/wiki/Mean_Opinion_Score" href="http://en.wikipedia.org/wiki/Mean_Opinion_Score" target="_blank">Mean Opinion Score or MOS</a>). However, since the Internet is not necessarily designed for voice transmission, VoIP signals are often not properly QoS&#8217;d and VoIP on the whole has gotten a band rap. This is why you&#8217;ll see Comcast offering &#8220;<a title="http://blogs.zdnet.com/ip-telephony/?p=1350" href="http://blogs.zdnet.com/ip-telephony/?p=1350" target="_blank">Digital Voice</a>&#8221; and AT&T offering &#8220;BVoIP using CoS&#8221; and trying to convince you they aren&#8217;t selling that &#8220;crappy VoIP stuff&#8221;.

Don&#8217;t buy the BS, it&#8217;s all VoIP, it&#8217;s just more likely that they&#8217;re doing it right.

So. What&#8217;s in it for you? In short, everything and nothing. Practically, it means that voice calls around the world need not cost any more than across the office. In addition, since everything is handled digitally, you can easily route VoIP through a computer and get some benefits from communications convergence. Since VoIP runs over the internet, you can also move your &#8220;home phone&#8221; from one location to another with no hassles at all. You can even run a VoIP phone over Wifi (<a title="http://i.gizmodo.com/5148607/hands+on-with-jajahs-ipod-touch-voip-app" href="http://i.gizmodo.com/5148607/hands+on-with-jajahs-ipod-touch-voip-app" target="_blank">or on your iPod</a>), making a cheap approximation of a cell phone without any contracts! Finally, VoIP falls outside the traditional regulatory domain of PSTN communications so you can save a few pennies in regulatory fees and tariff charges as well.

How do you know if it&#8217;s right for you? In short, you&#8217;ll need to try it out. Be aware that VoIP services that match the quality of PSTN services are likely to be price competitive. As usual, the &#8220;you get what you pay for&#8221; rule often applies, so beware of anything that seems too good to be true. The key to getting value from VoIP is to determine exactly what your needs are, try out the proposed system in production, and determine exactly how much money you&#8217;ll save. From a business standpoint, without a clear ROI case, VoIP is probably not something to get excited about. Luckily, that case is usually easy to make!

Stay tuned for the next article about VoIP at your local office instead of across the internet.

**Useful References**

  * Added 2009-02-13: <a title="http://voipschool.org/2009/02/the-different-flavors-of-voip/" href="http://voipschool.org/2009/02/the-different-flavors-of-voip/" target="_blank">This post</a> at VoIPSchool has a great breakdown of some of the types of VoIP services out there.