---
id: 21
title: Alltel Data Tethering with RAZR v3c
date: 2006-12-15T23:49:15+00:00
author: erik
layout: post
guid: http://blogs.ilsw.com/erik/2006/12/15/alltel-data-tethering-with-razr-v3c/
permalink: /2006/12/alltel-data-tethering-with-razr-v3c/
categories:
  - Uncategorized
---
I&#8217;ve got a RAZR v3c and alltel, and have enjoyed the prevalent 1xRTT data tethering for the last year or so whenever I&#8217;m out and about, even in the car. However, recently I upgraded my laptop and lost the configuration settings, and forgot the specific details. As of today, the needed settings are as follows:

<pre>Phone Number: #777
Username: nxxnxxxxx@alltel.com
Password: alltel

where nxxnxxxxxx is your Alltel mobile number.
</pre>

Also, for ease of reference, heres the skinny on Alltel data plans,
  
from the \[Howardforums Alltel Data Thread\](http://www.howardforums.com/showthread.php?t=1026028)

> <u>SPEEDS</u></b></font>
  
> **1XRTT:** Gives you about 100k down speed and is supported by all phones and running in most areas
> 
> **EV-DO:** Gives you about 500k down speed and is currently supported by only some models, this speed is only available in some places but is rapidly expanding and is indicated by a EV icon next to the signal strength on your handset
  
> **QNC:** Gives you about 10k down speed and is supported by all phones but this is being discontinued in some areas
> 
> <font size="6"><b><u>PLANS</u></b></font>
  
> **FST1:** This allows unlimited 1xrtt and <span nd="2" class="highlight">evdo</span> data usage for anything you want and minutes are used just as they are in a <a itxtdid="3148825" target="_blank" href="#" style="border-bottom: 0.075em solid darkgreen; font-weight: normal; font-size: 100%; text-decoration: underline; color: darkgreen; background-color: transparent; padding-bottom: 1px;" class="iAs">phone</a> call (so that means ulimited on nights and weekends!). You <u>**must**</u> have this on your plan/account for 1xrtt or <span nd="3" class="highlight">evdo</span> to work at all, it comes on most but if you do not have this it can be added for free with a call to *611
> 
> **Axcess My Mins:** This gives you unlimited 1xrtt and evdo when it is used for on-phone axcess services (sorry, no dialup allowed on this plan) and it does not use your minutes and is for normal handsets only. Cost: $10/month per line
> 
> **Axcess Data Connection:** This gives you unlimited 1xrtt and <span nd="5" class="highlight">evdo</span> for anything you want without using your mnutes and is only for normal handsets. Cost: $25/month per line
> 
> **Smartphone:** This gives unlimited 1xrtt and <span nd="6" class="highlight">evdo</span> to smartphones only for anything you want without using your minutes. Cost: $30/month per line
> 
> **Axcess National Unlimited:** This gives you unlimited 1xrtt and evdo for your PC card. Cost: $80/month per line, $60/month per line if you already have a current voice plan
> 
> NO DATA IS CHARGED PER KILOBYTE! 

I&#8217;ve had FST1 on my phone for over a year, and have had great luck just using data against my minutes, and for my usage pattern its absolutely perfect. Usually, I&#8217;m just on 1xRTT which usually ends up giving around 128kbps, which makes for a pretty decent web browsing experience. Ping times to the office under 400ms under PPTP makes for reasonably usable ssh sessions, but really slow RDS.

Today, however, I&#8217;m connected using EVDO in ohio, which appears to be able to saturate my &#8216;Motorala USB Modem&#8217;s 1Mbit maximum serial connection speed downloading. I was able to get 128kB/sec downloading the Python 2.5 installer for windows, which is pretty darn impressive for a cell phone connection in my book. I&#8217;m getting consistent sub 200ms pings under PPTP also, which is resulting in darn near usable RDS sessions.