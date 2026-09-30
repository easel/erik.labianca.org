---
title: "You cannot mirror an EFI System Partition"
date: 2026-09-30T09:00:00-04:00
author: "Erik LaBianca"
draft: false
description: "UEFI has no RAID below the bootloader, and nothing in Ubuntu keeps a second ESP current. What actually works, and the two traps in between."
composition: model-primary
categories:
  - Sysadmin
tags:
  - uefi
  - raid
  - linux
  - boot
syndication:
  twitter_text: >-
    RAID1 gives you a mirrored root. It does not mirror the ESP, because
    UEFI has no concept of RAID below the bootloader — and kernel-install
    only ever writes to one $BOOT.
  linkedin_hook: |
    You set up a mirrored encrypted root, copy the ESP to the second disk, verify they match, and declare victory.

    Three months and four kernel updates later, the primary has the current kernels and the secondary still has the one from the day you built it. Then apt autoremove drops that kernel's modules, because nothing on the system knows the second ESP still references it.

    Now pull the primary. The firmware falls through exactly as designed, and boots a kernel whose modules no longer exist.

    That's worse than having no second ESP at all.
---

I rebuilt a NAS onto a mirrored encrypted root: two SSDs, `mdadm` RAID1, LUKS2
on top, LVM inside. That layout is well-trodden — it's what the Debian and
Ubuntu Server installers produce when you ask for software RAID plus
encryption, and the reasoning for putting RAID *below* LUKS is sound. You
encrypt once instead of twice, resync traffic is ciphertext, and rebuilds work
on raw blocks below the crypto layer.

What the RAID doesn't cover is the part that boots.

## What RAID1 does and doesn't cover

The ESP has to be readable by firmware, which means plain FAT32 on a plain
partition. It can't live inside the array, because the firmware has no idea what
`md` metadata is. So the layout is really:

```text
sdX1   2 GiB   ESP (FAT32)          <- outside the array, firmware reads this
sdX2   929 GiB md member -> LUKS2 -> LVM -> root
```

Mirror the second partition and you have a redundant root. The first partition
is just a partition, on one disk, doing nothing redundant at all.

**UEFI has no concept of RAID below the bootloader.** UEFI exposes no mirrored-ESP
feature. What people mean by "mirrored ESP" is two independent
partitions on two disks, each formatted FAT32, each with its own NVRAM boot
entry, and something keeping their contents identical. The firmware tries the
first entry; if that disk is gone, it falls through to the second.

The first two of those are easy. `bootctl install --esp-path=/boot/efi2` writes
systemd-boot to a second ESP and creates the NVRAM entry in one command. It's
the third that nobody hands you.

## Nothing keeps the second ESP current

`kernel-install` writes to exactly one `$BOOT`. Ubuntu's kernel hooks resolve
that once and copy the kernel and initrd there. There is no second destination,
no awareness that another ESP exists, and no warning that one is stale.

So the failure mode is this: you set both ESPs up correctly, copy one to the
other, verify they match, and declare victory. Three months and four kernel
updates later, the primary has kernels 6.8.0-150 through -158 and the secondary
still has -142. Then `apt autoremove` drops `linux-modules-6.8.0-142`, because
that kernel is long gone from the primary and nothing on the system knows the
secondary still references it.

Now pull the primary disk. The firmware falls through to the second ESP exactly
as designed, systemd-boot starts, and boots a kernel whose modules no longer
exist on the root filesystem. That's a worse outcome than having no second ESP
at all, because you built it specifically for this moment and it fails in a way
that looks like the disk failure caused it.

## Don't dd the ESP

The obvious way to populate the second ESP is `dd if=/dev/sda1 of=/dev/sdb1`.
Don't.

A block-level copy duplicates the FAT volume UUID. Your `fstab` then has:

```text
UUID=963C-D4EF  /boot/efi  vfat  ...
```

and two partitions claiming that UUID. `/dev/disk/by-uuid/963C-D4EF` resolves to
whichever was probed last, which is not stable across boots. So `/boot/efi` may
mount the ESP on the disk you are *not* currently booting from, and your kernel
updates land there while the one the firmware reads goes stale. Same rot as
above, but now it's nondeterministic.

