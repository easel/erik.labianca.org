---
id: 135
title: Django PostgreSQL ORM Overhead
date: 2010-06-24T20:15:12+00:00
author: erik
layout: post
guid: http://erik.labianca.org/blog/?p=135
permalink: /2010/06/django-postgresql-orm-overhead/
aktt_notify_twitter:
  - no
categories:
  - Uncategorized
---
This is another post I&#8217;ve been sitting on for the better part of a year. I&#8217;m putting it out there in case the raw numbers are useful to anybody.

So I&#8217;ve been dealing with some database performance issues with a fairly large Django application and have been trying to track down exactly where the bottlenecks are. Interestingly, neither the application servers nor the database server displays high cpu utilization, so something is locking outside of pure CPU.

All tests were run on an AWS EC2 image, running CentOS 5.3, Python 2.6 and the PGDG PostgreSQL83 RPM packages. The database server is an identical AWS image running PGDG postgresql83.

The quick takeaways from all this are the following:

  1. PostgreSQL singleton selects are pretty fast
  2. The libpq library imposes more overhead than the database server does
  3. For the trivial case of an application that uses PostgreSQL as a key-value store containing a working set less than 1/2 the system RAM, you&#8217;ll need many application servers to saturate it. No, I don&#8217;t know how many, but it doesn&#8217;t really matter because for a non-trivial application the PostgreSQL client library overhead will become negligible.
  4. The Django ORM and psycopg2 drivers add approximately 50% overhead vs. pure c+libpq program.
  5. There are some interesting bottlenecks out there that will prevent CPU saturation of a trivial workload. No, I do not know what they are (yet).
  6. PgBouncer adds a bit of overhead to maximum throughput, around 5% in this case.
  7. Local connections are faster than network connections. Add this to the fact there seem to be some wierd bottlenecks and you might find that your app runs faster on 1 server than 2. Interesting.

I put together some very simple tests to try to figure out what&#8217;s going on.

First, the &#8220;Django&#8221; program:
  
`<br />
#!/usr/bin/python26<br />
from pprint import pprint<br />
import sys<br />
import os`

<span style="font-family: monospace;">from django.core.management import execute_manager</span>

`try:<br />
import local_settings<br />
except ImportError:<br />
import sys<br />
sys.stderr.write("Unable to find settings file")<br />
sys.exit(1)</p>
<p>from django.contrib.sites.models import Site</p>
<p>def stest():<br />
s = Site.objects.get(domain = 'example.com')</p>
<p>`

``This is another post I&#8217;ve been sitting on for the better part of a year. I&#8217;m putting it out there in case the raw numbers are useful to anybody.

So I&#8217;ve been dealing with some database performance issues with a fairly large Django application and have been trying to track down exactly where the bottlenecks are. Interestingly, neither the application servers nor the database server displays high cpu utilization, so something is locking outside of pure CPU.

All tests were run on an AWS EC2 image, running CentOS 5.3, Python 2.6 and the PGDG PostgreSQL83 RPM packages. The database server is an identical AWS image running PGDG postgresql83.

The quick takeaways from all this are the following:

  1. PostgreSQL singleton selects are pretty fast
  2. The libpq library imposes more overhead than the database server does
  3. For the trivial case of an application that uses PostgreSQL as a key-value store containing a working set less than 1/2 the system RAM, you&#8217;ll need many application servers to saturate it. No, I don&#8217;t know how many, but it doesn&#8217;t really matter because for a non-trivial application the PostgreSQL client library overhead will become negligible.
  4. The Django ORM and psycopg2 drivers add approximately 50% overhead vs. pure c+libpq program.
  5. There are some interesting bottlenecks out there that will prevent CPU saturation of a trivial workload. No, I do not know what they are (yet).
  6. PgBouncer adds a bit of overhead to maximum throughput, around 5% in this case.
  7. Local connections are faster than network connections. Add this to the fact there seem to be some wierd bottlenecks and you might find that your app runs faster on 1 server than 2. Interesting.

I put together some very simple tests to try to figure out what&#8217;s going on.

First, the &#8220;Django&#8221; program:
  
`<br />
#!/usr/bin/python26<br />
from pprint import pprint<br />
import sys<br />
import os`

<span style="font-family: monospace;">from django.core.management import execute_manager</span>

`try:<br />
import local_settings<br />
except ImportError:<br />
import sys<br />
sys.stderr.write("Unable to find settings file")<br />
sys.exit(1)</p>
<p>from django.contrib.sites.models import Site</p>
<p>def stest():<br />
s = Site.objects.get(domain = 'example.com')</p>
<p>`

`` 

The C program:
  
`<br />
/*<br />
* testlibpq.c<br />
*<br />
*      Test the C version of libpq, the PostgreSQL frontend library.<br />
*/<br />
#include<br />
#include<br />
#include "libpq-fe.h"`

 ``

