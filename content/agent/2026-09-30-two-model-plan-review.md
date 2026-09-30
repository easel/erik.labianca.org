---
title: "Two models reviewed my plan"
date: 2026-09-30T09:00:00-04:00
author: "Erik LaBianca"
draft: false
description: "Before a hard-to-reverse disk rebuild, two model harnesses reviewed the plan independently. What both caught, what one got wrong, and where they disagreed."
composition: model-primary
categories:
  - Computing
tags:
  - ai
  - review
  - process
syndication:
  twitter_text: >-
    Two models reviewed the same plan independently. Both returned BLOCK.
    They agreed on two defects that would have failed silently at reboot,
    and one was flatly wrong about a blocker that took thirty seconds to
    refute.
  linkedin_hook: |
    I was about to repartition the boot disk of a running NAS from a rescue USB. Hard to reverse, and the only rollback was a disk that had already stopped booting.

    So I had two model harnesses review the plan independently. Both returned BLOCK.

    What mattered wasn't the verdicts — a reviewer that can't approve anything isn't a signal. It was getting a list of specific, checkable claims about my own plan.

    Two were confirmed by direct evidence and fixed. One was refuted by a single command. One was a restatement.

    That ratio is fine.
---

I was about to repartition the boot disk of a running NAS from a rescue USB:
MBR to GPT, LUKS1 to LUKS2, GRUB to systemd-boot, single disk to mdadm RAID1.
Hard to reverse, and the only rollback was an old SSD holding a system that had
already stopped booting.

That's the kind of work where a second opinion is worth something, and it was
late enough that I didn't have a colleague to hand. So I wrote the plan down —
current state, target layout, the eight steps already done, the seven
remaining, and an explicit section on what I hadn't root-caused — and had two
model harnesses review it independently. One was `codex`, one was a Fable
subagent. Same brief, separate processes, neither saw the other's output.

Both came back **BLOCK**.

## What both caught

Two findings appeared independently in both reviews, and both would have failed
silently at reboot with no warning during the build.

**The command line would have come from the live USB.** systemd's
`kernel-install` takes boot options from `/etc/kernel/cmdline`, and if that file
doesn't exist it falls back to `/proc/cmdline`. My plan never created that file,
and I'd be running `kernel-install` inside a chroot where `/proc` is
bind-mounted
from the rescue environment. I checked after reading the finding:

```console
$ cat /proc/cmdline
BOOT_IMAGE=/casper/vmlinuz --- quiet splash
```

Every loader entry would have carried that. No `root=`, no `intel_iommu=on`,
and — the part I'd have taken longest to notice — none of the `memmap=`
reservations that mask two known-bad pages of RAM on that machine. The system
would have loaded systemd-boot, loaded a kernel, and dropped into an initramfs
shell.

**The kernels weren't in the copy.** The plan's migration step was
`rsync /mnt/rt/ /mnt/new/`, where `/mnt/rt` was the old root. But the old
`/boot`
was a *separate partition*, mounted elsewhere, so `/mnt/rt/boot` was an empty
mountpoint. I verified it mid-copy:

```console
$ ls /mnt/new/boot
efi
```

An empty directory. `update-initramfs` would have found no kernels and quietly
done nothing, `kernel-install` would never have been invoked, and I'd have
finished with a correctly configured bootloader and an ESP containing zero
kernels.

Neither of those is exotic. Both are the kind of thing you see instantly in
hindsight and not at all at midnight.

## What one got wrong

The Fable reviewer's third blocking finding was that Ubuntu doesn't sign
`systemd-bootx64.efi`, so with Secure Boot enabled the firmware would refuse it
and the machine wouldn't boot. That's true as far as it goes — Ubuntu really
doesn't ship a signed systemd-boot.

It took thirty seconds to refute:

```console
$ mokutil --sb-state
This system doesn't support Secure Boot
$ dmesg | grep -i "secure boot"
secureboot: Secure boot disabled
```

The firmware is from 2017 and has no Secure Boot implementation at all. A
correct general claim, applied to a machine where the precondition doesn't hold.
Worth noting because it's the characteristic failure mode: the reviewer reasons
from the artifact plus general knowledge, and the artifact didn't state the
Secure Boot status. Nothing was wrong with the reasoning; the input was
incomplete.

## Where they disagreed, and who was right

The interesting disagreement was about the thing I most wanted an answer to:
what are the odds this rebuild actually fixes the original boot failure, which
I'd never root-caused?

Fable gave a number — 60 to 70 percent — and reasoned toward it: the live USB
boots via shim and GRUB on the same firmware, which argues against a pure
firmware or memory fault and toward something specific to the old disk's ESP,
its ext2 `/boot`, or its `grub.cfg` — all of which the rebuild replaces.

Codex refused to give a number, and said so explicitly: no controlled
comparison isolates GRUB probing from firmware behaviour from memory, the ECC
history and the recent quiet SEL concern different observations, and "a
numerical probability would be invented."

Codex was right, and I think this is the more useful reviewer behaviour. The
60-70% figure reads as calibrated but isn't derived from anything — there's no
base rate, no reference class, no measurement. It's a confident-sounding
expression of a hunch, and hunches are exactly what I was trying to guard
against by asking for review. The refusal was more informative than the
estimate.

Fable's *reasoning* was still valuable, though. "The live USB boots through the
same chain on the same firmware" is a real piece of evidence that I hadn't
weighted properly. The number was noise; the argument wasn't.

## What neither caught

Both reviews missed a defect that showed up an hour later. I'd built the mdadm
array with the rescue environment's mdadm under kernel 7.0, for a target running
kernel 6.8, and 6.8 rejected the superblock outright. The machine dropped to an
initramfs shell.

Codex came closest — it filed the exposure under uncertainty rather than
findings, noting that the array and LUKS2 container were created with 26.04
tooling while the target runs 24.04, and that creating or unlocking successfully
in the rescue environment "does not demonstrate target compatibility." That's
the right instinct, filed one severity level too low.

But I'd read that note, agreed with it, and written a verification gate to
address it — a gate that ran `mdadm --detail` and `cryptsetup luksDump` inside
the target chroot and passed. Those only prove the target's *userspace* can
parse the metadata. The kernel is what rejects it, and the only kernel running
at that point was the rescue environment's. The reviewer flagged the right risk
and I built the wrong control.

## How I'd run it next time

The thing that made this worth doing wasn't the verdicts. Two BLOCKs told me
nothing by themselves; a reviewer that can't approve anything isn't a signal.
What was worth the twenty minutes was a list of specific, checkable claims about
my own plan that I could go and test against the machine.

So: treat the output as leads and verify every one. Of the four blocking
findings I got, two were confirmed by direct evidence and immediately fixed, one
was refuted by a single command, and one was a restatement. That ratio is fine.
Running them independently mattered too — the two agreements carried much more
weight than either alone would have, precisely because neither reviewer had seen
the other's reasoning.

And write the brief properly. The Secure Boot miss was my fault, not the
reviewer's: I described the firmware's age and vendor but never stated whether
Secure Boot was on. Reviewers can only reason about what you tell them, and the
fields you leave out are the ones they'll guess at.

## Notes

- Independent runs, separate output files, neither reviewer seeing the other.
- Any finding without evidence you can check yourself is not actionable; verify
  before acting, including the ones that sound obviously right.
- A reviewer that declines to estimate something unmeasurable is behaving
  better than one that produces a plausible number.
- Missing facts in the brief become confident wrong findings in the review.
