---
title: "Django PostgreSQL ORM Overhead"
date: 2010-06-24T20:15:12+00:00
author: "Erik LaBianca"
draft: false
description: "Benchmarking Django ORM and psycopg2 overhead versus raw C libpq for PostgreSQL queries."
categories:
  - Computing
tags:
  - python
  - postgresql
  - benchmarking
syndication:
  twitter_text: "Django ORM + psycopg2 adds ~50% overhead vs raw C/libpq for trivial SELECTs. The bottleneck is client-side — the database barely breaks a sweat."
  linkedin_hook: |
    Your database isn't the bottleneck. Your ORM is.

    I benchmarked Django ORM + psycopg2 against raw C/libpq for trivial single-row SELECTs. The results:

    - Django + psycopg2: ~940 queries/sec
    - C + libpq: ~2,150 queries/sec (via PgBouncer)
    - C + libpq local: ~5,680 queries/sec

    That's ~50% overhead from the ORM layer alone. And at scale, PgBouncer itself became the bottleneck at 50% CPU before PostgreSQL even broke a sweat.

    The takeaway: for latency-sensitive paths, the time is spent in Python object creation and serialization, not in the database. CPU utilization is misleading — 8 Python clients showed only 12% client CPU yet throughput was maxed.

    I wrote up the full benchmark methodology and multi-client scaling results on my blog.
---

**TL;DR:** Django ORM + psycopg2 adds ~50% overhead vs raw C/libpq for trivial
single-row SELECTs. PgBouncer costs ~5%. Local connections are ~30% faster than
network. The bottleneck is client-side — the database server barely breaks a
sweat.

---

I've been dealing with database performance issues in a fairly large Django
application — neither the app servers nor the database show high CPU
utilization, yet something is clearly bottlenecked. I put together some simple
benchmarks to isolate where the overhead lives.

## Environment

- AWS EC2 instances, CentOS 5.3
- Python 2.6, Django ORM, psycopg2
- PostgreSQL 8.3 (PGDG RPMs) on a separate EC2 instance
- PgBouncer for connection pooling

## Test Programs

The Django benchmark runs 10,000 trivial ORM queries (`Site.objects.get(domain='example.com')`):

```python
from django.contrib.sites.models import Site

def stest():
    s = Site.objects.get(domain = 'example.com')
```

The C benchmark does the equivalent 10,000 SELECTs directly via libpq:

```c
for (count = 0; count < 100; count++) {
    res = PQexec(conn,
        "SELECT * FROM django_site "
        "WHERE django_site.domain = 'example.com' "
        "ORDER BY django_site.domain;");
    PQclear(res);
}
```

## Single-Client Results

| Configuration | Time (10K queries) | Queries/sec |
|---|---|---|
| **Django + psycopg2, via PgBouncer** | 10.65s | ~940 |
| **Django + psycopg2, direct** | 10.24s | ~975 |
| **Django + psycopg2, local** | 9.54s | ~1050 |
| **C + libpq, via PgBouncer** | 4.65s | ~2150 |
| **C + libpq, direct** | 3.80s | ~2630 |
| **C + libpq, local** | 1.76s | ~5680 |

{{< details "Raw single-client benchmark output" >}}

**Django via PgBouncer (10K queries):**

```text
[root@domU-12-31-38-04-59-91 ~]# time ./bench.py
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
sys     0m0.229s
```

**Django direct, no PgBouncer:**

```text
[root@domU-12-31-38-04-59-91 ~]# time ./bench.py
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
sys     0m0.219s
```

**Django local on database server:**

```text
[root@domU-12-31-38-04-58-E1 data]# time ./bench.py
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
sys     0m0.275s
```

**C + libpq via PgBouncer:**

```text
[root@domU-12-31-38-04-59-91 ~]# time ./bench "dbname=content hostaddr=127.0.0.1 user=user"

real    0m4.648s
user    0m0.003s
sys     0m0.031s
```

**C + libpq direct:**

```text
[root@domU-12-31-38-04-59-91 ~]# time ./bench "dbname=content hostaddr=10.220.91.15 user=user"

real    0m3.799s
user    0m0.004s
sys     0m0.005s
```

**C + libpq local:**

```text
[root@domU-12-31-38-04-58-E1 tmp]#  time ./bench "dbname=ngdm_wpf_content hostaddr=127.0.0.1 user=ngdm_wpf"

real    0m1.758s
user    0m0.048s
sys     0m0.062s
```

{{< /details >}}

## Multi-Client Scaling (C + libpq)

Running concurrent C clients to stress the server:

**8 remote clients via PgBouncer:** PgBouncer itself becomes the bottleneck at
50% CPU. Client processes barely register. Server-side PostgreSQL workers split
~20% CPU each — plenty of headroom.

**8 remote clients, no PgBouncer:** Client CPU drops to ~3% each. Server-side
PostgreSQL workers at ~25% each. Still not saturated — 74% idle.

**16 remote clients, no PgBouncer:** Server at ~33% CPU usage total, 64% idle.
Still not saturating.

**4 local clients:** This is where it gets interesting. PostgreSQL workers jump
to ~80% CPU each. The elimination of network latency lets the clients hammer
the server fast enough to actually push it.

