---
title: "Two uplinks don't automatically double your bandwidth"
date: 2026-10-01T09:00:00-04:00
author: "Erik LaBianca"
draft: true
description: "A new 10 GbE switch, a VLAN-blind spanning tree, and a NAS bond missing half its members. Two cables were only the beginning."
composition: model-primary
categories:
  - Netadmin
tags:
  - networking
  - mikrotik
  - lacp
  - linux
syndication:
  twitter_text: >-
    I added a 10 GbE SFP+ switch and found two different ways for a second
    cable to contribute nothing: spanning tree blocked the working path,
    and my NAS's second NIC had never joined its bond.
  linkedin_hook: |
    Two cables, two link lights, and a bond in the configuration. None of that proves both links are carrying traffic.

    Adding a 10 GbE switch exposed a faster path that couldn't carry our management VLAN. Then we found the NAS's second 10 GbE NIC had been outside its bond for months.

    The useful checks were the active spanning tree path, the VLAN membership on that path, and the actual members of the Linux bond. The intended topology was only a starting point.
---

I bought a MikroTik CRS309-1G-8S+IN to put eight SFP+ ports in the loft. The
immediate motivation was unreliable copper connections: one uplink wouldn't
reliably run at 10 Gb/s, and I wanted to move several desktops onto SFP+ NICs
and direct-attach cables.

There were already two loft switches, garage-side and road-side, each with
its own run to the core CRS312 downstairs. My first thought was to connect
the new switch to both of them. That made a loop, but spanning tree would
handle it. Could it also use both paths?

That question led to a new topology, a cutover outage, and the discovery
that my NAS's existing two-port bond had been using one port for months.

## A loop gives you a spare path

The proposed ring looked like this:

```text
                  core CRS312
                  /          \
          garage-side      road-side
                  \          /
                   new CRS309
```

