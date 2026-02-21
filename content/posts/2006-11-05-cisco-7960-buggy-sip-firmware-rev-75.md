---
title: "Cisco 7960 buggy SIP firmware rev. 7.5"
date: 2006-11-05T17:10:08+00:00
author: "Erik LaBianca"
draft: false
categories:
  - VOIP
description: "Cisco 7960 SIP phones display XML Parse Errors due to a bug in firmware 7.5; downgrading to 7.4 fixes it."
---

I've been getting intermittent complaints recently that our Cisco 7960 phones are refusing to work and displaying an 'XML Parse Error'. In inability to transfer calls seems also to be part of the equation. Well, I've never had the problem myself and didn't see anything necessarily wrong with the phones or the setup so I've been ignoring it for the most part since power cycling the phone seems to resolve the problem for a while. Recently however we have changed our incoming caller pattern to go through a receptionist in all cases, and she's been having the problem very consistently. Well, it turns out the problem is a deficiency in Cisco's SIP implementation. Lots more details are available at <http://bugs.digium.com/view.php?id=5336>, but apparently downgrading to revision 7.4 solves the problem. I have no idea if the bug persists in newer (8.x) versions or not.