**8-32 local clients:** Load averages climb (6→10→23) but CPU idle stays above
55%. At 32 clients, EC2 steal time hits 9% — we're hitting the hypervisor, not
PostgreSQL.

{{< details "Raw multi-client top output" >}}

**8 Python clients via PgBouncer — client:**

```text
top - 22:05:16 up  3:50,  5 users,  load average: 3.94, 3.42, 2.45
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
 3127 root      15   0  714m 575m 4976 R    6  8.0   4:52.92 bench.py
```

**8 Python clients via PgBouncer — server:**

```text
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
 6917 postgres  15   0 2160m 5748 3888 R    3  0.1   1:06.88 postmaster
```

**8 C clients via PgBouncer — client:**

```text
top - 22:23:49 up 4:08, 5 users, load average: 1.36, 0.50, 0.94
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
```

**8 C clients via PgBouncer — server:**

```text
top - 22:23:35 up 7:19, 4 users, load average: 2.52, 0.79, 1.58
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
```

**8 C clients direct, no PgBouncer — client:**

```text
top - 22:25:55 up 4:10, 5 users, load average: 0.76, 0.64, 0.94
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
```

**8 C clients direct, no PgBouncer — server:**

```text
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
```

**16 C clients, no PgBouncer — client:**

```text
top - 22:28:21 up 4:13, 5 users, load average: 1.06, 0.80, 0.95
Tasks: 144 total, 2 running, 141 sleeping, 1 stopped, 0 zombie
Cpu(s): 1.1%us, 3.0%sy, 0.0%ni, 94.8%id, 0.0%wa, 0.0%hi, 0.9%si, 0.3%st
Mem: 7347752k total, 824680k used, 6523072k free, 72344k buffers
Swap: 0k total, 0k used, 0k free, 452660k cached
```

**16 C clients, no PgBouncer — server:**

```text
top - 22:28:28 up 7:24, 4 users, load average: 6.68, 3.73, 2.57
Tasks: 138 total, 10 running, 128 sleeping, 0 stopped, 0 zombie
Cpu(s): 23.5%us, 9.6%sy, 0.0%ni, 63.7%id, 0.4%wa, 0.0%hi, 2.2%si, 0.7%st
Mem: 7347752k total, 3111620k used, 4236132k free, 8060k buffers
Swap: 0k total, 0k used, 0k free, 2756304k cached
```

**4 local C clients:**

```text
top - 22:31:31 up 7:27, 4 users, load average: 4.52, 4.18, 2.97
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
```

**8 local C clients:**

```text
top - 22:32:25 up 7:28, 4 users, load average: 6.16, 4.62, 3.18
Tasks: 138 total, 6 running, 132 sleeping, 0 stopped, 0 zombie
Cpu(s): 25.9%us, 16.0%sy, 0.0%ni, 55.0%id, 1.6%wa, 0.0%hi, 0.0%si, 1.5%st
Mem: 7347752k total, 3821680k used, 3526072k free, 9352k buffers
Swap: 0k total, 0k used, 0k free, 3451556k cached
```

**16 local C clients:**

```text
top - 22:33:11 up 7:29, 4 users, load average: 10.49, 5.91, 3.69
Tasks: 154 total, 9 running, 145 sleeping, 0 stopped, 0 zombie
Cpu(s): 20.8%us, 9.3%sy, 0.0%ni, 59.7%id, 1.0%wa, 0.0%hi, 0.0%si, 9.1%st
Mem: 7347752k total, 4032604k used, 3315148k free, 9660k buffers
Swap: 0k total, 0k used, 0k free, 3639952k cached
```

**32 local C clients:**

```text
top - 22:34:50 up 7:31, 4 users, load average: 23.32, 11.03, 5.69
Tasks: 181 total, 4 running, 177 sleeping, 0 stopped, 0 zombie
Cpu(s): 18.1%us, 7.2%sy, 0.0%ni, 66.6%id, 1.4%wa, 0.0%hi, 0.0%si, 6.7%st
Mem: 7347752k total, 4381808k used, 2965944k free, 10244k buffers
Swap: 0k total, 0k used, 0k free, 3952404k cached
```

{{< /details >}}

## Takeaways

1. **The ORM is the bottleneck, not the database.** Django + psycopg2 adds ~50%
   overhead vs C + libpq for trivial queries. For non-trivial queries this
   ratio will shrink as actual query time dominates.

2. **PgBouncer costs ~5% throughput** on a single client, but becomes a
   bottleneck at scale (50% CPU with 8 concurrent C clients). Worth having for
   connection management, but be aware of the ceiling.

3. **Network latency matters more than you'd think.** Local connections are
   ~30% faster for Django and ~2.5x faster for C. If your app is
   latency-sensitive on trivial queries, colocate.

4. **You'll hit other ceilings first.** At 32 local C clients, EC2 steal time
   was the bottleneck — not PostgreSQL, not the OS, not the client.

5. **CPU utilization is misleading.** 8 Python clients showed only ~12% total
   client CPU and ~3% server CPU, yet throughput was maxed. The time is spent
   in Python object creation and serialization, not in CPU-bound work.
