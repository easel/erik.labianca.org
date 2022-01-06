---
id: 20
title: RAZR v3c disables ring style selection when closed
date: 2006-12-11T17:31:22+00:00
author: erik
layout: post
guid: http://blogs.ilsw.com/erik/2006/12/11/razr-v3c-disable-ring-style-selection-when-closed/
permalink: /2006/12/razr-v3c-disable-ring-style-selection-when-closed/
categories:
  - Tweaks
---
Edit January 7: See bottom of post.

Every person I&#8217;ve talked to with a RAZR seems to have this problem, and nobody has known how to fix it. You know what I&#8217;m talking about! You put the phone on &#8216;vibrate&#8217; and stick it in your pocket, confident that when that important phone call comes in you&#8217;ll know. 3 hours pass by and nothing happens, and you pull the phone out of your pocket only to find out that it&#8217;s now on &#8216;silent&#8217; and you have 5 missed calls! WTF!

Well, here&#8217;s a really easy and 99% functional solution. It&#8217;s so simple it pains me that I never poked into the menus far enough to find it, but alas I was too lazy to figure out the default unlock code. As it turns out, you can lock any individual application to use require an unlock code before use. Enabling this feature for the &#8216;ringtone selection&#8217; application will make it ask for your passcode every time that stupid side button gets pressed in your pocket. Since the phone is closed&#8230; no more accidental switches to silent!

On my phone, the default unlock code was 1234. I&#8217;ve also read it can be the last four digits of your phone number or 0000, so try all three. To disable the feature, open the phone. Click the center (&#8220;menu&#8221;?) button. Select Settings. Select 4. Security. Select &#8216;Lock Application&#8217;. At this point it will ask for your unlock code. Bang stuff in here starting with 1234 until you get in. If you can&#8217;t, get your provider to fix it for you. Scroll down the list to &#8216;Ring Styles&#8217; and use the right arrow to change from &#8216;Unlocked&#8217; to &#8216;Locked&#8217;. Voila! 

Bear in mind you will have to enter your unlock code to change the ring style now, even if the phone is open, so it isn&#8217;t really the ideal fix. Resetting the unlock code to 0000 makes this just a bit less painful. You can reset your unlock code using the &#8216;New Passwords&#8217; selection under 4. Security and selecting &#8216;Unlock Code&#8217;.

For those who care, here&#8217;s where I found this info \[thread about v3c ringstyle lock\](http://www.howardforums.com/showthread.php?t=843301) and
  
\[thread about v3c unlock codes\](http://www.wifi-forum.com/wf/showthread.php?p=377669). As a point of reference, I have an \[Alltel\](http://www.alltel.com) v3c running bone stock, but supposedly most (all?) RAZR variants are susceptible to this trick. 

For those who don&#8217;t like keying in the unlock code to change ring styles, I&#8217;d love to hear of a way to just allow me to remap those outside buttons to something more useful or nothing at all, but haven&#8217;t found anything so far. Prove me wrong!

> Edit January 2, 2007:
  
> So I found the fly in the ointment. The problem is that the phone pops up the &#8216;enter unlock code&#8217; screen whenever you bump a button, and along with it turns on the backlight! _and never turns it off!_ Nice work Motorola =/.