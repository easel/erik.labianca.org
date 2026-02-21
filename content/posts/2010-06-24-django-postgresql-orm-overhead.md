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

## Multi-Client Scaling (C + libpq)

Running concurrent C clients to stress the server, with `top` snapshots:

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