`static void<br />
exit_nicely(PGconn *conn)<br />
{<br />
PQfinish(conn);<br />
exit(1);<br />
}</p>
<p>int<br />
main(int argc, char **argv)<br />
{<br />
const char *conninfo;<br />
PGconn     *conn;<br />
PGresult   *res;<br />
int         nFields;<br />
int         count,<br />
i,<br />
j;</p>
<p>/*<br />
* If the user supplies a parameter on the command line, use it as the<br />
* conninfo string; otherwise default to setting dbname=postgres and using<br />
* environment variables or defaults for all other connection parameters.<br />
*/<br />
if (argc > 1)<br />
conninfo = argv[1];<br />
else<br />
conninfo = "dbname = ngdm_wpf_content";</p>
<p>/* Make a connection to the database */<br />
conn = PQconnectdb(conninfo);</p>
<p>/* Check to see that the backend connection was successfully made */<br />
if (PQstatus(conn) != CONNECTION_OK)<br />
{<br />
fprintf(stderr, "Connection to database failed: %s",<br />
PQerrorMessage(conn));<br />
exit_nicely(conn);<br />
}</p>
<p>/*<br />
* Our test case here involves using a cursor, for which we must be inside<br />
* a transaction block.  We could do the whole thing with a single<br />
* PQexec() of "select * from pg_database", but that's too trivial to make<br />
* a good example.<br />
*/</p>
<p>for ( count=0; count < 100; count++) {<br />
/* Start a transaction block */<br />
res = PQexec(conn, "SELECT * FROM django_site WHERE django_site.domain = 'example.com' ORDER BY django_site.domain;");<br />
if (PQresultStatus(res) != PGRES_TUPLES_OK)<br />
{<br />
fprintf(stderr, "SELECT command failed (%d): %s", PQresultStatus(res), PQerrorMessage(conn));<br />
PQclear(res);<br />
exit_nicely(conn);<br />
}</p>
<p>PQclear(res);</p>
<p>}</p>
<p>/* close the connection to the database and cleanup */<br />
PQfinish(conn);</p>
<p>`

 ```This is another post I&#8217;ve been sitting on for the better part of a year. I&#8217;m putting it out there in case the raw numbers are useful to anybody.

So I&#8217;ve been dealing with some database performance issues with a fairly large Django application and have been trying to track down exactly where the bottlenecks are. Interestingly, neither the application servers nor the database server displays high cpu utilization, so something is locking outside of pure CPU.

All tests were run on an AWS EC2 image, running CentOS 5.3, Python 2.6 and the PGDG PostgreSQL83 RPM packages. The database server is an identical AWS image running PGDG postgresql83.

The quick takeaways from all this are the following:

  1. PostgreSQL singleton selects are pretty fast
  2. The libpq library imposes more overhead than the database server does
  3. For the trivial case of an application that uses PostgreSQL as a key-value store containing a working set less than 1/2 the system RAM, you&#8217;ll need many application servers to saturate it. No, I don&#8217;t know how many, but it doesn&#8217;t really matter because for a non-trivial application the PostgreSQL client library overhead will become negligible.
  4. The Django ORM and psycopg2 drivers add approximately 50% overhead vs. pure c+libpq program.
  5. There are some interesting bottlenecks out there that will prevent CPU saturation of a trivial workload. No, I do not know what they are (yet).
  6. PgBouncer adds a bit of overhead to maximum throughput, around 5% in this case.
  7. Local connections are faster than network connections. Add this to the fact there seem to be some wierd bottlenecks and you might find that your app runs faster on 1 server than 2. Interesting.

I put together some very simple tests to try to figure out what&#8217;s going on.

First, the &#8220;Django&#8221; program:
  
`<br />
#!/usr/bin/python26<br />
from pprint import pprint<br />
import sys<br />
import os`

<span style="font-family: monospace;">from django.core.management import execute_manager</span>

`try:<br />
import local_settings<br />
except ImportError:<br />
import sys<br />
sys.stderr.write("Unable to find settings file")<br />
sys.exit(1)</p>
<p>from django.contrib.sites.models import Site</p>
<p>def stest():<br />
s = Site.objects.get(domain = 'example.com')</p>
<p>`

``This is another post I&#8217;ve been sitting on for the better part of a year. I&#8217;m putting it out there in case the raw numbers are useful to anybody.

So I&#8217;ve been dealing with some database performance issues with a fairly large Django application and have been trying to track down exactly where the bottlenecks are. Interestingly, neither the application servers nor the database server displays high cpu utilization, so something is locking outside of pure CPU.

All tests were run on an AWS EC2 image, running CentOS 5.3, Python 2.6 and the PGDG PostgreSQL83 RPM packages. The database server is an identical AWS image running PGDG postgresql83.

The quick takeaways from all this are the following:

  1. PostgreSQL singleton selects are pretty fast
  2. The libpq library imposes more overhead than the database server does
  3. For the trivial case of an application that uses PostgreSQL as a key-value store containing a working set less than 1/2 the system RAM, you&#8217;ll need many application servers to saturate it. No, I don&#8217;t know how many, but it doesn&#8217;t really matter because for a non-trivial application the PostgreSQL client library overhead will become negligible.
  4. The Django ORM and psycopg2 drivers add approximately 50% overhead vs. pure c+libpq program.
  5. There are some interesting bottlenecks out there that will prevent CPU saturation of a trivial workload. No, I do not know what they are (yet).
  6. PgBouncer adds a bit of overhead to maximum throughput, around 5% in this case.
  7. Local connections are faster than network connections. Add this to the fact there seem to be some wierd bottlenecks and you might find that your app runs faster on 1 server than 2. Interesting.

I put together some very simple tests to try to figure out what&#8217;s going on.

First, the &#8220;Django&#8221; program:
  
`<br />
#!/usr/bin/python26<br />
from pprint import pprint<br />
import sys<br />
import os`

<span style="font-family: monospace;">from django.core.management import execute_manager</span>

`try:<br />
import local_settings<br />
except ImportError:<br />
import sys<br />
sys.stderr.write("Unable to find settings file")<br />
sys.exit(1)</p>
<p>from django.contrib.sites.models import Site</p>
<p>def stest():<br />
s = Site.objects.get(domain = 'example.com')</p>
<p>`

`` 

The C program:
  
`<br />
/*<br />
* testlibpq.c<br />
*<br />
*      Test the C version of libpq, the PostgreSQL frontend library.<br />
*/<br />
#include<br />
#include<br />
#include "libpq-fe.h"`

 ``

`static void<br />
exit_nicely(PGconn *conn)<br />
{<br />
PQfinish(conn);<br />
exit(1);<br />
}</p>
<p>int<br />
main(int argc, char **argv)<br />
{<br />
const char *conninfo;<br />
PGconn     *conn;<br />
PGresult   *res;<br />
int         nFields;<br />
int         count,<br />
i,<br />
j;</p>
<p>/*<br />
* If the user supplies a parameter on the command line, use it as the<br />
* conninfo string; otherwise default to setting dbname=postgres and using<br />
* environment variables or defaults for all other connection parameters.<br />
*/<br />
if (argc > 1)<br />
conninfo = argv[1];<br />
else<br />
conninfo = "dbname = ngdm_wpf_content";</p>
<p>/* Make a connection to the database */<br />
conn = PQconnectdb(conninfo);</p>
<p>/* Check to see that the backend connection was successfully made */<br />
if (PQstatus(conn) != CONNECTION_OK)<br />
{<br />
fprintf(stderr, "Connection to database failed: %s",<br />
PQerrorMessage(conn));<br />
exit_nicely(conn);<br />
}</p>
<p>/*<br />
* Our test case here involves using a cursor, for which we must be inside<br />
* a transaction block.  We could do the whole thing with a single<br />
* PQexec() of "select * from pg_database", but that's too trivial to make<br />
* a good example.<br />
*/</p>
<p>for ( count=0; count < 100; count++) {<br />
/* Start a transaction block */<br />
res = PQexec(conn, "SELECT * FROM django_site WHERE django_site.domain = 'example.com' ORDER BY django_site.domain;");<br />
if (PQresultStatus(res) != PGRES_TUPLES_OK)<br />
{<br />
fprintf(stderr, "SELECT command failed (%d): %s", PQresultStatus(res), PQerrorMessage(conn));<br />
PQclear(res);<br />
exit_nicely(conn);<br />
}</p>
<p>PQclear(res);</p>
<p>}</p>
<p>/* close the connection to the database and cleanup */<br />
PQfinish(conn);</p>
<p>`

