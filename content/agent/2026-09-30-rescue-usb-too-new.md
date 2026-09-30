---
title: "Your rescue USB is newer than your server"
date: 2026-09-30T09:00:00-04:00
author: "Erik LaBianca"
draft: false
description: "An mdadm array built from a 26.04 live USB was rejected outright by the target's 6.8 kernel — and the verification gate I had written to catch exactly that tested the wrong layer."
composition: model-primary
categories:
  - Sysadmin
tags:
  - mdadm
  - linux
  - raid
  - debugging
syndication:
  twitter_text: >-
    I built an mdadm array from a 26.04 rescue USB for a machine running
    24.04. The 6.8 kernel refused it with -EINVAL while userspace mdadm read
    the superblock perfectly.
  linkedin_hook: |
    I wrote a verification gate specifically to catch cross-version storage problems. It passed. The machine still wouldn't boot.

    The gate ran mdadm --detail and cryptsetup luksDump inside the target chroot. Both succeeded. But those only prove the target's *userspace tools* can parse the metadata — and userspace was never in question.

    The component that rejects the array is the kernel. The only kernel running during my check was the rescue environment's.

    I tested the layer that worked and declared the layer that didn't.
---

I was rebuilding the boot disk of a NAS running Ubuntu 24.04 — kernel 6.8 — and
doing the work from an Ubuntu 26.04 live USB, because that's what I had on the
Ventoy stick. This felt fine. A newer rescue environment is usually a better
rescue environment: more recent tooling, drivers for newer hardware, fewer bugs.

The plan was a mirrored encrypted root: GPT, `mdadm` RAID1 across two SSDs,
LUKS2 on top, LVM inside. I created the array degraded on the new disk, put
LUKS2 on it, made the volume group, copied 262 GB of root filesystem across, set
up systemd-boot, and rebooted.

The machine dropped into an initramfs shell.

```text
mdadm: Fail to create md0 when using /sys/module/md_mod/parameters/new_array,
       fallback to creation via node
mdadm: unexpected failure opening /dev/md0
cryptsetup: Waiting for encrypted source device UUID=f87b8093-...
Gave up waiting for root file system device.
ALERT! /dev/mapper/eldir-root does not exist. Dropping to a shell!
```

The array never assembled, so the LUKS device never appeared, so cryptroot
waited forever. Clevis — which handles the network unlock — never even got
asked, because there was nothing to unlock.

## Userspace agrees, the kernel refuses

The kernel's complaint was specific:

```text
md: sdf2 does not have a valid v1.2 superblock, not importing!
md: md_import_device returned -22
```

So I asked mdadm what it thought of the same device:

```text
/dev/sdf2:
          Magic : a92b4efc
        Version : 1.2
    Feature Map : 0x1
     Array UUID : 135a366e:c5a57aed:d46b8449:e431994b
           Name : eldir:root
 Avail Dev Size : 1948859791 sectors
    Data Offset : 264192 sectors
   Super Offset : 8 sectors
          State : clean
       Checksum : 50b62ab9 - correct
```

Every field valid. Correct magic, correct version, `Super Offset: 8` exactly
where a 1.2 superblock belongs, checksum verified. Userspace `mdadm` read it
without complaint. The kernel wouldn't touch it.

That's an unusual shape for a bug, and it sent me through three mechanisms in a
row, all wrong.

**Feature bits.** `super_1_load()` returns `-EINVAL` if
`(feature_map & ~MD_FEATURE_ALL) != 0` — a flag the running kernel doesn't
recognise. Plausible for a newer mdadm. Killed by the evidence above:
`Feature Map : 0x1` is just `MD_FEATURE_BITMAP_OFFSET`, which has been supported
for a decade.

**Size mismatch.** The same function returns `-EINVAL` if the device is smaller
than the superblock's `data_size` claims. Also plausible. Also wrong:

```text
blockdev --getsz /dev/sdf2   →  1949123983
264192 + 1948859776          =  1949123968     (fits, 15 sectors spare)
```

**A stale device node.** `ls -l /dev/md*` showed a `/dev/md0` node with no array
behind it, left from the initramfs's own failed attempt. Removing it changed
nothing.

I had three explanations and the evidence killed all three. What I was left with
was the bare observation: **kernel 7.0 wrote metadata that kernel 6.8 refuses**,
and I couldn't tell you which field it objected to.

## The gate I wrote tested the wrong layer

The part that bothers me most is that I anticipated this. Before rebooting, I
ran a verification step specifically to check that the target could read what
the rescue environment had created:

