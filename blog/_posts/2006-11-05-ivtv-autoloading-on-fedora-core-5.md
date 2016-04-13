---
id: 14
title: IVTV Autoloading on Fedora Core 5
date: 2006-11-05T16:46:20+00:00
author: erik
layout: post
guid: http://blogs.ilsw.com/erik/2006/11/05/ivtv-autoloading-on-fedora-core-5/
permalink: /2006/11/ivtv-autoloading-on-fedora-core-5/
categories:
  - HTPC
---
My [MythTV](http://www.mythtv.org) system has been in place for several years now, and has seen many versions of Fedora. Ensuring the [IVTV modules](http://ivtvdriver.org) were loaded correctly after a system restart has always been a bit of a black art, however, and with Fedora Core 5 this seems to be no less of an exception. However, I think I have got it partially figured out, so here it is. 

First things first. Modern 2.6 linux kernels apparently fully support hardware autodetection. I understand that to mean you aren&#8217;t support to need to manually (or in a script) `modprobe ivtv` nor should you have to explicitly put any configuration into `modprobe.conf`. If your IVTV kernel modules are installed correctly, it&#8217;s supposed to be automatically detected, and then udev is supposed to create the relevant devices for you. This is working for me, however changing the permissions on video devices in `/etc/udev/rules.d/50-udev.rules` isn&#8217;t working. I tried to use this line to do it, but it appears to be ignored in general. 

    
    KERNEL=="video*",               MODE="0666"
    

The default is 0660 and I get this:

    
    crw------- 1 mythtv root 81, 0 Nov  4 15:16 /dev/video0
    

My guess is that ivtv doesn&#8217;t play nice with udev, or I just don&#8217;t know enough about udev to use it effectively. I did find some good [udev documentation](http://www.reactivated.net/writing_udev_rules.html) so perhaps I&#8217;ll figure it out eventually.

Regardless, on my frontend system I also need my hauppauge pvr-250 remove receiver to work, and this is where things got sticky. I had some settings in place for Fedora Core 3 from Jarrod&#8217;s guide trying to preload lirc-i2c before loading ivtv which were hanging up on startup, so I had commented them out. That was allowing ivtv to load, but my remote didn&#8217;t work. A quick hack to those lines fixed the problem, however. It appears as if nowadays ivtv wants to load first, and then have lirc_i2c stuff in on top, so this seems to work well.

    
    cat > /etc/modprobe.d/ivtv.conf <<-EOF
    install ivtv /sbin/modprobe --first-time --ignore-install ivtv; \
        { /sbin/modprobe lirc_dev; /sbin/modprobe lirc_i2c; }
    EOF