Use `mkfs.vfat` on the second partition so it gets its own UUID, then copy at
the file level:

```text
esp1  963C-D4EF
esp2  5B90-1FE7
```

Same for the partition GUIDs if you clone the GPT — `sgdisk --backup` /
`--load-backup` reproduces the layout exactly, then `sgdisk -G` randomizes the
disk and partition GUIDs so the NVRAM device paths stay distinguishable.

## nofail is necessary and not sufficient

Both ESPs need `nofail` in `fstab`, or losing either disk drops you to emergency
mode at boot and the RAID1 underneath buys you nothing:

```text
UUID=963C-D4EF  /boot/efi   vfat  umask=0077,nofail,x-systemd.device-timeout=10  0 1
UUID=5B90-1FE7  /boot/efi2  vfat  umask=0077,nofail,x-systemd.device-timeout=10  0 1
```

But `nofail` on its own introduces a quieter problem. If the second disk is
absent, `/boot/efi2` is an empty directory on the root filesystem rather than a
mount — and a sync script that doesn't check will happily write a full copy of
your kernels into it. You'll consume space on root, believe the mirror is
current, and have written nothing to any ESP.

So the sync has to verify it's talking to a real filesystem before it does
anything.

## The hook

```sh
#!/bin/sh
set -u
SRC=/boot/efi
DST=/boot/efi2

fail() { echo "sync-esp: $*" >&2; logger -p daemon.err -t sync-esp "$*"; exit 0; }

[ -d "$SRC" ] || fail "REFUSING: $SRC missing"
findmnt -t vfat "$SRC" >/dev/null 2>&1 || fail "REFUSING: $SRC is not a mounted vfat filesystem"
findmnt -t vfat "$DST" >/dev/null 2>&1 || fail "WARNING: $DST is not mounted - secondary ESP NOT updated"

rsync -a --delete --exclude="loader/random-seed" "$SRC"/ "$DST"/ \
  || fail "WARNING: rsync to $DST failed - secondary ESP is STALE"
sync
echo "sync-esp: secondary ESP updated"
```

The `findmnt -t vfat` checks are the point. Exclude `loader/random-seed` —
systemd-boot maintains one per ESP and copying it between them defeats its
purpose.

Wire it into all three hook directories, because kernels arrive and leave
through different paths:

```text
/etc/kernel/postinst.d/zz-esp-sync
/etc/kernel/postrm.d/zz-esp-sync
/etc/initramfs/post-update.d/zz-esp-sync
```

`postrm` matters as much as `postinst`. Without it, removing a kernel cleans the
primary and leaves an orphan on the secondary.

Then rehearse it before you trust it:

```sh
$ apt reinstall linux-image-6.8.0-142-generic
$ diff -r --brief /boot/efi /boot/efi2 | grep -v random-seed
(no output)
```

Both ESPs updated, same timestamps, same 75967048-byte initrd. That's the test
that proves the mechanism, and it takes two minutes.

## It isn't proven until you pull a disk

Everything above is still theory until you physically remove each disk in turn
and boot. I'd pull the primary first — it holds the ESP that the original NVRAM
entry points at, so that's the more interesting failure.

There's one more thing that only shows up at that point. An array created with
`missing` starts immediately as a one-of-two degraded array, because the
superblock's last-known working count is 1. Once you add the second member and
it syncs, that count becomes 2 — and a subsequent boot with one disk absent goes
through the initramfs retry loop before `mdadm --run` starts the array degraded.
Which means today's clean degraded boot tells you nothing about tomorrow's.

That test is the only thing that distinguishes a mirror from two disks that
happen to contain the same bytes.

## Notes

- `bootctl install --esp-path=<path>` sets up a second ESP and its NVRAM entry.
- Fresh `mkfs.vfat` per ESP, never `dd` — duplicate FAT UUIDs make `/boot/efi`
  mount nondeterministically.
- `sgdisk --backup` / `--load-backup` then `sgdisk -G` clones a layout with
  unique GUIDs.
- `nofail` on both, plus a sync hook that refuses to run when the destination
  isn't a mounted vfat filesystem.
- Degraded-boot behaviour changes after the array knows it has two members.