With ordinary RSTP, a port is blocked to make the forwarding topology
loop-free. The second path becomes a backup; it doesn't add bandwidth to
the first. MikroTik documents this behavior in its
[bridging guide](https://manual.mikrotik.com/docs/bridging-and-switching/).

The alternative was to move both downstairs runs onto the new CRS309,
which we called `loft-core`, and connect the old loft switches to it by
DAC. Both uplinks would then terminate on the same switch at each end:

```text
                    core CRS312
                         ||
                  intended 2 x 10G LACP
                         ||
                     loft-core
                    /    |    \
                 DAC  desktops  DAC
                  /              \
            garage-side       road-side
```

That is an ordinary 802.3ad LACP bond. Splitting one bond across two
independent switches would require those switches to cooperate, for
example through MLAG. Bringing the cables to one switch at each end
avoided that complication.

It also changed the failure boundary: losing `loft-core` would now
disconnect both loft switches. Two uplink cables protect against a cable
failure, not the failure of the switch they both plug into.

## What 2 x 10G buys you

An LACP bond distributes traffic across its members by hashing packet
fields. A single TCP connection ordinarily stays on one member, so it
doesn't become a 20 Gb/s connection. Multiple connections can use both
members, but they can also hash to the same one. The aggregate capacity
is available; an even split isn't guaranteed. The
[Linux bonding documentation](https://www.kernel.org/doc/html/latest/networking/bonding.html)
describes the single-connection limit.

There's also a distinction between the setting in the configuration and
what the hardware does. We set `layer-3-and-4` in RouterOS, but on the
Marvell Prestera hardware-offloaded bonds in these CRS switches, the
chip uses Layer 2+3+4 hashing regardless of that setting. Changing it
doesn't change the offloaded forwarding behavior. MikroTik calls this
out in its
[hardware-offload documentation](https://help.mikrotik.com/docs/spaces/ROS/pages/30474317/Marvell+Prestera+switch+chip+features).

That mattered later when we adjusted the NAS bond. The Linux host's
transmit policy is configurable; the switch's offloaded policy isn't.
Each end chooses a member for the traffic it sends.

## Spanning tree picked a path that couldn't carry the VLANs

Before the move, garage-side's actual uplink was a 2.5 GbE copper port.
Its nominal SFP+ uplink still held a copper module, but had no link. The
new DAC gave it a faster path through `loft-core`.

During the cutover, that DAC landed in garage-side's `sfp-sfpplus2`.
The physical link came up. RSTP preferred it over the old 2.5 GbE path
and blocked the old uplink.

But `sfp-sfpplus2` was a **VLAN 2 access port**, left over from a desktop
connection. The port at the other end was a trunk. Our management VLAN
was 99, and the network also carried several other VLANs.

The result was an apparently healthy link and an unreachable switch.
RSTP had correctly removed the loop. It hadn't verified that the chosen
path carried the VLANs we needed.

The old copper cable was still plugged in, which made the outage less
obvious. Its port was blocked, so it couldn't rescue the management
traffic.

Moving the garage-side DAC to `sfp-sfpplus1`, the existing tagged trunk,
restored connectivity. The 2.5 GbE copper run stayed connected as a
blocked backup.

There was a second management problem on `loft-core`: its temporary
setup DHCP address remained on an untagged VLAN, causing replies to the
NAS to use that dead path instead of the management gateway. Removing
the temporary DHCP client fixed it. Neither failure needed more bandwidth.

## Eldir's bond was missing a member

While checking the new path to the NAS, Eldir, we inspected its bond.
The switch configuration listed two 10 GbE ports. Linux's `bond0`
contained only `eno3`.

`eno4` had a 10 GbE physical link, but was configured independently.
The file responsible was:

```text
/run/netplan/eno4.yaml
```

Eldir uses Clevis/Tang to unlock its encrypted root over the network.
The initramfs brings up networking before the normal system can start.
In this setup, that stage used a physical NIC to obtain a DHCP lease.
Its generated network configuration survived into the real root.

Netplan's early networkd configuration claimed `eno4` before our
`30-eno4.network`, which assigned it to `bond0`, could take ownership.
The switch had a bond configured. The host had a bond configured. One
physical NIC had never joined it.

The leftover also installed a `wait-online` override waiting for `eno4`.
The March 10 boot log showed that wait failing after two minutes;
services ordered after the network were delayed with it. This wasn't
just unused capacity. The runtime setup wasn't providing the two-member
redundancy we expected either.

The repair dealt with the handoff between boot stages:

- An init-bottom script moved the generated network files into
  `/run/initramfs/net-leftovers/`, preserving them for inspection.
- Masks prevented the generated per-NIC networkd files from taking
  ownership after boot.
- Bond members no longer had to be online individually for boot to
  proceed; `wait-online` waited for `bond0` instead.

After the live repair, `eno3` and `eno4` appeared in the same aggregator.
We also configured fast LACP at both ends and `layer3+4` transmission
hashing on Linux. Changing the switch's bond settings caused an
**11-second outage** while it renegotiated. The existing SMB session
survived, but this was a maintenance-window change, not a harmless edit.

## Verify the bond you have

On Linux, start with the kernel's view:

```bash
cat /proc/net/bonding/bond0
networkctl status eno3 eno4 bond0
```

Check the actual member list, link status, active aggregator, partner
information, and churn. A NIC appearing in the configuration isn't
enough. A NIC with carrier isn't enough either.

On the MikroTik, inspect the bond and the forwarding path:

```text
/interface bonding monitor [find name="eldir"] once
/interface bridge port print detail
/interface bridge vlan print detail
```

For the loft bond, use its name, `uplink`, instead. Check participating
members, hardware offload, which bridge ports are forwarding, and VLAN
membership at **both ends** of every trunk.

To check distribution, run traffic between endpoints while watching
the individual member counters. Compare one TCP connection with several
simultaneous connections, preferably from more than one host. Several
flows can collide in the hash; seeing one busy member in one test
doesn't prove the other is broken. A controlled cable-disconnection
test checks failover separately from throughput.

Those are verification steps, not benchmark results from this work.
At the end of the recorded cutover, the loft had one active 10 GbE
uplink through `loft-core`, with the old 2.5 GbE garage run as an RSTP
backup. Testing the second copper run and completing the core-side
uplink bond were still pending. Eldir's two-member bond was repaired.

The extra cables were useful. What they delivered depended on the
forwarding topology, VLAN configuration, bond membership, and hash—not
the number of illuminated ports.
