---
id: 29
title: Oracle VM Manager on CentOS 5 i386 Install Notes
date: 2007-11-17T20:28:32+00:00
author: erik
layout: post
guid: http://blogs.ilsw.com/erik/2007/11/17/oracle-vm-manager-on-centos-5-i386-install-notes/
permalink: /2007/11/oracle-vm-manager-on-centos-5-i386-install-notes/
categories:
  - Computing
  - Sysadmin
---
So everybody knows by now that Oracle just jumped into the virtualization fray with their new Oracle VM product. If you&#8217;ve been under a rock, go to [the oracle website](http://www.oracle.com/technologies/virtualization/index.html) to check it out. Given that I&#8217;m cheap and currently using VMWare&#8217;s free offering, I jumped at the chance to check out a supposedly &#8216;enterprise ready&#8217; Xen implementation for free. The 1/3 the overhead claim is just gravy!

Anyway, as cool as Oracle Enterprise (Unbreakable?!) Linux may be, I&#8217;m running CentOS and am perfectly happy with it. Oracle VM wants a dedicated machine for the management station, which I can arrange for with a little tweaking. However, I build most of my machines up from &#8216;minimal&#8217; installs. I read in the Oracle documentation that I would need libaio installed to make things go, which I did without any trouble.

However, I also needed to install the &#8216;bc&#8217; package in order for the install script to work. I had to install the oracle XE .rpm by hand in order to figure this out. Note to Oracle. Get with the program and put a dependency on the &#8216;bc&#8217; package! You&#8217;ll also need to install vixie-cron if you built up from minimum, as Oracle VM expects to be able to install a cron.d script.

In addition, it wasn&#8217;t entirely obvious from the documentation that&#8217;ll need a jdk installed. Well, you will. I&#8217;m using jdk-6u2-linux-i586.rpm, you can likely download it from [java.sun.com](http://java.sun.com/javase/downloads/?intcmp=1281).

Next, while the installer does tell you that the oc4jadmin default password is &#8216;oracle&#8217;, when I was asked for it I kept trying to use the passwords I&#8217;d already provided for all the other services. This didn&#8217;t work well, so bear in mind you&#8217;ll need to supply the &#8216;oracle&#8217; default password at that state.

So, to recap:

    
    yum install libaio vixie-cron bc
    rpm -Uvh jdk-6u2-linux-i586.rpm
    sh ./runInstaller.sh
    
    
    Follow the prompts, remembering to supply 'oracle' as the oc4jadmin password.
    

Maybe this will save somebody the couple hours of messing around I wasted trying to get this to run! It does appear as if the install has completed, and I&#8217;m able to see the console, so look forward to an actual report soon.