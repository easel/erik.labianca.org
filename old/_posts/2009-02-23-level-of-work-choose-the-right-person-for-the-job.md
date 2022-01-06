---
id: 74
title: 'Level of Work: Choose the right person for the task'
date: 2009-02-23T11:36:14+00:00
author: erik
layout: post
guid: http://www.cto-at-large.com/?p=74
permalink: /2009/02/level-of-work-choose-the-right-person-for-the-job/
aktt_notify_twitter:
  - yes
aktt_tweeted:
  - 1
categories:
  - Management
tags:
  - Management
  - Project management
---
In the managerial world, at least in some circles, <a class="zem_slink" title="Elliott Jaques" rel="wikipedia" href="http://en.wikipedia.org/wiki/Elliott_Jaques">Elliott Jacques</a> is well known for his theory of <a class="zem_slink" title="Requisite organization" rel="wikipedia" href="http://en.wikipedia.org/wiki/Requisite_organization">requisite organization</a>. While his work runs against some of the conventional wisdom of <a class="zem_slink" title="Organizational studies" rel="wikipedia" href="http://en.wikipedia.org/wiki/Organizational_studies">organizational theory</a>, his Level of Work concept has merit for anyone. Bear in mind that this is a very cursory overview of a complex theory, so in order to really put it to use you&#8217;ll need to do some more background research.

In short, Jacques found that human&#8217;s ability to handle task complexity increases in step-wise manner, each level of which he called a Level of Work. Each level of work can be defined in terms of its maximum Time Span of Discretion (or time span), and also by the problem solving methodology required to be able to operate effectively at that level. In addition, since the levels of work are discrete, the crux of requisite organization theory is that each level must be &#8220;stacked&#8221; appropriately within the organization for the organization to function effectively. Jacques uses the term &#8220;Cognitive Capability&#8221; to describe the level of work a given person is capable of.

<div id="attachment_78" style="width: 310px" class="wp-caption alignright">
  <img class="size-full wp-image-78" title="38637594_141a1c401a" src="http://erik.labianca.org/blog/wp-content/uploads/2009/02/38637594_141a1c401a.jpg" alt="Hard at Work!" width="300" height="225" srcset="http://erik.labianca.org/blog/wp-content/uploads/2009/02/38637594_141a1c401a.jpg 500w, http://erik.labianca.org/blog/wp-content/uploads/2009/02/38637594_141a1c401a-300x225.jpg 300w" sizes="(max-width: 300px) 100vw, 300px" />
  
  <p class="wp-caption-text">
    Hard at Work!
  </p>
</div>

Regardless, organizational theory aside, the concept of work levels brings much to bear to technical work as well. In a technical environment, Jacques theory provides a way to determine the best person for a given technical task. In addition, understanding a person&#8217;s cognitive capability makes it possible to ensure that you assign them tasks in chunks they are capable of handling.

**Stratum I &#8211; Engineers
  
** 

In a traditional environment, Stratum I is tasked with &#8220;getting the work done&#8221;. Their time-span is limited to less than 3 months, and they solve problems by trial and error. To put this into perspective, I don&#8217;t think I&#8217;ve ever seen a programming team that didn&#8217;t have at least one fabled Stratum I member. In technical terms, a person capable of Stratum I level of work could handle filling in some function definitions that were already defined, or installing a bunch of operating systems based on a procedure they were given.

The things a Stratum I worker can&#8217;t do is where they become fabled. This is the guy that was tasked with putting together a new OS image but forgot to check whether or not automatic updates were enabled. Or the gal tasked with creating a program to extract information from some production logs, but who didn&#8217;t bother to check if the parsing libraries they used was compatible with the production environment.

Bear in mind that this doesn&#8217;t make them incompetent. They may know more than most people about  OS images or log parsing, but their limited time span makes it hard for them to see a bigger picture. They are focused on the immediate task, and nothing else.

**Stratum II** &#8211; **Senior Engineers**

In a traditional environment, Stratum II workers are called Supervisors and charged with &#8220;making sure the work gets done&#8221;. Their time span upper bound is 1 year, and they are capable of problem solving by information gathering. In technical terms, these folk are probably considered &#8220;Senior Engineers&#8221;. They are capable of working at a higher level, such as &#8220;design and implement a system to integrate product A and B&#8221;. However, it&#8217;s important to note their limitations.

A time span of 1 year is still not very long. It is long enough to implement a significant chunk of code, but probably not long enough to design a chunk of code that will underpin an entire system for many years. In addition, while they are capable of problem solving by gathering information from multiple sources, they are still not really capable of serial processing. This means they will still have trouble seeing the results of their actions on a larger scope.

Bringing us back to the previous example, assigning the OS image creation task to a Stratum II worker would probably result in properly functioning automatic updates, but would likely fail to anticipate the need to roll out the next service pack or hardware generation. Note that this may well be ok, we don&#8217;t always have a crystal ball for the future!

**Stratum III &#8211; Architects**

In a traditional environment, Stratum III workers are called Managers and charged with &#8220;creating systems&#8221;. They have a maximum time span of 2 years and can problem solve using serial processing. In technical terms, these folk are probably your system architects, principal engineers, and perhaps VP of engineering types.