``` 

````This is another post I&#8217;ve been sitting on for the better part of a year. I&#8217;m putting it out there in case the raw numbers are useful to anybody.

So I&#8217;ve been dealing with some database performance issues with a fairly large Django application and have been trying to track down exactly where the bottlenecks are. Interestingly, neither the application servers nor the database server displays high cpu utilization, so something is locking outside of pure CPU.

All tests were run on an AWS EC2 image, running CentOS 5.3, Python 2.6 and the PGDG PostgreSQL83 RPM packages. The database server is an identical AWS image running PGDG postgresql83.

The quick takeaways from all this are the following:

  1. PostgreSQL singleton selects are pretty fast
  2. The libpq library imposes more overhead than the database server does
  3. For the trivial case of an application that uses PostgreSQL as a key-value store containing a working set less than 1/2 the system RAM, you&#8217;ll need many application servers to saturate it. No, I don&#8217;t know how many, but it doesn&#8217;t really matter because for a non-trivial application the PostgreSQL client library overhead will become negligible.
  4. The Django ORM and psycopg2 drivers add approximately 50% overhead vs. pure c+libpq program.
  5. There are some interesting bottlenecks out there that will prevent CPU saturation of a trivial workload. No, I do not know what they are (yet).
  6. PgBouncer adds a bit of overhead to maximum throughput, around 5% in this case.
  7. Local connections are faster than network connections. Add this to the fact there seem to be some wierd bottlenecks and you might find that your app runs faster on 1 server than 2. Interesting.

I put together some very simple tests to try to figure out what&#8217;s going on.

First, the &#8220;Django&#8221; program:
  
`<br />
#!/usr/bin/python26<br />
from pprint import pprint<br />
import sys<br />
import os`

<span style="font-family: monospace;">from django.core.management import execute_manager</span>

`try:<br />
import local_settings<br />
except ImportError:<br />
import sys<br />
sys.stderr.write("Unable to find settings file")<br />
sys.exit(1)</p>
<p>from django.contrib.sites.models import Site</p>
<p>def stest():<br />
s = Site.objects.get(domain = 'example.com')</p>
<p>`

``This is another post I&#8217;ve been sitting on for the better part of a year. I&#8217;m putting it out there in case the raw numbers are useful to anybody.

So I&#8217;ve been dealing with some database performance issues with a fairly large Django application and have been trying to track down exactly where the bottlenecks are. Interestingly, neither the application servers nor the database server displays high cpu utilization, so something is locking outside of pure CPU.

All tests were run on an AWS EC2 image, running CentOS 5.3, Python 2.6 and the PGDG PostgreSQL83 RPM packages. The database server is an identical AWS image running PGDG postgresql83.

The quick takeaways from all this are the following:

  1. PostgreSQL singleton selects are pretty fast
  2. The libpq library imposes more overhead than the database server does
  3. For the trivial case of an application that uses PostgreSQL as a key-value store containing a working set less than 1/2 the system RAM, you&#8217;ll need many application servers to saturate it. No, I don&#8217;t know how many, but it doesn&#8217;t really matter because for a non-trivial application the PostgreSQL client library overhead will become negligible.
  4. The Django ORM and psycopg2 drivers add approximately 50% overhead vs. pure c+libpq program.
  5. There are some interesting bottlenecks out there that will prevent CPU saturation of a trivial workload. No, I do not know what they are (yet).
  6. PgBouncer adds a bit of overhead to maximum throughput, around 5% in this case.
  7. Local connections are faster than network connections. Add this to the fact there seem to be some wierd bottlenecks and you might find that your app runs faster on 1 server than 2. Interesting.

I put together some very simple tests to try to figure out what&#8217;s going on.

First, the &#8220;Django&#8221; program:
  
`<br />
#!/usr/bin/python26<br />
from pprint import pprint<br />
import sys<br />
import os`

<span style="font-family: monospace;">from django.core.management import execute_manager</span>

`try:<br />
import local_settings<br />
except ImportError:<br />
import sys<br />
sys.stderr.write("Unable to find settings file")<br />
sys.exit(1)</p>
<p>from django.contrib.sites.models import Site</p>
<p>def stest():<br />
s = Site.objects.get(domain = 'example.com')</p>
<p>`

`` 

The C program:
  
`<br />
/*<br />
* testlibpq.c<br />
*<br />
*      Test the C version of libpq, the PostgreSQL frontend library.<br />
*/<br />
#include<br />
#include<br />
#include "libpq-fe.h"`

 ``

`static void<br />
exit_nicely(PGconn *conn)<br />
{<br />
PQfinish(conn);<br />
exit(1);<br />
}</p>
<p>int<br />
main(int argc, char **argv)<br />
{<br />
const char *conninfo;<br />
PGconn     *conn;<br />
PGresult   *res;<br />
int         nFields;<br />
int         count,<br />
i,<br />
j;</p>
<p>/*<br />
* If the user supplies a parameter on the command line, use it as the<br />
* conninfo string; otherwise default to setting dbname=postgres and using<br />
* environment variables or defaults for all other connection parameters.<br />
*/<br />
if (argc > 1)<br />
conninfo = argv[1];<br />
else<br />
conninfo = "dbname = ngdm_wpf_content";</p>
<p>/* Make a connection to the database */<br />
conn = PQconnectdb(conninfo);</p>
<p>/* Check to see that the backend connection was successfully made */<br />
if (PQstatus(conn) != CONNECTION_OK)<br />
{<br />
fprintf(stderr, "Connection to database failed: %s",<br />
PQerrorMessage(conn));<br />
exit_nicely(conn);<br />
}</p>
<p>/*<br />
* Our test case here involves using a cursor, for which we must be inside<br />
* a transaction block.  We could do the whole thing with a single<br />
* PQexec() of "select * from pg_database", but that's too trivial to make<br />
* a good example.<br />
*/</p>
<p>for ( count=0; count < 100; count++) {<br />
/* Start a transaction block */<br />
res = PQexec(conn, "SELECT * FROM django_site WHERE django_site.domain = 'example.com' ORDER BY django_site.domain;");<br />
if (PQresultStatus(res) != PGRES_TUPLES_OK)<br />
{<br />
fprintf(stderr, "SELECT command failed (%d): %s", PQresultStatus(res), PQerrorMessage(conn));<br />
PQclear(res);<br />
exit_nicely(conn);<br />
}</p>
<p>PQclear(res);</p>
<p>}</p>
<p>/* close the connection to the database and cleanup */<br />
PQfinish(conn);</p>
<p>`

 ```This is another post I&#8217;ve been sitting on for the better part of a year. I&#8217;m putting it out there in case the raw numbers are useful to anybody.

So I&#8217;ve been dealing with some database performance issues with a fairly large Django application and have been trying to track down exactly where the bottlenecks are. Interestingly, neither the application servers nor the database server displays high cpu utilization, so something is locking outside of pure CPU.

All tests were run on an AWS EC2 image, running CentOS 5.3, Python 2.6 and the PGDG PostgreSQL83 RPM packages. The database server is an identical AWS image running PGDG postgresql83.

The quick takeaways from all this are the following:

  1. PostgreSQL singleton selects are pretty fast
  2. The libpq library imposes more overhead than the database server does
  3. For the trivial case of an application that uses PostgreSQL as a key-value store containing a working set less than 1/2 the system RAM, you&#8217;ll need many application servers to saturate it. No, I don&#8217;t know how many, but it doesn&#8217;t really matter because for a non-trivial application the PostgreSQL client library overhead will become negligible.
  4. The Django ORM and psycopg2 drivers add approximately 50% overhead vs. pure c+libpq program.
  5. There are some interesting bottlenecks out there that will prevent CPU saturation of a trivial workload. No, I do not know what they are (yet).
  6. PgBouncer adds a bit of overhead to maximum throughput, around 5% in this case.
  7. Local connections are faster than network connections. Add this to the fact there seem to be some wierd bottlenecks and you might find that your app runs faster on 1 server than 2. Interesting.

I put together some very simple tests to try to figure out what&#8217;s going on.

First, the &#8220;Django&#8221; program:
  
`<br />
#!/usr/bin/python26<br />
from pprint import pprint<br />
import sys<br />
import os`

<span style="font-family: monospace;">from django.core.management import execute_manager</span>

`try:<br />
import local_settings<br />
except ImportError:<br />
import sys<br />
sys.stderr.write("Unable to find settings file")<br />
sys.exit(1)</p>
<p>from django.contrib.sites.models import Site</p>
<p>def stest():<br />
s = Site.objects.get(domain = 'example.com')</p>
<p>`

``This is another post I&#8217;ve been sitting on for the better part of a year. I&#8217;m putting it out there in case the raw numbers are useful to anybody.

So I&#8217;ve been dealing with some database performance issues with a fairly large Django application and have been trying to track down exactly where the bottlenecks are. Interestingly, neither the application servers nor the database server displays high cpu utilization, so something is locking outside of pure CPU.

All tests were run on an AWS EC2 image, running CentOS 5.3, Python 2.6 and the PGDG PostgreSQL83 RPM packages. The database server is an identical AWS image running PGDG postgresql83.

The quick takeaways from all this are the following:

  1. PostgreSQL singleton selects are pretty fast
  2. The libpq library imposes more overhead than the database server does
  3. For the trivial case of an application that uses PostgreSQL as a key-value store containing a working set less than 1/2 the system RAM, you&#8217;ll need many application servers to saturate it. No, I don&#8217;t know how many, but it doesn&#8217;t really matter because for a non-trivial application the PostgreSQL client library overhead will become negligible.
  4. The Django ORM and psycopg2 drivers add approximately 50% overhead vs. pure c+libpq program.
  5. There are some interesting bottlenecks out there that will prevent CPU saturation of a trivial workload. No, I do not know what they are (yet).
  6. PgBouncer adds a bit of overhead to maximum throughput, around 5% in this case.
  7. Local connections are faster than network connections. Add this to the fact there seem to be some wierd bottlenecks and you might find that your app runs faster on 1 server than 2. Interesting.

I put together some very simple tests to try to figure out what&#8217;s going on.

First, the &#8220;Django&#8221; program:
  
`<br />
#!/usr/bin/python26<br />
from pprint import pprint<br />
import sys<br />
import os`

<span style="font-family: monospace;">from django.core.management import execute_manager</span>

`try:<br />
import local_settings<br />
except ImportError:<br />
import sys<br />
sys.stderr.write("Unable to find settings file")<br />
sys.exit(1)</p>
<p>from django.contrib.sites.models import Site</p>
<p>def stest():<br />
s = Site.objects.get(domain = 'example.com')</p>
<p>`

`` 

The C program:
  
`<br />
/*<br />
* testlibpq.c<br />
*<br />
*      Test the C version of libpq, the PostgreSQL frontend library.<br />
*/<br />
#include<br />
#include<br />
#include "libpq-fe.h"`

 ``

