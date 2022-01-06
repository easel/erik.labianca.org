---
id: 15
title: Fedora Core 5 ATI driver with theater_out tv support
date: 2006-11-05T17:04:53+00:00
author: erik
layout: post
guid: http://blogs.ilsw.com/erik/2006/11/05/fedora-core-5-ati-driver-with-theater_out/
permalink: /2006/11/fedora-core-5-ati-driver-with-theater_out/
categories:
  - HTPC
---
I have a radeon 9200 video card in my HTPC, since when I bought it all the HTPC enthusiasts over at <http://www.avsforum.com> seemed to think ATI was better for tv output. I also wanted the possibility of using a component adapter cable (which I never bought). For years I&#8217;ve been happily using the ATI proprietary FGLRX drivers under linux to drive my Toshiba 27&#8243; TV with an svideo cable. Alas, all good things come to an end. Xorg 7.0 came along with my Fedora Core 5 and MythTV 0.20 upgrade, and with it came FGLRX breakage. Or to be precise, along with it came an FGLRX upgrade.

After entirely too much digging, I discovered that versions of FGLRX greater than 0.20 have broken XV scaling. No, it doesn&#8217;t appear to be documented anywhere at ATI, but what happens is the video only uses part of the screen and appears to be clipped out of the top left corner of the frame. I fought with it for an hour or two thinking I was just drawing offscreen or something, but eventually realized it wasn&#8217;t happening.

Finally I gave up and just left XV disabled entirely, which seems to be ok for recorded TV, but DVD playback is noticeably choppy. In both cases CPU usage is well over 50% (most of it being eaten by the X server) on my Athlon XP 2500+, which is ludicrous. 

In any case, the poor performance drove me to look for other options. The default ati driver included with x.org unfortunately doesn&#8217;t include any tv output support, but the gatos driver folks do support it, so I built up a new version of the latest ATI driver with their patch applied and lo and behold it works! Kudo&#8217;s to the fedora x.org packagers for splitting out the drivers so nicely. Here&#8217;s a patch against the most recent fc5 ati driver specfile.

    
    --- SPECS/xorg-x11-drv-ati.spec 2006-04-25 21:22:36.000000000 -0400
    +++ SPECS/xorg-x11-drv-ati-theater_out.spec     2006-11-05 15:56:11.000000000 -0500
    @@ -13,7 +13,7 @@
     Summary:   Xorg X11 ati video driver
     Name:      xorg-x11-drv-ati
     Version:   6.5.8.0
    -Release:   1
    +Release:   1.theater_out
     URL:       http://www.x.org
     License:   MIT/X11
     Group:     User Interface/X Hardware Support
    @@ -24,6 +24,8 @@
     Source2:   r128.xinf
     Source3:   radeon.xinf
     Patch0:    xorg-x11-drv-ati-6.5.7.3-radeon-metamodes-SEGV-fix.patch
    +#Patch1:          xorg7-6.5.8.0-tv_output.patch.gz
    +Patch1:           http://megahurts.dk/rune/stuff/xorg7-6.5.8.0-tv_output.patch.gz
    
     ExclusiveArch: %{ix86} x86_64 ia64 ppc alpha sparc sparc64
    
    @@ -42,6 +44,7 @@
     %prep
     %setup -q -n %{tarball}-%{version}
     #%patch0 -p2 -b .radeon-metamodes-SEGV-fix
    +%patch1 -p1 -b .theater_out
    
     %build
     %configure --disable-static
    @@ -79,12 +82,16 @@
     %{moduledir}/multimedia/theatre200_drv.so
     %{moduledir}/multimedia/theatre_detect_drv.so
     %{moduledir}/multimedia/theatre_drv.so
    +%{moduledir}/multimedia/theater_out_drv.so
     #%dir %{_mandir}/man4x
     %{_mandir}/man4/ati.4*
     %{_mandir}/man4/r128.4*
     %{_mandir}/man4/radeon.4*
    
     %changelog
    +* Sat Nov 04 2006 Erik LaBianca <erik@ilsw.com> 6.5.8.0-1.theater_out
    +- Added gatos theater out patch
    +
     * Tue Apr 25 2006 Adam Jackson <ajackson@redhat.com> 6.5.8.0-1
     - Updated to stable branch release from upstream.
    

The relevant sections of the xorg.conf file needed to make this go are here:

    
    Section "Monitor"
            Option "DPMS"
            HorizSync    30.0 - 40.0
            VertRefresh  60
            Identifier   "Monitor0"
    EndSection
    
    Section "Device"
            Driver      "ati"
            Option      "IgnoreEDID" "True"
            Option      "TVOutput" "NTSC"
            Option      "MonitorLayout" "AUTO, NONE"
            Identifier  "ATI Graphics Adapter"
            BusID       "PCI:3:0:0"
    EndSection
    
    Section "Screen"
            Identifier "Screen0"
            Device     "ATI Graphics Adapter"
            Monitor    "Monitor0"
            DefaultDepth     24
            SubSection "Display"
                    Viewport   0 0
                    Depth     24
                    Modes    "800x600"
            EndSubSection
    EndSection
    

This all does indeed work, and reasonably well. My picture isn&#8217;t perfectly centered, and the UI screens in Myth have a bit of flicker, but it does work, and is even open source, so I&#8217;m pretty happy with the change. I&#8217;m not sure of the licensing implications of actually distributing an x.org binary with a gpl patch included, so I&#8217;m not posting the RPMS here directly.