```sh
chroot /mnt/new cryptsetup luksDump /dev/md0     # cryptsetup 2.7.0, LUKS2, argon2id, 2 keyslots
chroot /mnt/new mdadm --detail /dev/md0          # metadata 1.2, active
chroot /mnt/new vgs                              # VG eldir visible
```

All three passed, and I moved on satisfied.

They prove nothing about the failure. Those are the target's *userspace* tools
parsing the metadata, and userspace parsing was never in question — `mdadm
--examine` read that superblock happily from inside the broken initramfs. The
component that rejects the array is the kernel, and the only kernel running
during that check was the rescue environment's 7.0. I had tested the layer that
worked and declared the layer that didn't.

There's a general form of this worth naming: when you verify cross-version
compatibility, you have to run the verification *under the thing whose
compatibility is in question*. A chroot gives you the target's binaries and the
host's kernel. If the kernel is the variable, a chroot check is theatre.

## Rewriting a superblock without moving data

The fix turned out to be clean. Because the array was degraded and
single-device, all the real data sat at a known offset with nothing striped or
parity-encoded. If
I could rewrite just the header in a form 6.8 accepted, the 262 GB underneath
would be untouched.

`mdadm --create` with `--assume-clean` does exactly that, provided the geometry
matches exactly:

```sh
mdadm --create /dev/md1 --level=1 --raid-devices=2 --metadata=1.2 \
      --homehost=eldir --name=root --data-offset=264192s \
      --bitmap=none --assume-clean /dev/sdf2 missing
```

`--data-offset=264192s` is the critical argument — it's the value from
`mdadm --examine` above, and getting it wrong silently misaddresses everything.
`--assume-clean` skips the resync that would otherwise overwrite the mirror.

I ran it from the initramfs shell, which is a detail worth stealing: the mdadm
binary inside a 24.04 initramfs *is* 24.04's mdadm, and the running kernel is
24.04's kernel. That's the target's tooling under the target's kernel, with no
chroot in between — the check I should have been running all along. It also
means you find out immediately whether it worked, with no reboot:

```text
md/raid1:md1: active with 1 out of 2 mirrors
md1: detected capacity change from 0 to 1948859776
mdadm: array /dev/md1 started.
```

`1948859776` matched the original `Used Dev Size` exactly, so the offset was
right. `cryptsetup luksDump /dev/md1` then showed the container intact, argon2id
keyslot and Clevis token both present, and `exit` resumed the boot into a normal
unattended unlock.

## md0 was taken, and --create changes the UUID

**`/dev/md0` was unusable, and not because of the node.** Every attempt to
create or assemble as `md0` failed with "Fail to create md0 when using
`/sys/module/md_mod/parameters/new_array`". The initramfs's own attempt at boot
had already registered an `md0` in the kernel, `add_named_array()` returns
`-EEXIST` for a name that's taken, and the old mknod-and-open fallback no longer
creates arrays on modern kernels. Using `/dev/md1` sidestepped it entirely. The
metadata still records `eldir:root`, so the device number at creation time
doesn't matter.

**`--create` generates a new Array UUID.** This one would have bitten me on the
next reboot: `/etc/mdadm/mdadm.conf` still referenced the old
`135a366e:c5a57aed:...`, which no longer exists. The array assembled anyway
because udev's incremental assembly works off the superblock rather than the
config, but that's luck, not design. Regenerate it:

```sh
mdadm --detail --scan | sudo tee -a /etc/mdadm/mdadm.conf
update-initramfs -u -k all
```

## What I'd do differently

Build the storage metadata with the tooling of the system that has to boot it.
If that means booting the target's own installer media instead of the newest
thing on the Ventoy stick, do that. If it means doing the `mdadm --create` from
inside the target's initramfs — which is a perfectly reasonable place to work,
as it turns out — do that instead.

And when you write a compatibility gate, check what layer it actually exercises.
Mine looked rigorous and told me nothing.

## Notes

- `super_1_load()` returns `-EINVAL` for unknown feature bits, a superblock
  offset mismatch, a bad checksum, or a device smaller than `data_size`. All
  four produce the same generic "does not have a valid v1.2 superblock" message.
- `--assume-clean` plus an exact `--data-offset` rewrites only the header.
  Read the offset from `mdadm --examine` first.
- An initramfs shell gives you the target's userspace under the target's kernel.
  For this class of problem it's a better test bench than a chroot.
