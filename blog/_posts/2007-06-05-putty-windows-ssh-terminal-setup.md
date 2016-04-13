---
id: 24
title: Putty (windows ssh terminal) setup
date: 2007-06-05T17:32:30+00:00
author: erik
layout: post
guid: http://blogs.ilsw.com/erik/2007/06/05/putty-windows-ssh-terminal-setup/
permalink: /2007/06/putty-windows-ssh-terminal-setup/
categories:
  - Tweaks
---
I always forget the settings that get solid results connecting to my CentOS/Fedora systems under Putty. Here&#8217;s the whole nine yards, maybe someone else will be able to use &#8217;em as well.

Get putty from http://www.chiark.greenend.org.uk/~sgtatham/putty/download.html. I use the installer.

Get puttycyg from http://web.gccaz.edu/~medgar/puttycyg/. Unpack the .exe files over your putty folder. This will be c:\program files (x86)\Putty if you use the installer on x64 windows. You&#8217;ll want to replace the originals.

Drag pageant.exe into your startup folder.

Download bitstream vera from http://ftp.gnome.org/pub/GNOME/sources/ttf-bitstream-vera/1.10/

Unpack the zipfile somewhere. Select all the .ttf files, right click, select install.

Start putty (you did make a quicklaunch icon, right?)

* Under keyboard, select &#8216;Linux&#8217; under &#8216;The function keys and keypad&#8217;
  
* Under window, set lines of scrollback to something nice, like 10000
  
* Under appearance, change the font to BitSteam Sans Vera Mono, any size you like. I use 9.
  
* Under behavior, check &#8216;full screen on alt-enter&#8217;
  
* Under translaction set character set to UTF-8
  
* Under colors, adjust ANSI Blue to something like 100,100,255 (it&#8217;s too dark to read by default
  
* Under connection, set seconds between keepalives to 600
  
* Under connection-data, set terminal-type string to &#8216;linux&#8217;
  
* Under SSH-Auth, check &#8216;Allow Agent Forwarding&#8217;

Finally&#8230; go back to session, click &#8216;Default Settings&#8217;, and &#8216;Save&#8217;.