---
title: "Oracle VM Manager on CentOS 5 i386 Install Notes"
date: 2007-11-17T20:28:32+00:00
author: "Erik LaBianca"
draft: false
description: "Notes on installing Oracle VM Manager on a minimal CentOS 5 i386 system, including missing dependencies."
categories:
  - Computing
  - Sysadmin
---

So everybody knows by now that Oracle just jumped into the virtualization fray with their new Oracle VM product. If you've been under a rock, go to [the oracle website](http://www.oracle.com/technologies/virtualization/index.html) to check it out. Given that I'm cheap and currently using VMWare's free offering, I jumped at the chance to check out a supposedly 'enterprise ready' Xen implementation for free. The 1/3 the overhead claim is just gravy!

Anyway, as cool as Oracle Enterprise (Unbreakable?!) Linux may be, I'm running CentOS and am perfectly happy with it. Oracle VM wants a dedicated machine for the management station, which I can arrange for with a little tweaking. However, I build most of my machines up from 'minimal' installs. I read in the Oracle documentation that I would need libaio installed to make things go, which I did without any trouble.

However, I also needed to install the 'bc' package in order for the install script to work. I had to install the oracle XE .rpm by hand in order to figure this out. Note to Oracle. Get with the program and put a dependency on the 'bc' package! You'll also need to install vixie-cron if you built up from minimum, as Oracle VM expects to be able to install a cron.d script.

In addition, it wasn't entirely obvious from the documentation that'll need a jdk installed. Well, you will. I'm using jdk-6u2-linux-i586.rpm, you can likely download it from [java.sun.com](http://java.sun.com/javase/downloads/?intcmp=1281).

Next, while the installer does tell you that the oc4jadmin default password is 'oracle', when I was asked for it I kept trying to use the passwords I'd already provided for all the other services. This didn't work well, so bear in mind you'll need to supply the 'oracle' default password at that state.

So, to recap:

```
yum install libaio vixie-cron bc
rpm -Uvh jdk-6u2-linux-i586.rpm
sh ./runInstaller.sh

Follow the prompts, remembering to supply 'oracle' as the oc4jadmin password.
```

Maybe this will save somebody the couple hours of messing around I wasted trying to get this to run! It does appear as if the install has completed, and I'm able to see the console, so look forward to an actual report soon.
