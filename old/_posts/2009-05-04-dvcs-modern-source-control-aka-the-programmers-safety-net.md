---
id: 115
title:
  - 'DVCS: Modern Source Control aka the Programmers Safety Net'
date: 2009-05-04T12:28:31+00:00
author: erik
layout: post
guid: http://www.cto-at-large.com/2009/05/dvcs-modern-source-control-aka-the-programmers-safety-net/
permalink: /2009/05/dvcs-modern-source-control-aka-the-programmers-safety-net/
aktt_notify_twitter:
  - yes
aktt_tweeted:
  - 1
description:
  - Source control is a key tool in the software engineers arsenal. Modern DVCS systems provide significant benefits and are mature enough to actually use.
keywords:
  - programming, tools, source control, dvcs, best practice, development, revision control, mercurial, bazaar, hg, git, subversion
categories:
  - Information
  - Programming
  - Technical
tags:
  - Best Practices
  - Programming
---
Revision control is a key tool for modern software engineers. It provides a safety net for the individual developer, and provides a collaborative framework that allows many developers to work on the same project without fear of stepping on each others toes.

[<img height="300" border="0" width="450" style="margin: 5px;" class="" alt="" src="http://erik.labianca.org/blog/wp-content/uploads/2009/05/skydivers.jpg" title="Skydivers from The Passion Man" />](http://www.flickr.com/photos/35545469@N06/3290184656/) 

Revision control or isn&#8217;t a new idea. [RCS](http://www.gnu.org/software/rcs/rcs.html) and it&#8217;s descendant, [CVS](http://www.nongnu.org/cvs/), date back to the early 80&#8217;s, and they in turn were based on even older systems. That said, many programmers still aren&#8217;t using it. Eric Sink blames it on [lack of training](http://www.ericsink.com/scm/scm_intro.html). Ben Collins-Sussman thinks it&#8217;s because [80% of programmers aren&#8217;t "Alphas"](http://blog.red-bean.com/sussman/?p=82). Andrew Smith (the number one hit on Google, I might add) thinks it&#8217;s because [takes too long to learn and it&#8217;s hard to set up a server](http://littlesvr.ca/grumble/2008/07/24/why-dont-people-use-version-control/). I&#8217;ll plead the fifth and say I hope I can be a part of the solution instead of the problem!

In any case, up until the last few years, revision control systems were centralized. That is, there was a single central repository of code to which contributors connected, checking out code and checkin in their changes. [Subversion](http://subversion.tigris.org/) is the latest of these centralized systems. It was developed specifically to be CVS without the worst of the bugs, and to that end it is very successful. If you want great tools support, have a reasonable sized team, like non-mind-bending behavior, and you only work across a local network anyway, subversion is a great system. 

However, many developers have become frustrated with centralized version control. Nobody wants to be accused of &#8216;breaking the build&#8217;, so naturally the frequency of checkins decreases. To the same end, to avoid newbies breaking the build, project administrators don&#8217;t give out commit access lightly. The end result is that developers lose the safety-net aspect revision control. I&#8217;ve been witness to developers making a copy of their source code, out of revision control, because they&#8217;re so afraid they might check in something bad.

In addition, since core contributors are the only ones with commit access to the revision control system, most contributions must come as patches. These patches can be tricky to create in the best of times, but with scale this problem becomes untenable. Just check out the linux kernel mailing list to get a sense of the problem.

The answer to these problems is called a [Distributed Version Control System](http://en.wikipedia.org/wiki/Distributed_revision_control), or DVCS. There are quite a few of these animals out there. Most recently, it seems as if the open source playing field is being dominated by three: [Bazaar](http://bazaar-vcs.org/), [Git](http://git-scm.com/), and [Mercurial](http://www.selenic.com/mercurial/wiki/). All of these systems have their plusses and minusses, but they are all open source and work well enough to get the job done.

Distributed version control systems share quite a few things in common. Instead of using a line or [tree](http://en.wikipedia.org/wiki/Tree_data_structure) with named revision numbers to store the change history, distributed revision control systems use [directed acyclic graphs](http://en.wikipedia.org/wiki/Directed_acyclic_graph). This basically means that you can have multiple valid lines or trees at the same time. Hence, distributed.

What this means to you (the developer) is that you get a local copy of the entire repository available to you at all times. That means you can check in, revert, merge, create branches, etc without a network connection.

It also means that you always have access to that revision control sandbox. It allows you to &#8216;check in early, check in often&#8217;, and still not live in fear of breaking the build or disrupting somebody elses work with your bad code. When your code is good and ready, you can review it&#8217;s entire change history, merge in any changes, and submit the entire changeset directly to the central repository or to a core committer as a patch.

Having a local copy of the repository also means that you have a more complete copy of your source code at every developer location  with a DVCS than you would with a traditional VCS.

I&#8217;ll get into the nitty-gritty of how to actually start using DVCS (and how&#8217;s it&#8217;s arguably faster and easer than svn) in another post, but for now, just get out there and use something. Not using source control is like skydiving without a parachute.

References:

  * James Golick has a friendly [introduction](http://jamesgolick.com/tags/dvcs.html) to DVCS logic.
  * Eric Sink has some solid posts about [Source Control](http://www.ericsink.com/scm/source_control.html) and [DVCS and DAGs](http://www.ericsink.com/entries/dvcs_dag_1.html)