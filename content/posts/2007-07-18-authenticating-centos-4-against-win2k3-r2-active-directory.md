---
title: "Authenticating CentOS 4 against Win2k3 R2 Active Directory"
date: 2007-07-18T20:27:42+00:00
author: "Erik LaBianca"
draft: false
description: "Step-by-step guide to authenticating CentOS 4 Linux against Windows Server 2003 R2 Active Directory using LDAP and Kerberos."
categories:
  - Computing
  - Sysadmin
---
Prescript: I wrote this over a month ago and still haven't found an authoring plugin I like so it still looks terrible. See my next post and give me ideas or just call me lazy, thanks!

Based on http://blog.scottlowe.org/2007/01/15/linux-ad-integration-version-4/

First, install windows 2003 R2 and install the identity management for unix option. Open control panel, select add remove programs, click add/remove windows components. It will grind a while and give you a list of possible services. You'll need to expand 'Active Directory Services' and check the 'Identify Management for Unix' service. You will need to be in the schema admins group to do this.

In order to test, you'll want go to the 'Unix Attributes' tab on a user and activate them as a unix user. You'll need to pick a NIS domain (you'll probably only have one if you haven't done this before) and add a unix ID and home directory. Typically the default values will be fine to get you started.

Now, log into your unix machine. Make sure it can resolve the dns name of your active directory server(s).

Run authconfig.

Check [] Use LDAP
Check [] Use LDAP Authentication
Check [] Use Kerberos
Check [] Local authorization is sufficient

You can check [] Cache Information if you want. I wouldn't until you know things work, as nscd can get out of sync with server and cause confusion.

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

Now a lot of things are set up, but of course we're not quite done. We'll need to add lines to /etc/ldap.conf in order to allow us to query ldap. Ideally, you'll have created an account specifically for this purpose (Domain Users group seems to work). I use linux_auth but it truly doesn't matter.

```bash
echo "binddn linux_auth@corp.example.com" >> /etc/ldap.conf
echo "bindpw secret" >> /etc/ldap.conf
```

you will also need to uncomment or add the RFC2307 AD mappings from the /etc/ldap.conf file. You can also just run this:

```
cat >> /etc/ldap.conf <<-ENDDOC
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
```

Test your config exactly like Scott's directions say. Using your regular user account for the test should be fine. If you get the error kinit(5): KDC reply did not match expectations while getting initial credentials, it's because you didn't log in using the kerberos realm, which is in ALL CAPS! Scott's directions aren't real explicit about this and I spent a while figuring it out. Maybe you won't have to.

```bash
kinit user@CORP.EXAMPLE.COM
```

It will ask for your password and should just return blank if it was successful. You can then use klist to check and see if you got a TGT.

```bash
getent passwd user
```

You'll see something like this:

```text
user:x:10000:10000:User:/home/user:/bin/sh
```

Now we're almost done. We just need to use samba to join the computer to the domain. you'll need the following in your smb.conf

```
workgroup = CORP
  security = ads
  realm = corp.example.com
  use kerberos keytab = true
  password server = adserver.corp.example.com
```

Then you need to destroy any old kerberos tickets

```bash
kdestroy
```

Then authorize kerberos with a domain admin account to join active directory

```bash
kinit Administrator@CORP.EXAMPLE.COM
```

Then finally join the domain

```bash
net ads join
```

That will grind for a little while and you'll be all set. You should get something like this:

```text
[root@vpc-dev0 ~]# net ads join
Using short domain name -- CORP
Joined 'VPC-DEV0' to realm 'CORP.EXAMPLE.COM'
```

Finally, you'll need to get everybody home directories. I always use autofs, something like this:

```
echo /home /etc/auto.home >> /etc/auto.master
echo *       -rw,bg,intr,hard,rsize=32768,wsize=32768,tcp,vers=3       nfsserver:/vol/work/users_unix/& >> /etc/auto.home
chkconfig autofs on
service autofs start
```

So now the final test... try to log in with ssh!
