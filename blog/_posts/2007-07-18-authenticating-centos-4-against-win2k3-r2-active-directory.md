---
id: 25
title: Authenticating CentOS 4 against Win2k3 R2 Active Directory
date: 2007-07-18T20:27:42+00:00
author: erik
layout: post
guid: http://blogs.ilsw.com/erik/2007/07/18/authenticating-centos-4-against-win2k3-r2-active-directory/
permalink: /2007/07/authenticating-centos-4-against-win2k3-r2-active-directory/
categories:
  - Computing
  - Sysadmin
---
Prescript: I wrote this over a month ago and still haven&#8217;t found an authoring plugin I like so it still looks terrible. See my next post and give me ideas or just call me lazy, thanks!

Based on http://blog.scottlowe.org/2007/01/15/linux-ad-integration-version-4/

First, install windows 2003 R2 and install the identity management for unix option. Open control panel, select add remove programs, click add/remove windows components. It will grind a while and give you a list of possible services. You&#8217;ll need to expand &#8216;Active Directory Services&#8217; and check the &#8216;Identify Management for Unix&#8217; service. You will need to be in the schema admins group to do this.

In order to test, you&#8217;ll want go to the &#8216;Unix Attributes&#8217; tab on a user and activate them as a unix user. You&#8217;ll need to pick a NIS domain (you&#8217;ll probably only have one if you haven&#8217;t done this before) and add a unix ID and home directory. Typically the default values will be fine to get you started.

Now, log into your unix machine. Make sure it can resolve the dns name of your active directory server(s).

Run authconfig.

Check [] Use LDAP
  
Check [] Use LDAP Authentication
  
Check [] Use Kerberos
  
Check [] Local authorization is sufficient

You can check [] Cache Information if you want. I wouldn&#8217;t until you know things work, as nscd can get out of sync with server and cause confusion.

Select [ Next ]

Enter your AD server dns name in the server. For example, adserver.corp.example.com
  
Enter your AD base DN in the Base DN field. For example, dc=corp,dc=example,dc=com

Select [ Next ]

Enter your local dns name, in ALL CAPS in the realm field. For example, corp.example.com.
  
Enter your server name:88 in the KDC field. For example adserver.corp.example.com:88
  
Enter your server name:749 in the admin server field. For example adserver.corp.example.com:749
  
Check [] Use DNS to resolve hosts to realms
  
Check [] Use DNS to locate KDCs for realms

Select [ Finish ]

Now a lot of things are set up, but of course we&#8217;re not quite done. We&#8217;ll need to add lines to /etc/ldap.conf in order to allow us to query ldap. Ideally, you&#8217;ll have created an account specifically for this purpose (Domain Users group seems to work). I use linux_auth but it truly doesn&#8217;t matter.

echo &#8220;binddn linux_auth@corp.example.com&#8221; >> /etc/ldap.conf
  
echo &#8220;bindpw secret&#8221; >> /etc/ldap.conf

you will also need to uncomment or add the RFC2307 AD mappings from the /etc/ldap.conf file. You can also just run this:

<pre>cat >> /etc/ldap.conf &lt; &lt;-ENDDOC
# RFC 2307 (AD) mappings
nss_map_objectclass posixAccount user
nss_map_objectclass shadowAccount user
nss_map_attribute uid sAMAccountName
nss_map_attribute homeDirectory unixHomeDirectory
nss_map_attribute shadowLastChange pwdLastSet
nss_map_objectclass posixGroup group
nss_map_attribute uniqueMember member
pam_login_attribute sAMAccountName
pam_filter objectclass=User
pam_password ad
ENDDOC
</pre>

Test your config exactly like Scott's directions say. Using your regular user account for the test should be fine. If you get the error kinit(5): KDC reply did not match expectations while getting initial credentials, it's because you didn't log in using the kerberos realm, which is in ALL CAPS! Scott's directions aren't real explicit about this and I spent a while figuring it out. Maybe you won't have to.

kinit user@CORP.EXAMPLE.COM

It will ask for your password and should just return blank if it was successful. You can then use klist to check and see if you got a TGT. 

getent passwd user

You'll see something like this:

user:x:10000:10000:User:/home/user:/bin/sh

Now we're almost done. We just need to use samba to join the computer to the domain. you'll need the following in your smb.conf

<pre>workgroup = CORP
  security = ads
  realm = corp.example.com
  use kerberos keytab = true
  password server = adserver.corp.example.com
</pre>

Then you need to destroy any old kerberos tickets 

kdestroy

Then authorize kerberos with a domain admin account to join active directory

kinit Administrator@CORP.EXAMPLE.COM

Then finally join the domain

net ads join

That will grind for a little while and you&#8217;ll be all set. You should get something like this:

[root@vpc-dev0 ~]# net ads join
  
Using short domain name &#8212; CORP
  
Joined &#8216;VPC-DEV0&#8217; to realm &#8216;CORP.EXAMPLE.COM&#8217;

Finally, you&#8217;ll need to get everybody home directories. I always use autofs, something like this:

<pre>echo /home /etc/auto.home >> /etc/auto.master
echo *       -rw,bg,intr,hard,rsize=32768,wsize=32768,tcp,vers=3       nfsserver:/vol/work/users_unix/& >> /etc/auto.home
chkconfig autofs on
service autofs start
</pre>

So now the final test&#8230; try to log in with ssh!