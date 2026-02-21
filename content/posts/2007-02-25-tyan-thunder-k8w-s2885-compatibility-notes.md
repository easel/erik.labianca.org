---
title: "Tyan Thunder K8W (s2885) Compatibility Notes"
date: 2007-02-25T12:43:41+00:00
author: "Erik LaBianca"
draft: false
description: "Notes on buggy AGP chipset issues with the Tyan s2885 dual Opteron board affecting video on Windows and Linux."
categories:
  - Uncategorized
---
For some reason in the last 2 weeks I've been confronted with resolutions to a couple of 'in-your-face' long term compatibility problems. What is particularly annoying is that I've had the hardware in question for the better part of 3 years and just placed blame elsewhere. In any case, I'm just throwing this out there in case anyone is searching the web the way I was. Basically, the Tyan s2885 (Thunder k8w) dual opteron board has a buggy AGP chipset and/or windows drivers. I've had intermittent problems with various video cards culminating in purchasing a brand new Geforce 6800XT just so I could run Windows Vista with Aero enabled. I installed Vista just fine, and tried to boot it up for the first time, and the machine hung EVERY time it tried to enable Aero during the login. No amount of tweaking was able to get past the login screen.

A coworker of mine with the same machine had the exact same problem with Vista. After reinstalling back down to windows XP, he's getting intermittent screen freezes throughout the day. I seem to only get them when I try to activate the intellimouse 'zoom' feature it so helpfully bound to my mouse button directly under my pinkie. Trying to start directX games will keel the machine over immediately as well.

Lending credence to the problem being in the chipset itself, last time I tried to run a linux desktop with FC5 or CentOS 4 I was basically unable to use it effectively due to screen lockups. At the time I was inclined to blame the x.org drivers for my video card. In any case, hopefully this saves some poor soul an hour or two of troubleshooting an intermittent display lockup problem.
