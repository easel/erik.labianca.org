---
title: "RAZR v3c disables ring style selection when closed"
date: 2006-12-11T17:31:22+00:00
author: "Erik LaBianca"
draft: false
description: "How to lock the ring style selector on a Motorola RAZR v3c to prevent accidental switches to silent mode."
categories:
  - Tweaks
---
Edit January 7: See bottom of post.

Every person I've talked to with a RAZR seems to have this problem, and nobody has known how to fix it. You know what I'm talking about! You put the phone on 'vibrate' and stick it in your pocket, confident that when that important phone call comes in you'll know. 3 hours pass by and nothing happens, and you pull the phone out of your pocket only to find out that it's now on 'silent' and you have 5 missed calls! WTF!

Well, here's a really easy and 99% functional solution. It's so simple it pains me that I never poked into the menus far enough to find it, but alas I was too lazy to figure out the default unlock code. As it turns out, you can lock any individual application to use require an unlock code before use. Enabling this feature for the 'ringtone selection' application will make it ask for your passcode every time that stupid side button gets pressed in your pocket. Since the phone is closed... no more accidental switches to silent!

On my phone, the default unlock code was 1234. I've also read it can be the last four digits of your phone number or 0000, so try all three. To disable the feature, open the phone. Click the center ("menu"?) button. Select Settings. Select 4. Security. Select 'Lock Application'. At this point it will ask for your unlock code. Bang stuff in here starting with 1234 until you get in. If you can't, get your provider to fix it for you. Scroll down the list to 'Ring Styles' and use the right arrow to change from 'Unlocked' to 'Locked'. Voila!

Bear in mind you will have to enter your unlock code to change the ring style now, even if the phone is open, so it isn't really the ideal fix. Resetting the unlock code to 0000 makes this just a bit less painful. You can reset your unlock code using the 'New Passwords' selection under 4. Security and selecting 'Unlock Code'.

For those who care, here's where I found this info [thread about v3c ringstyle lock](http://www.howardforums.com/showthread.php?t=843301) and
[thread about v3c unlock codes](http://www.wifi-forum.com/wf/showthread.php?p=377669). As a point of reference, I have an [Alltel](http://www.alltel.com) v3c running bone stock, but supposedly most (all?) RAZR variants are susceptible to this trick.

For those who don't like keying in the unlock code to change ring styles, I'd love to hear of a way to just allow me to remap those outside buttons to something more useful or nothing at all, but haven't found anything so far. Prove me wrong!

> Edit January 2, 2007:
>
> So I found the fly in the ointment. The problem is that the phone pops up the 'enter unlock code' screen whenever you bump a button, and along with it turns on the backlight! *and never turns it off!* Nice work Motorola =/.
