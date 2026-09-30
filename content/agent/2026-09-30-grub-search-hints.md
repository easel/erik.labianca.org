---
title: "GRUB hints are an optimization until they're an outage"
date: 2026-09-30T09:00:00-04:00
author: "Erik LaBianca"
draft: false
description: "search.fs_uuid hints are only a shortcut — until the fallback is an exhaustive scan across four ZFS pool members that never finishes."
composition: model-primary
categories:
  - Sysadmin
tags:
  - grub
  - uefi
  - zfs
  - boot
syndication:
  twitter_text: >-
    grub-install computes its device hints from whatever is plugged in when
    you run it. Run it from a rescue USB and the stick shifts the
    enumeration, so it writes a hint that's guaranteed to miss at real boot.
  linkedin_hook: |
    A GRUB hint is supposed to be free. It's a "look here first" for search.fs_uuid, and a wrong one costs you milliseconds.

    Unless your fallback is scanning every block device — including four ZFS pool members with SLOG and special vdevs. Then it never comes back, and it looks exactly like a firmware hang.

    The part I hadn't considered: grub-install derives that hint from the machine as it exists right now. Run the standard recovery procedure — boot a live USB, chroot, grub-install — and the USB stick's own device ordering gets baked into the config it writes.
---

On a UEFI Ubuntu system there's a 123-byte file on the ESP that almost nobody
looks at. Mine was at `\EFI\ubuntu\grub.cfg` and contained this:

```text
search.fs_uuid 0a9ccc8b-d14c-4291-9eb8-7bf71995a901 root hd2,msdos1
set prefix=($root)'/grub'
configfile $prefix/grub.cfg
```

That's the whole bootstrap. The signed `grubx64.efi` on the ESP has no idea
where your real configuration lives, so this stub finds the `/boot` filesystem
by UUID, sets `$prefix` to point at it, and chains to the `grub.cfg` that
`update-grub` generates. Three lines, and I'd never read them before the day my
NAS stopped booting.

## What the hint does

The important thing is the grammar of that first line:

```text
search.fs_uuid <UUID> <variable-to-set> <hint> [<hint> ...]
```

The UUID is the target. Everything after the variable name is a **hint** — a
list of devices to try first. GRUB opens each hinted device, reads its
filesystem, compares UUIDs, and stops at the first match. If no hint matches,
it falls through to iterating every block device it can see, trying every
filesystem driver on each one until it finds that UUID.

So the hint is pure optimization. It doesn't change what GRUB looks for, only
the order. A wrong hint is supposed to cost you a few hundred milliseconds.

## The fallback scan never finished

On a laptop with one disk, the exhaustive scan is invisible. On this machine,
"every block device" meant two 6 TB HGSTs, two 22 TB Seagates, two NVMe drives
carved into ZFS SLOG and special-vdev partitions, a Windows disk that had been
transplanted from another machine, and the boot SSD. GRUB has a ZFS module, so
scanning those devices means GRUB's ZFS reader walking pool labels on four large
members and two bare special/log vdevs with no pool assembled around them.

It never came back. The machine sat at the Supermicro splash with POST code
`A2` and an unresponsive keyboard, which looks exactly like a firmware hang and
is in fact a bootloader that's still running and will never finish.
`GRUB_TIMEOUT=0`
with `GRUB_TIMEOUT_STYLE=hidden` meant there was no menu to miss — a healthy
GRUB would also have shown me nothing.

I want to flag the diagnostic difficulty there, because it's the reason this
took hours rather than minutes. Everything visible pointed at firmware: POST
code stuck at a storage-enumeration stage, dead keyboard, no output at all.
Every one of those is also consistent with GRUB blocking inside a driver call
before it initializes terminal input or clears the framebuffer.

## grub-install writes hints for the wrong machine

Here's the part I'd never thought about. `grub-install` doesn't know your boot
topology — it computes the hint from the machine as it exists *right now*,
using `grub-probe`:

```sh
$ grub-probe --target=hints_string /boot
--hint-bios=hd5,msdos1 --hint-efi=hd5,msdos1 --hint-baremetal=ahci5,msdos1
```

I ran that from a rescue USB. The Ventoy stick was enumerated as `sdd`, which
pushed the boot SSD from fifth position to sixth, so `grub-probe` said `hd5`.
At real boot time, with the USB removed, that disk is `hd4`. The hint I'd just
written was guaranteed to miss.

That's a genuinely nasty property. The recovery procedure everyone reaches for —
boot a live USB, chroot, `grub-install` — bakes the live USB's device ordering
into the config it writes. It works on most machines because the fallback scan
succeeds in a second or two. It bit me because my fallback scan doesn't
terminate.

I tried to paper over it by listing several hints, which `search` accepts:

```text
search.fs_uuid 0a9ccc8b-... root hd4,msdos1 hd5,msdos1 hd3,msdos1 hd6,msdos1
```

That didn't help either. **A wrong hint buys you nothing.** GRUB tries each,
none has the UUID on partition 1, and
it falls through to the same exhaustive scan it was doing before. Hints only
help if one of them hits.

## The second copy, one layer down

Even if the stub had worked, there was another copy of the same mistake waiting.
`update-grub` writes hints into the *generated* config too, in every menu entry:

```sh
$ grep -c 'hint-efi=hd5' /boot/grub/grub.cfg
12
```

Twelve occurrences, all `hd5`, all baked during the same chroot session with the
USB plugged in. So the stub would have found `/boot`, loaded the real config,
and then hit an identical `search` with an identical wrong hint one layer down —
same hang, later in the sequence, and considerably more confusing to debug.

## What I did instead

I stopped using GRUB. Not out of pique: the machine was getting a rebuilt boot
stack anyway, and systemd-boot's model removes this entire failure class.
Kernels and initrds live on the ESP, which the firmware reads natively as FAT.
There is no search, no hint, no device enumeration, and no ext4 driver in the
boot path. The bootloader reads a config file from the filesystem it was loaded
from and starts a kernel.

If you're staying on GRUB, the two things I'd take from this:

Run `grub-install` from the installed system whenever you can, not from rescue
media, so the hints are computed against the hardware that will actually be
present at boot. And if you have a lot of block devices — especially ZFS
members — check what `grub-probe --target=hints_string /boot` returns, because
a wrong answer there is a boot failure waiting for the next time something
changes the enumeration order.

## Notes

- `search.fs_uuid UUID VAR [HINTS...]` — hints are tried first, then an
  exhaustive scan of all devices.
- The ESP stub at `\EFI\<distro>\grub.cfg` and the generated
  `/boot/grub/grub.cfg` each carry their own hints. Fixing one doesn't fix the
  other.
- `grub-probe --target=hints_string /boot` shows exactly what `grub-install`
  will write.
- `GRUB_TIMEOUT=0` plus `hidden` means a working GRUB and a hung GRUB look
  identical.
