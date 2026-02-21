---
title: "Get Started Using Mercurial Source Control in 5 Minutes or Less"
date: 2009-05-12T09:51:40+00:00
author: "Erik LaBianca"
draft: false
description: "A quick-start guide to using Mercurial DVCS for source control on any computer in just minutes."
categories:
  - Information
  - Technical
tags:
  - dvcs
  - howto
  - Programming
  - revision control
  - source control
  - tools
---

While, in a previous post I talked about how DVCS is the modern form of source control and promised I'd show you how to do it, quickly and easily. So let's get started! I'm going to use Mercurial because, well, I am.

First, you need to download the Mercurial package for your system. If you use a mac with [macports](http://www.macports.org/) you can just use type `sudo port install mercurial`. You could also use the very nice mac .dmg packages from [berkwood](http://mercurial.berkwood.com/). On Ubuntu, you should be able to `sudo apt-get install mercurial`. On windows, you'll probably want to download and install [TortoiseHG](http://bitbucket.org/tortoisehg/stable/wiki/Home). BitBucket makes it complicated to find the download link so just click [this one](http://bitbucket.org/tortoisehg/stable/downloads/) instead. You'll want the file in the top of the list. Right now, that is [TortoiseHg-0.7.5-hg-1.2.1.exe](http://bitbucket.org/tortoisehg/stable/downloads/TortoiseHg-0.7.5-hg-1.2.1.exe).

So, you should now have a working mercurial command line executable. To try it out, open your shell of choice and type `hg`. You should get something like this:

```text
loki:dtest erik$ hg
Mercurial Distributed SCM

basic commands:

 add        add the specified files on the next commit
 annotate   show changeset information per file line
 clone      make a copy of an existing repository
 commit     commit the specified files or all outstanding changes
 diff       diff repository (or selected files)
 export     dump the header and diffs for one or more changesets
 init       create a new repository in the given directory
 log        show revision history of entire repository or files
 merge      merge working directory with another revision
 parents    show the parents of the working dir or revision
 pull       pull changes from the specified source
 push       push changes to the specified destination
 remove     remove the specified files on the next commit
 serve      export the repository via HTTP
 status     show changed files in the working directory
 update     update working directory

use "hg help" for the full list of commands or "hg -v" for details
```

Now comes the fun part. Simply navigate to the directory you want to put under revision control and run `hg init`. This will create the `.hg` directory which stores your local repository.

Your next step should be to create a `.hgignore` file. This file will tell mercurial which file types to ignore. It can use two syntaxes, standard shell globs and also regular expressions. This should give you enough flexibility to eliminate all those pesky auto-generated files, movies, etc from your project directory. Here's what I've been using for drupal projects lately, it should give you a good idea of what sort of patterns you might use.

```text
syntax: glob
*.pyc
*~
hostmeta.ini
Thumbs.db
.DS_Store
*.exe
*.flv
*.mov
*.zip
*.avi
*.wmv
*.dv
*.psd
*.LCK

syntax: regexp
.*\#.*\#$
^files.*
^web/files.*
.*CVS.*
```

Now that we've got an `.hgignore` file, let's check it into revision control. Simply execute

```bash
hg add .hgignore
```

and then

```bash
hg commit -m 'added .hgignore file'
```

The `add` tells mercurial to flag the file revision control. The `commit` command will actually push the contents of the file into the revision control repository.

Now, let's put your files under revision control. At this point, since you have a `.hgignore` file that eliminates all the files you don't want controlled, you can run the

```bash
hg status
```

command. It will show you all the status of all the files in the revision controlled tree. File which are checked in and already up to date or ignored will not show up on the listing. For a newly created [Django](http://www.djangoproject.org/) project with a single app in it, you might see something like this:

```text
loki:dtest erik$ hg status
? __init__.py
? manage.py
? myapp/__init__.py
? myapp/models.py
? myapp/tests.py
? myapp/views.py
? settings.py
? urls.py
loki:dtest eri
```

Now, if all the with ? in front of them are ones you want to add to revision control, simply execute

```bash
hg addremove
```

This will recurse the tree and add all the missing files, and mark any files that have disappeared from your local tree as deleted in the repository. Then, you just run

```bash
hg commit -m 'added first set of files'
```

in order check everything in.

If you had files with ? that you don't want under revision control, you will need to add expressions to your `.hgignore` file to ignore them and re-run status. You can also just use add manually on your files, but in my opinion the addremove feature is such a nice addition and hg status is such a powerful feature you will be much better off taking the time to maintain an ignore file.

So, you've now got a copy of your code in revision control. A simple `hg status` should return blank, indicating that your working copy is in sync with the repository. So let's check out that safety net.

Let's make a random change to our urls.py.

```bash
echo "# this comment is really lame" >> urls.py
```

And now run `hg status` one more time. You should see something like this:

```text
loki:dtest erik$ hg status
M urls.py
```

The `M` prefix indicates that the file has been modified. Now, let's see what exactly was modified. Run `hg diff`. You should get a result like this:

```diff
loki:dtest erik$ hg diff
diff -r 7844b323276e urls.py
--- a/urls.py   Tue May 12 02:56:05 2009 -0400
+++ b/urls.py   Tue May 12 02:58:47 2009 -0400
@@ -15,3 +15,4 @@
     # Uncomment the next line to enable the admin:
     # (r'^admin/', include(admin.site.urls)),
 )
+# this comment is really lame
```

As you can see, we have a nicely unified diff indicating that we added a single line. If you installed a GUI package, you can probably use the GUI to bring up a much more nicely formatted GUI change viewer.

So, now we know what we changed. That's pretty useful, but how do we get rid of that change? Again, really easy, simply use the `hg revert` command. If you don't want to revert all your changes, you can run `hg revert urls.py` for instance, which will only revert changes to `urls.py`.

If you revert a file and then run hg status, you'll note that the file is no longer marked as modified and there is a new `? urls.py.orig` file which mercurial has nicely decided to keep in case you change your mind. I guess .orig would be a good suffix to add to your `.hgignore` file!

Obviously we've just barely begun to scratch the surface of mercurial and DVCS's in general, but there's plenty of time for more learning. Even if you just use it for diffs and revert, you're getting great value from your DVCS and are ready to add in more functionality as you need it. Good luck!