`static void<br />
exit_nicely(PGconn *conn)<br />
{<br />
PQfinish(conn);<br />
exit(1);<br />
}</p>
<p>int<br />
main(int argc, char **argv)<br />
{<br />
const char *conninfo;<br />
PGconn     *conn;<br />
PGresult   *res;<br />
int         nFields;<br />
int         count,<br />
i,<br />
j;</p>
<p>/*<br />
* If the user supplies a parameter on the command line, use it as the<br />
* conninfo string; otherwise default to setting dbname=postgres and using<br />
* environment variables or defaults for all other connection parameters.<br />
*/<br />
if (argc > 1)<br />
conninfo = argv[1];<br />
else<br />
conninfo = "dbname = ngdm_wpf_content";</p>
<p>/* Make a connection to the database */<br />
conn = PQconnectdb(conninfo);</p>
<p>/* Check to see that the backend connection was successfully made */<br />
if (PQstatus(conn) != CONNECTION_OK)<br />
{<br />
fprintf(stderr, "Connection to database failed: %s",<br />
PQerrorMessage(conn));<br />
exit_nicely(conn);<br />
}</p>
<p>/*<br />
* Our test case here involves using a cursor, for which we must be inside<br />
* a transaction block.  We could do the whole thing with a single<br />
* PQexec() of "select * from pg_database", but that's too trivial to make<br />
* a good example.<br />
*/</p>
<p>for ( count=0; count < 100; count++) {<br />
/* Start a transaction block */<br />
res = PQexec(conn, "SELECT * FROM django_site WHERE django_site.domain = 'example.com' ORDER BY django_site.domain;");<br />
if (PQresultStatus(res) != PGRES_TUPLES_OK)<br />
{<br />
fprintf(stderr, "SELECT command failed (%d): %s", PQresultStatus(res), PQerrorMessage(conn));<br />
PQclear(res);<br />
exit_nicely(conn);<br />
}</p>
<p>PQclear(res);</p>
<p>}</p>
<p>/* close the connection to the database and cleanup */<br />
PQfinish(conn);</p>
<p>`