A 2 year time-span combined with serial processing capability is a powerful combination. These are the guys that join your team and start creating systems to speed things up. If you don&#8217;t have revision control, defect tracking, or change management, they won&#8217;t rest until they&#8217;re in place because they can see the long term benefits of these systems. They are also likely to ask lots of big-picture questions and wonder where your specifications and test procedures are.

Unfortunately, the ability to see the big picture isn&#8217;t always a benefit. Task a Stratum III worker with a simple task like &#8220;refactor this class&#8221; and there is a good chance it will take him 3 times as long as necessary to finish as he creates the perfect system to solve your trivial problem and whole host of other associated problems. On the other hand, these kind of system builders are the reason we have automated <a class="zem_slink" title="Code refactoring" rel="wikipedia" href="http://en.wikipedia.org/wiki/Code_refactoring">refactoring</a> tools!

**Stratum IV &#8211; Integrators**

Traditionally, Stratum IV workers are called integrators. They are often general managers, or C-Level execs with cross functional responsibilities such as operations, financial, and technical officers. They have a maximum time span of 5 years and can handle problem solving using parallel reasoning. In technical terms, you&#8217;d better hope your <a class="zem_slink" title="Chief technical officer" rel="wikipedia" href="http://en.wikipedia.org/wiki/Chief_technical_officer">CTO</a> can operate at this level. Many very senior engineers operate at this level and above as well. The defining trait of Stratum IV ability is following multiple lines of serial reasoning concurrently.

For instance, the choice of a development platform in a reasonably large company requires at least Stratum IV work level capability. There will be potentially dozens of ramifications of such a choice, from your ability to hire in talent, to the efficiency of development, to the ease of deployment, to the production environment security and finally to the usability of the final product. Each of these lines of reasoning will unfold for years, and the ability to &#8220;zoom out&#8221; in perspective enough to focus on what is important while ignoring the mass of irrelevant details is of paramount importance.

There are lots of other technical tasks that fall under Stratum IV and higher time span. Language design, API decisions and Enterprise Systems Architecture come to mind immediately. What others can you think of?

**Conclusion**

In conclusion, it&#8217;s important to recognize the work level capability of the folks on your team, and the complexity of the tasks you assign. It&#8217;s possible to break down a given task to any level necessary, and if the level of detail provided matches the capability of the worker you will get much better results. As I said above, I highly recommend learning more about Jacques Capability Model to anyone involved in project management or working with teams.

Unfortunately, I&#8217;ve only been able to scratch the surface with this post. I&#8217;ve included a few links to other blogs that feature Jacques capability model, in addition to some amazon links to Jacques original books (which are not for the faint-hearted).

**Other Resources**

  * Michelle Malay-Carter&#8217;s mission minded management blog has some great material about requisitive organization and work levels. Check out her <a title="http://www.missionmindedmanagement.com/why-cant-we-figure-out-how-to-select-leaders" href="http://www.missionmindedmanagement.com/why-cant-we-figure-out-how-to-select-leaders" target="_blank">latest post</a> about work levels, and <a title="http://www.missionmindedmanagement.com/economic-woes-will-spur-more-underemployment-which-will-spur-more-workplace-woes" href="http://www.missionmindedmanagement.com/economic-woes-will-spur-more-underemployment-which-will-spur-more-workplace-woes" target="_blank">this post</a> talking about the dangers of over-hiring I mentioned under Stratum III.
  * Tom Foster&#8217;s management skills blog is another great resource for information about work levels and job strata. He&#8217;s also a management consultant and teacher. I&#8217;ve taken his online course and recommend it highly. Check out <a title="http://www.managementblog.org/archives/2008/05/14/accurate-and-complete/" href="http://www.managementblog.org/archives/2008/05/14/accurate-and-complete/" target="_blank">this post</a> (or <a title="http://www.managementblog.org/archives/2009/02/23/judgment-and-decision-making/" href="http://www.managementblog.org/archives/2009/02/23/judgment-and-decision-making/" target="_blank">this more recent one)</a> for one entry to his large catalog of material. Tom takes an interesting story-telling approach, but stick with it.  Following the stories will pay off.
  * Jacques himself on [Executive Leadership: A Practical Guide to Managing Complexity (Developmental Management)](http://www.amazon.com/gp/product/0631193138?ie=UTF8&tag=erlactatla-20&linkCode=as2&camp=1789&creative=9325&creativeASIN=0631193138)<img style="border:none !important; margin:0px !important;" src="http://www.assoc-amazon.com/e/ir?t=erlactatla-20&l=as2&o=1&a=0631193138" border="0" alt="" width="1" height="1" />

<div class="zemanta-pixie" style="margin-top: 10px; height: 15px;">
  <a class="zemanta-pixie-a" title="Zemified by Zemanta" href="http://reblog.zemanta.com/zemified/838f1183-d5af-4e28-bce3-56e199a93d51/"><img class="zemanta-pixie-img" style="border: medium none; float: right;" src="http://img.zemanta.com/reblog_e.png?x-id=838f1183-d5af-4e28-bce3-56e199a93d51" alt="Reblog this post [with Zemanta]" /></a>
</div>