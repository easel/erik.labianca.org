---
title: "Putty (windows ssh terminal) setup"
date: 2007-06-05T17:32:30+00:00
author: "Erik LaBianca"
draft: false
description: "Optimal PuTTY configuration settings for connecting to CentOS and Fedora Linux systems from Windows."
categories:
  - Tweaks
---
I always forget the settings that get solid results connecting to my CentOS/Fedora systems under Putty. Here's the whole nine yards, maybe someone else will be able to use 'em as well.

Get putty from http://www.chiark.greenend.org.uk/~sgtatham/putty/download.html. I use the installer.

Get puttycyg from http://web.gccaz.edu/~medgar/puttycyg/. Unpack the .exe files over your putty folder. This will be c:\program files (x86)\Putty if you use the installer on x64 windows. You'll want to replace the originals.

Drag pageant.exe into your startup folder.

Download bitstream vera from http://ftp.gnome.org/pub/GNOME/sources/ttf-bitstream-vera/1.10/

Unpack the zipfile somewhere. Select all the .ttf files, right click, select install.

Start putty (you did make a quicklaunch icon, right?)

* Under keyboard, select 'Linux' under 'The function keys and keypad'

* Under window, set lines of scrollback to something nice, like 10000

* Under appearance, change the font to BitSteam Sans Vera Mono, any size you like. I use 9.

* Under behavior, check 'full screen on alt-enter'

* Under translaction set character set to UTF-8

* Under colors, adjust ANSI Blue to something like 100,100,255 (it's too dark to read by default

* Under connection, set seconds between keepalives to 600

* Under connection-data, set terminal-type string to 'linux'

* Under SSH-Auth, check 'Allow Agent Forwarding'

Finally... go back to session, click 'Default Settings', and 'Save'.