``` 

```` 

Running 8 concurrent python programs, via pgbouncer, client:

<pre>top - 22:05:16 up  3:50,  5 users,  load average: 3.94, 3.42, 2.45
Tasks: 135 total,   4 running, 131 sleeping,   0 stopped,   0 zombie
Cpu(s): 12.3%us,  1.0%sy,  0.0%ni, 84.2%id,  0.0%wa,  0.0%hi,  0.8%si,  1.7%st
Mem:   7347752k total,  5608152k used,  1739600k free,    70732k buffers
Swap:        0k total,        0k used,        0k free,   452504k cached

  PID USER      PR  NI  VIRT  RES  SHR S %CPU %MEM    TIME+  COMMAND
 3124 root      15   0  762m 623m 4976 S   40  8.7   5:07.23 bench.py
 3125 root      15   0  722m 583m 4976 S   14  8.1   4:15.34 bench.py
 3122 root      15   0  701m 562m 4976 S   14  7.8   3:29.58 bench.py
 2523 postgres  15   0 17092 1240  792 S   10  0.0   3:31.90 pgbouncer
 3126 root      15   0  699m 560m 4976 R    8  7.8   3:10.76 bench.py
 3121 root      15   0  822m 683m 4976 S    8  9.5   6:03.10 bench.py
 3123 root      15   0  700m 561m 4976 R    7  7.8   2:47.05 bench.py
 3128 root      15   0  700m 561m 4976 S    7  7.8   3:23.07 bench.py
 3127 root      15   0  714m 575m 4976 R    6  8.0   4:52.92 bench.py</pre>

And the server:

<pre>top - 21:39:50 up  6:36,  4 users,  load average: 7.44, 3.44, 1.49
Tasks: 142 total,  11 running, 131 sleeping,   0 stopped,   0 zombie
top - 22:06:04 up  7:02,  4 users,  load average: 3.15, 3.19, 4.10
Tasks: 127 total,   4 running, 123 sleeping,   0 stopped,   0 zombie
Cpu(s):  2.2%us,  1.3%sy,  0.0%ni, 95.5%id,  0.4%wa,  0.0%hi,  0.3%si,  0.3%st
Mem:   7347752k total,  2313112k used,  5034640k free,     4124k buffers
Swap:        0k total,        0k used,        0k free,  1996524k cached

  PID USER      PR  NI  VIRT  RES  SHR S %CPU %MEM    TIME+  COMMAND
 6910 postgres  15   0 2160m 5748 3888 S    6  0.1   1:15.31 postmaster
 6902 postgres  15   0 2160m 5740 3880 S    5  0.1   1:17.22 postmaster
 6913 postgres  15   0 2160m 5748 3888 R    4  0.1   1:08.97 postmaster
 6911 postgres  15   0 2160m 5748 3888 S    3  0.1   1:08.78 postmaster
 6912 postgres  15   0 2160m 5756 3896 S    3  0.1   1:07.76 postmaster
 6908 postgres  15   0 2160m 5740 3880 S    3  0.1   1:05.38 postmaster
 6909 postgres  15   0 2160m 5748 3888 S    3  0.1   1:05.88 postmaster
 6917 postgres  15   0 2160m 5748 3888 R    3  0.1   1:06.88 postmaster</pre>

Running the the Django benchmark with 10,000 iterations via pgbouncer demonstrates a 300ms startup time, and a sustained trivial query rate of almost exactly 1000/sec:

<pre>[root@domU-12-31-38-04-59-91 ~]# time ./bench.py
initial
0.306927919388
second
0.00195598602295
10 more
0.0144731998444
different query 1
0.00151586532593
different query 2
0.00109100341797
different query 10 more
9.89285588264

real    0m10.650s
user    0m4.217s
sys     0m0.229s</pre>

Exactly the same test, without pgbouncer, results in approximately 5% improvement in throughput:

<pre>[root@domU-12-31-38-04-59-91 ~]# time ./bench.py
initial
0.304031133652
second
0.00196003913879
10 more
0.0196559429169
different query 1
0.00163292884827
different query 2
0.000943899154663
different query 10 more
9.48121595383

real    0m10.238s
user    0m4.188s
sys     0m0.219s</pre>

And finally, running it directly on the database server knocks off almost 30%:

<pre>[root@domU-12-31-38-04-58-E1 data]# time ./bench.py
initial
0.651133060455
second
0.00181007385254
10 more
0.0109980106354
different query 1
0.00134086608887
different query 2
0.000818014144897
different query 10 more
6.95133709908

real    0m9.535s
user    0m5.814s
sys     0m0.275s</pre>

And now,running 10,000 queries via the c program:

<pre>[root@domU-12-31-38-04-59-91 ~]# time ./bench "dbname=content hostaddr=127.0.0.1 user=user"

real    0m4.648s
user    0m0.003s
sys     0m0.031s</pre>

And via pgbouncer:

<pre>[root@domU-12-31-38-04-59-91 ~]# time ./bench "dbname=content hostaddr=10.220.91.15 user=user"

real    0m3.799s
user    0m0.004s
sys     0m0.005s</pre>

And directly on the server:

<pre>[root@domU-12-31-38-04-58-E1 tmp]#  time ./bench "dbname=ngdm_wpf_content hostaddr=127.0.0.1 user=ngdm_wpf"

real    0m1.758s
user    0m0.048s
sys     0m0.062s</pre>

Now, let&#8217;s try to melt things down:
  
8 clients via pgbouncer:

8 clients directly

8 C clients with pgbouncer, client load:
  
top &#8211; 22:23:49 up 4:08, 5 users, load average: 1.36, 0.50, 0.94
  
Tasks: 148 total, 3 running, 144 sleeping, 1 stopped, 0 zombie
  
Cpu(s): 1.1%us, 4.4%sy, 0.0%ni, 91.5%id, 0.0%wa, 0.0%hi, 2.4%si, 0.6%st
  
Mem: 7347752k total, 822812k used, 6524940k free, 72052k buffers
  
Swap: 0k total, 0k used, 0k free, 452656k cached

PID USER PR NI VIRT RES SHR S %CPU %MEM TIME+ COMMAND
  
2523 postgres 15 0 17092 1240 792 R 50 0.0 4:10.58 pgbouncer
  
3771 root 15 0 48840 1884 1464 S 6 0.0 0:00.70 bench
  
3765 root 15 0 48836 1888 1464 S 3 0.0 0:00.72 bench
  
3761 root 15 0 48836 1888 1464 R 1 0.0 0:01.86 bench
  
3773 root 15 0 48836 1884 1464 S 1 0.0 0:00.21 bench
  
3780 root 15 0 48836 1884 1464 S 1 0.0 0:00.11 bench
  
3759 root 15 0 48836 1884 1464 S 0 0.0 0:00.25 bench
  
3763 root 15 0 48840 1888 1464 S 0 0.0 0:00.19 bench

8 C clients, server load:
  
top &#8211; 22:23:35 up 7:19, 4 users, load average: 2.52, 0.79, 1.58
  
Tasks: 129 total, 9 running, 120 sleeping, 0 stopped, 0 zombie
  
Cpu(s): 18.9%us, 7.0%sy, 0.0%ni, 71.8%id, 0.0%wa, 0.0%hi, 2.1%si, 0.3%st
  
Mem: 7347752k total, 2466176k used, 4881576k free, 6736k buffers
  
Swap: 0k total, 0k used, 0k free, 2143620k cached

PID USER PR NI VIRT RES SHR S %CPU %MEM TIME+ COMMAND
  
7148 postgres 15 0 2160m 4920 3240 R 23 0.1 0:10.94 postmaster
  
7152 postgres 15 0 2160m 4916 3236 R 21 0.1 0:08.88 postmaster
  
7150 postgres 15 0 2160m 4916 3236 S 20 0.1 0:08.65 postmaster
  
7147 postgres 15 0 2160m 4916 3236 S 20 0.1 0:11.63 postmaster
  
7155 postgres 15 0 2160m 4916 3236 R 20 0.1 0:03.98 postmaster
  
7151 postgres 15 0 2160m 4916 3236 R 19 0.1 0:08.14 postmaster
  
7154 postgres 15 0 2160m 4920 3240 S 19 0.1 0:04.05 postmaster
  
7145 postgres 15 0 2160m 4916 3236 R 18 0.1 0:11.57 postmaster
  
7144 postgres 15 0 2160m 4912 3232 R 17 0.1 0:12.08 postmaster
  
6435 postgres 15 0 60920 1012 320 S 15 0.0 3:32.23 postmaster

And 8 C clients, eliminating pgbouncer, client load:
  
top &#8211; 22:25:55 up 4:10, 5 users, load average: 0.76, 0.64, 0.94
  
Tasks: 136 total, 2 running, 133 sleeping, 1 stopped, 0 zombie
  
Cpu(s): 0.6%us, 1.3%sy, 0.0%ni, 97.6%id, 0.0%wa, 0.0%hi, 0.2%si, 0.3%st
  
Mem: 7347752k total, 821436k used, 6526316k free, 72184k buffers
  
Swap: 0k total, 0k used, 0k free, 452656k cached

PID USER PR NI VIRT RES SHR S %CPU %MEM TIME+ COMMAND
  
3791 root 15 0 48840 1888 1464 R 3 0.0 0:00.88 bench
  
3784 root 15 0 48836 1884 1464 S 3 0.0 0:00.83 bench
  
3788 root 15 0 48836 1884 1464 S 3 0.0 0:00.89 bench
  
3790 root 15 0 48836 1884 1464 S 3 0.0 0:00.88 bench
  
3785 root 15 0 48836 1884 1464 S 2 0.0 0:00.82 bench
  
3789 root 15 0 48836 1884 1464 S 2 0.0 0:00.88 bench
  
3787 root 15 0 48840 1888 1464 S 2 0.0 0:00.97 bench
  
3786 root 15 0 48840 1888 1464 S 1 0.0 0:00.68 bench

Server load:
  
Tasks: 132 total, 5 running, 127 sleeping, 0 stopped, 0 zombie
  
Cpu(s): 16.5%us, 7.0%sy, 0.0%ni, 74.2%id, 0.0%wa, 0.0%hi, 1.5%si, 0.7%st
  
Mem: 7347752k total, 2726576k used, 4621176k free, 7340k buffers
  
Swap: 0k total, 0k used, 0k free, 2392360k cached

PID USER PR NI VIRT RES SHR S %CPU %MEM TIME+ COMMAND
  
7165 postgres 15 0 2160m 4916 3236 S 27 0.1 0:11.50 postmaster
  
7166 postgres 15 0 2160m 4916 3236 R 26 0.1 0:11.05 postmaster
  
7171 postgres 15 0 2160m 4916 3236 S 25 0.1 0:10.56 postmaster
  
7164 postgres 15 0 2160m 4916 3236 S 24 0.1 0:11.62 postmaster
  
7169 postgres 15 0 2160m 4920 3240 R 24 0.1 0:10.86 postmaster
  
7170 postgres 15 0 2160m 4916 3236 S 23 0.1 0:10.66 postmaster
  
7168 postgres 15 0 2160m 4916 3236 R 21 0.1 0:10.69 postmaster
  
7167 postgres 15 0 2160m 4916 3236 R 18 0.1 0:10.72 postmaster

16 c clients, no pgbouncer:
  
top &#8211; 22:28:21 up 4:13, 5 users, load average: 1.06, 0.80, 0.95
  
Tasks: 144 total, 2 running, 141 sleeping, 1 stopped, 0 zombie
  
Cpu(s): 1.1%us, 3.0%sy, 0.0%ni, 94.8%id, 0.0%wa, 0.0%hi, 0.9%si, 0.3%st
  
Mem: 7347752k total, 824680k used, 6523072k free, 72344k buffers
  
Swap: 0k total, 0k used, 0k free, 452660k cached

PID USER PR NI VIRT RES SHR S %CPU %MEM TIME+ COMMAND
  
3785 root 15 0 48836 1884 1464 S 5 0.0 0:04.30 bench
  
3788 root 15 0 48836 1884 1464 S 4 0.0 0:04.58 bench
  
3798 root 15 0 48840 1888 1464 S 4 0.0 0:01.40 bench
  
3799 root 15 0 48836 1884 1464 S 4 0.0 0:01.38 bench
  
3784 root 15 0 48836 1884 1464 S 3 0.0 0:04.16 bench
  
3794 root 15 0 48840 1888 1464 S 3 0.0 0:01.35 bench
  
3787 root 15 0 48840 1888 1464 R 3 0.0 0:04.73 bench
  
3790 root 15 0 48836 1884 1464 S 3 0.0 0:04.25 bench
  
3789 root 15 0 48836 1884 1464 S 3 0.0 0:04.27 bench
  
3795 root 15 0 48840 1888 1464 S 3 0.0 0:01.07 bench
  
3786 root 15 0 48840 1888 1464 S 2 0.0 0:03.88 bench
  
3800 root 15 0 48836 1884 1464 S 2 0.0 0:01.19 bench
  
3793 root 15 0 48840 1888 1464 S 2 0.0 0:01.40 bench
  
3796 root 15 0 48840 1888 1464 S 2 0.0 0:01.13 bench
  
3791 root 15 0 48840 1888 1464 S 1 0.0 0:04.29 bench

16 c clients, no pgbouncer, server load:
  
top &#8211; 22:28:28 up 7:24, 4 users, load average: 6.68, 3.73, 2.57
  
Tasks: 138 total, 10 running, 128 sleeping, 0 stopped, 0 zombie
  
Cpu(s): 23.5%us, 9.6%sy, 0.0%ni, 63.7%id, 0.4%wa, 0.0%hi, 2.2%si, 0.7%st
  
Mem: 7347752k total, 3111620k used, 4236132k free, 8060k buffers
  
Swap: 0k total, 0k used, 0k free, 2756304k cached

PID USER PR NI VIRT RES SHR S %CPU %MEM TIME+ COMMAND
  
6435 postgres 16 0 60920 1012 320 R 27 0.0 4:17.22 postmaster
  
7168 postgres 15 0 2160m 4920 3240 S 20 0.1 0:40.52 postmaster
  
7296 postgres 15 0 2160m 4928 3240 R 20 0.1 0:08.51 postmaster
  
7292 postgres 15 0 2160m 4924 3240 S 19 0.1 0:08.49 postmaster
  
7166 postgres 15 0 2160m 4920 3240 S 19 0.1 0:41.11 postmaster
  
7290 postgres 15 0 2160m 4924 3244 S 19 0.1 0:08.41 postmaster
  
7295 postgres 15 0 2160m 4924 3240 S 19 0.1 0:08.21 postmaster
  
7170 postgres 15 0 2160m 4920 3240 R 18 0.1 0:40.96 postmaster
  
7169 postgres 15 0 2160m 4924 3244 S 18 0.1 0:40.23 postmaster
  
7171 postgres 15 0 2160m 4920 3240 R 18 0.1 0:40.17 postmaster
  
7167 postgres 15 0 2160m 4920 3240 S 17 0.1 0:40.05 postmaster
  
7293 postgres 15 0 2160m 4924 3240 R 17 0.1 0:08.74 postmaster
  
7297 postgres 15 0 2160m 4936 3248 R 16 0.1 0:07.92 postmaster
  
7165 postgres 16 0 2160m 4920 3240 R 15 0.1 0:41.41 postmaster
  
7291 postgres 15 0 2160m 4924 3240 R 15 0.1 0:08.61 postmaster
  
7294 postgres 15 0 2160m 4924 3240 S 14 0.1 0:08.13 postmaster
  
7164 postgres 15 0 2160m 4920 3240 R 13 0.1 0:41.61 postmaster
  
6440 postgres 15 0 61468 1444 444 S 0 0.0 0:00.17 postmaster

4 local c processes:
  
top &#8211; 22:31:31 up 7:27, 4 users, load average: 4.52, 4.18, 2.97
  
Tasks: 130 total, 7 running, 123 sleeping, 0 stopped, 0 zombie
  
Cpu(s): 33.5%us, 15.4%sy, 0.0%ni, 48.5%id, 1.0%wa, 0.0%hi, 0.0%si, 1.5%st
  
Mem: 7347752k total, 3594636k used, 3753116k free, 9000k buffers
  
Swap: 0k total, 0k used, 0k free, 3239112k cached

PID USER PR NI VIRT RES SHR S %CPU %MEM TIME+ COMMAND
  
7324 postgres 25 0 2160m 4888 3208 R 84 0.1 0:51.21 postmaster
  
7328 postgres 25 0 2160m 4888 3208 R 81 0.1 0:51.21 postmaster
  
7326 postgres 25 0 2160m 4888 3208 R 81 0.1 0:53.49 postmaster
  
7322 postgres 25 0 2160m 4888 3208 R 78 0.1 1:03.22 postmaster
  
6435 postgres 15 0 60920 1012 320 R 23 0.0 4:50.81 postmaster
  
7321 root 15 0 48836 1864 1444 S 14 0.0 0:08.83 bench
  
7325 root 15 0 48840 1868 1444 S 11 0.0 0:07.32 bench
  
7327 root 15 0 48840 1864 1444 S 11 0.0 0:06.04 bench
  
7323 root 15 0 48836 1864 1444 R 9 0.0 0:05.58 bench

8 local processes:
  
top &#8211; 22:32:25 up 7:28, 4 users, load average: 6.16, 4.62, 3.18
  
Tasks: 138 total, 6 running, 132 sleeping, 0 stopped, 0 zombie
  
Cpu(s): 25.9%us, 16.0%sy, 0.0%ni, 55.0%id, 1.6%wa, 0.0%hi, 0.0%si, 1.5%st
  
Mem: 7347752k total, 3821680k used, 3526072k free, 9352k buffers
  
Swap: 0k total, 0k used, 0k free, 3451556k cached

PID USER PR NI VIRT RES SHR S %CPU %MEM TIME+ COMMAND
  
6435 postgres 16 0 60920 1012 320 R 43 0.0 5:09.25 postmaster
  
7339 postgres 15 0 2160m 4892 3212 D 39 0.1 0:06.23 postmaster
  
7328 postgres 25 0 2160m 4888 3208 R 34 0.1 1:24.86 postmaster
  
7324 postgres 25 0 2160m 4888 3208 D 33 0.1 1:24.64 postmaster
  
7326 postgres 25 0 2160m 4888 3208 D 32 0.1 1:26.53 postmaster
  
7322 postgres 25 0 2160m 4888 3208 D 30 0.1 1:34.39 postmaster
  
7337 postgres 16 0 2160m 4888 3208 R 28 0.1 0:06.02 postmaster
  
7343 postgres 16 0 2160m 4888 3208 R 28 0.1 0:05.04 postmaster
  
7341 postgres 15 0 2160m 4888 3208 S 27 0.1 0:05.56 postmaster
  
7338 root 15 0 48840 1864 1444 S 7 0.0 0:01.05 bench
  
7325 root 15 0 48840 1868 1444 S 6 0.0 0:12.12 bench
  
7342 root 15 0 48836 1868 1444 S 6 0.0 0:01.02 bench
  
7321 root 15 0 48836 1864 1444 S 6 0.0 0:11.73 bench
  
7340 root 15 0 48836 1864 1444 R 5 0.0 0:00.77 bench
  
7323 root 15 0 48836 1864 1444 S 4 0.0 0:10.10 bench
  
7327 root 15 0 48840 1864 1444 S 4 0.0 0:10.24 bench
  
7336 root 15 0 48836 1864 1444 S 3 0.0 0:00.76 bench

16 local processes:
  
top &#8211; 22:33:11 up 7:29, 4 users, load average: 10.49, 5.91, 3.69
  
Tasks: 154 total, 9 running, 145 sleeping, 0 stopped, 0 zombie
  
Cpu(s): 20.8%us, 9.3%sy, 0.0%ni, 59.7%id, 1.0%wa, 0.0%hi, 0.0%si, 9.1%st
  
Mem: 7347752k total, 4032604k used, 3315148k free, 9660k buffers
  
Swap: 0k total, 0k used, 0k free, 3639952k cached

PID USER PR NI VIRT RES SHR S %CPU %MEM TIME+ COMMAND
  
7347 postgres 15 0 2160m 4892 3212 D 17 0.1 0:02.80 postmaster
  
7328 postgres 15 0 2160m 4888 3208 D 15 0.1 1:35.36 postmaster
  
6435 postgres 15 0 60920 1012 320 S 15 0.0 5:22.28 postmaster
  
7357 postgres 16 0 2160m 4892 3208 D 14 0.1 0:02.46 postmaster
  
7359 postgres 16 0 2160m 4892 3208 R 14 0.1 0:02.46 postmaster
  
7361 postgres 15 0 2160m 4900 3212 D 13 0.1 0:02.37 postmaster
  
7343 postgres 16 0 2160m 4888 3208 R 13 0.1 0:16.00 postmaster
  
7353 postgres 16 0 2160m 4892 3208 D 12 0.1 0:02.47 postmaster
  
7322 postgres 16 0 2160m 4888 3208 R 12 0.1 1:45.13 postmaster
  
7326 postgres 16 0 2160m 4888 3208 R 12 0.1 1:37.69 postmaster
  
7339 postgres 15 0 2160m 4892 3212 D 12 0.1 0:16.68 postmaster
  
7349 postgres 15 0 2160m 4892 3208 D 12 0.1 0:02.52 postmaster
  
7324 postgres 16 0 2160m 4888 3208 D 11 0.1 1:34.90 postmaster
  
7355 postgres 16 0 2160m 4892 3208 R 11 0.1 0:02.41 postmaster
  
7341 postgres 16 0 2160m 4888 3208 D 11 0.1 0:16.48 postmaster
  
7351 postgres 16 0 2160m 4892 3208 R 10 0.1 0:02.36 postmaster
  
7337 postgres 15 0 2160m 4888 3208 D 9 0.1 0:15.76 postmaster
  
7348 root 15 0 48840 1864 1444 S 3 0.0 0:00.42 bench
  
7338 root 15 0 48840 1864 1444 S 3 0.0 0:02.80 bench
  
7325 root 15 0 48840 1868 1444 R 2 0.0 0:13.61 bench
  
7342 root 15 0 48836 1868 1444 S 2 0.0 0:02.64 bench
  
7356 root 15 0 48840 1868 1444 S 2 0.0 0:00.31 bench
  
7358 root 15 0 48836 1868 1444 S 2 0.0 0:00.39 bench
  
7346 root 15 0 48840 1868 1444 S 2 0.0 0:00.43 bench
  
7350 root 15 0 48840 1864 1444 S 2 0.0 0:00.38 bench
  
7327 root 15 0 48840 1864 1444 S 2 0.0 0:11.59 bench
  
7336 root 15 0 48836 1864 1444 S 2 0.0 0:02.33 bench
  
7340 root 15 0 48836 1864 1444 S 2 0.0 0:02.51 bench
  
7321 root 15 0 48836 1864 1444 S 1 0.0 0:13.01 bench
  
7323 root 15 0 48836 1864 1444 S 1 0.0 0:11.48 bench
  
7354 root 15 0 48836 1868 1444 S 1 0.0 0:00.24 bench
  
7360 root 15 0 48840 1864 1444 S 1 0.0 0:00.33 bench

32 local processes:
  
top &#8211; 22:34:50 up 7:31, 4 users, load average: 23.32, 11.03, 5.69
  
Tasks: 181 total, 4 running, 177 sleeping, 0 stopped, 0 zombie
  
Cpu(s): 18.1%us, 7.2%sy, 0.0%ni, 66.6%id, 1.4%wa, 0.0%hi, 0.0%si, 6.7%st
  
Mem: 7347752k total, 4381808k used, 2965944k free, 10244k buffers
  
Swap: 0k total, 0k used, 0k free, 3952404k cached

PID USER PR NI VIRT RES SHR S %CPU %MEM TIME+ COMMAND
  
6435 postgres 16 0 60920 1012 320 S 9 0.0 5:33.12 postmaster
  
7347 postgres 16 0 2160m 4904 3224 D 8 0.1 0:10.34 postmaster
  
7353 postgres 16 0 2160m 4904 3220 D 8 0.1 0:09.48 postmaster
  
7349 postgres 16 0 2160m 4904 3220 D 8 0.1 0:10.25 postmaster
  
7375 postgres 15 0 2160m 4908 3220 D 8 0.1 0:03.45 postmaster
  
7326 postgres 16 0 2160m 4900 3220 D 7 0.1 1:45.29 postmaster
  
7373 postgres 16 0 2160m 4908 3220 D 7 0.1 0:03.65 postmaster
  
7383 postgres 16 0 2160m 4908 3220 D 7 0.1 0:03.06 postmaster
  
7391 postgres 15 0 2160m 4912 3224 D 7 0.1 0:03.02 postmaster
  
7324 postgres 16 0 2160m 4900 3220 D 7 0.1 1:41.96 postmaster
  
7369 postgres 16 0 2160m 4908 3220 R 6 0.1 0:03.81 postmaster
  
7385 postgres 16 0 2160m 4912 3224 D 6 0.1 0:02.90 postmaster
  
7361 postgres 16 0 2160m 4912 3224 D 5 0.1 0:10.54 postmaster
  
7379 postgres 16 0 2160m 4912 3224 D 5 0.1 0:03.40 postmaster
  
7393 postgres 16 0 2160m 4908 3220 D 5 0.1 0:02.84 postmaster
  
7395 postgres 16 0 2160m 4912 3224 D 5 0.1 0:03.15 postmaster
  
7397 postgres 16 0 2160m 4912 3224 R 5 0.1 0:03.12 postmaster
  
7343 postgres 16 0 2160m 4900 3220 D 5 0.1 0:23.27 postmaster
  
7328 postgres 16 0 2160m 4900 3220 D 5 0.1 1:42.52 postmaster
  
7341 postgres 16 0 2160m 4900 3220 D 5 0.1 0:23.69 postmaster
  
7355 postgres 16 0 2160m 4904 3220 D 5 0.1 0:09.82 postmaster
  
7359 postgres 16 0 2160m 4904 3220 D 5 0.1 0:09.84 postmaster
  
7381 postgres 16 0 2160m 4908 3220 D 5 0.1 0:03.22 postmaster
  
7337 postgres 16 0 2160m 4900 3220 D 4 0.1 0:23.36 postmaster
  
7339 postgres 16 0 2160m 4904 3224 D 4 0.1 0:24.46 postmaster
  
7367 postgres 15 0 2160m 4908 3220 D 4 0.1 0:03.26 postmaster
  
7357 postgres 16 0 2160m 4904 3220 D 4 0.1 0:10.21 postmaster
  
7371 postgres 16 0 2160m 4912 3224 D 4 0.1 0:02.97 postmaster
  
7387 postgres 16 0 2160m 4908 3220 D 4 0.1 0:02.87 postmaster
  
7389 postgres 16 0 2160m 4908 3220 D 3 0.1 0:03.03 postmaster
  
7377 postgres 15 0 2160m 4908 3220 D 3 0.1 0:03.03 postmaster
  
7351 postgres 16 0 2160m 4904 3220 D 2 0.1 0:09.71 postmaster
  
7358 root 15 0 48836 1868 1444 S 2 0.0 0:01.62 bench
  
7325 root 15 0 48840 1868 1444 S 1 0.0 0:14.73 bench
  
7346 root 15 0 48840 1868 1444 S 1 0.0 0:01.44 bench
  
7352 root 15 0 48836 1864 1444 S 1 0.0 0:01.45 bench
  
7374 root 15 0 48840 1864 1444 S 1 0.0 0:00.48 bench
  
7323 root 15 0 48836 1864 1444 S 1 0.0 0:12.52 bench
  
7342 root 15 0 48836 1868 1444 S 1 0.0 0:03.75 bench
  
7366 root 15 0 48836 1868 1444 S 1 0.0 0:00.48 bench
  
7370 root 15 0 48840 1868 1444 S 1 0.0 0:00.43 bench
  
7378 root 15 0 48840 1868 1444 S 1 0.0 0:00.36 bench
  
7382 root 15 0 48840 1868 1444 S 1 0.0 0:00.31 bench
  
7388 root 15 0 48836 1864 1444 S 1 0.0 0:00.43 bench
  
7390 root 15 0 48836 1868 1444 S 1 0.0 0:00.36 bench
  
2455 root 18 0 247m 1580 860 S 1 0.0 0:12.46 collectd
  
7336 root 15 0 48836 1864 1444 S 1 0.0 0:03.32 bench
  
7348 root 15 0 48840 1864 1444 S 1 0.0 0:01.38 bench
  
7350 root 15 0 48840 1864 1444 S 1 0.0 0:01.26 bench
  
7354 root 15 0 48836 1868 1444 S 1 0.0 0:01.09 bench
  
7356 root 15 0 48840 1868 1444 S 1 0.0 0:01.47 bench
  
7368 root 15 0 48840 1864 1444 S 1 0.0 0:00.42 bench
  
7386 root 15 0 48840 1864 1444 S 1 0.0 0:00.40 bench
  
7392 root 15 0 48836 1868 1444 S 1 0.0 0:00.42 bench
  
7327 root 15 0 48840 1864 1444 S 0 0.0 0:12.57 bench
  
7340 root 15 0 48836 1864 1444 S 0 0.0 0:03.56 bench
  
7376 root 15 0 48836 1868 1444 S 0 0.0 0:00.45 bench
  
7380 root 15 0 48840 1864 1444 S 0 0.0 0:00.38 bench
  
7394 root 15 0 48840 1864 1444 S 0 0.0 0:00.59 bench