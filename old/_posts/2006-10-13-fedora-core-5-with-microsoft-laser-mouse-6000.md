---
id: 10
title: Fedora/CentOS with a Microsoft Laser Mouse 6000
date: 2006-10-13T13:23:36+00:00
author: erik
layout: post
guid: http://b.www.ilsw.com/blogs/erik/2006/10/13/fedora-core-5-with-microsoft-laser-mouse-6000/
permalink: /2006/10/fedora-core-5-with-microsoft-laser-mouse-6000/
categories:
  - Tweaks
---
So I&#8217;m working on some linux software and am running linux on my desktop. One of my major pet peeves every time I go back to a linux desktop is that out of the box my button 4 and 5 don&#8217;t work correctly under firefox. Here&#8217;s the fix.

Under Fedora Core 5, use this:

    
    cat > /etc/X11/xinit/xinitrc.d/mouse.sh <<-EOF 
    #!/bin/sh 
    # /etc/X11/xinit/xinitrc.d/mouse.sh 
    # Required for the configuration of a 5-button mouse 
    xmodmap -e "pointer = 1 2 3 8 9 4 5 6 7 10 11" 
    EOF  
    chmod a+x /etc/X11/xinit/xinitrc.d/mouse.sh
    
    

Under CentOS 4 / RHEL4, use this:

    
    cat > /etc/X11/xinit/xinitrc.d/mouse.sh <<-EOF "
    #!/bin/sh 
    # /etc/X11/xinit/xinitrc.d/mouse.sh 
    # Required for the configuration of a 5-button mouse 
    xmodmap -e "pointer = 1 2 3 6 7 4 5 " 
    EOF  
    chmod a+x /etc/X11/xinit/xinitrc.d/mouse.sh
    
    

And then use the following for the mouse inputdevice:

    
    Section "InputDevice"
            Identifier  "Mouse0"
            Driver      "mouse"
            Option      "Protocol" "ExplorerPS/2"
            Option      "Device" "/dev/input/mice"
            Option      "ZAxisMapping" "6 7"
            Option      "Buttons"   "7"
            Option      "Emulate3Buttons" "no"
    EndSection