---
title: "Swap on a 128 GB server"
date: 2026-09-30T09:00:00-04:00
author: "Erik LaBianca"
draft: false
description: "The swap-at-least-as-large-as-RAM rule was only ever about hibernation. What swap is actually for, and why not to put it on a ZFS special vdev."
composition: model-primary
categories:
  - Sysadmin
tags:
  - linux
  - zfs
  - memory
syndication:
  twitter_text: >-
    The "swap should be at least as large as RAM" rule was about
    hibernation, and nothing else. On a server that never hibernates it's
    inherited advice with its reasoning stripped off.
  linkedin_hook: |
    Swap isn't emergency RAM. It's a reclaim mechanism.

    Its job is giving the kernel somewhere to put genuinely cold anonymous pages — memory some daemon allocated at boot and never touched again — so that RAM can become cache. With zero swap those pages are pinned forever no matter how useless they are.

    That reframes the sizing question entirely. You're not provisioning for "how much memory might I need beyond RAM." The cold tail doesn't scale with total RAM; it scales with how many long-lived processes you run.

    8 GiB on a 128 GB box. Not 128.
---

While rebuilding the root filesystem of my NAS I had to decide how much swap to
give it. The machine has 128 GB of ECC RAM and runs a ZFS pool, some containers,
and a Spark setup that occasionally gets greedy. The old install had a 976 MB
swap LV that wasn't even in `fstab`.

The folk rule says swap should be at least as large as RAM, which would mean
carving 128 GB out of a 929 GB mirrored volume group for something I'd hope
never to use. That felt obviously wrong, so I went looking for where the rule
comes from.

## Where the rule came from

It's about **hibernation**. Suspend-to-disk writes the entire contents of RAM
into swap, so swap has to be at least RAM-sized or the image doesn't fit. That's
the whole origin.

There was also a genuine kernel-era constraint: 2.4 had allocation behaviour
that made undersized swap problematic. That ended over twenty years ago.

Neither applies to a server that never hibernates. On a machine like this the
rule is inherited advice with its reasoning stripped off.

## What swap is for

The framing I find useful is that **swap isn't emergency RAM, it's a reclaim
option**. The kernel is constantly deciding what to evict. With swap available,
truly cold anonymous pages — memory some daemon allocated at boot and never
touched again — can be written out, and that RAM becomes page cache. With zero
swap those pages are pinned forever, no matter how useless they are, and your
cache is smaller for it.

That reframes the sizing question. You're not provisioning for "how much memory
might I need beyond RAM" — you're giving the kernel somewhere to put the cold
tail of your anonymous working set. That tail doesn't scale with total RAM; it
scales with how many long-lived processes you run.

The corollary is that large swap on a large-RAM machine is actively
counterproductive under real pressure. If something is genuinely leaking, 128 GB
of swap buys you many minutes of thrashing before the OOM killer fires, during
which the machine is unusable and you can't SSH in to fix it. A modest swap plus
a fast OOM kill is a better failure mode than a slow slide into
unresponsiveness.

Current guidance from the distributions lands around 4 to 16 GB for large-RAM
servers without hibernation, which matches that reasoning rather than the old
rule.

## What I picked

8 GiB, as a logical volume on the mirrored array, with `vm.swappiness=10`.

The swappiness setting is worth a word since it's often cargo-culted in the
other direction. It controls the balance between reclaiming anonymous pages and
reclaiming page cache. On a ZFS box, ARC is managed separately from the page
cache and shrinks under pressure on its own, so biasing reclaim away from anon
pages is the conventional tuning. I wouldn't set it to 0 — that gets you back to
the pinned-cold-pages problem this is all supposed to solve.

I also put it on the mirror rather than leaving it off the array. Swap on a
single disk means that disk failing takes the machine down hard, with pages
swapped out and no copy. If the rest of your root is redundant, unredundant swap
is an odd thing to leave lying around.

## The NVMe was the wrong place for it

The tempting alternative was the pair of PM983s already in the machine. They're
far faster than the SATA mirror, and they're already carrying ZFS SLOG and
special-vdev partitions plus some scratch space.

Three reasons I didn't:

Those NVMes hold the pool's **special vdev** — mirrored metadata. Swap I/O
competing with metadata reads hurts every operation on the pool, and that's
precisely the latency path the special vdev exists to optimize.

One of them is at **55% life used with 17 media integrity errors**. Adding swap
writes accelerates wear on half a mirror holding metadata I can't afford to
lose.

And a single-device NVMe swap isn't redundant, so I'd be reintroducing the
problem I just described, on the drive I trust least.

The clincher is that the speed argument is self-defeating. If I'm ever swapping
enough for SATA-versus-NVMe latency to matter, I have a capacity problem, not a
speed problem, and the right fix is bounding whatever is eating the memory. 8
GiB
of cold-page eviction on a SATA mirror will never be the bottleneck.

## One thing to avoid regardless

Don't put swap on a ZFS zvol. It's a documented deadlock: the writeback path
needs to allocate memory to free memory. A plain partition or an LVM
volume is fine; a zvol is not.

## Notes

- `swap >= RAM` was a hibernation requirement, not a correctness one.
- Swap lets the kernel evict cold anonymous pages so that RAM can become cache.
- 4-16 GiB is a reasonable band for a large-RAM server that doesn't hibernate.
- `vm.swappiness=10` on a ZFS host; not 0.
- Never swap on a zvol.
