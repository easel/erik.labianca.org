---
title: "Google Meet doesn't use the ports you think"
date: 2026-09-30T09:00:00-04:00
author: "Erik LaBianca"
draft: false
description: "WebRTC media over QUIC on UDP 443 defeats port-based QoS. DSCP matching and a connection-rate bound both fix it; adding 443 to your priority lane does not."
composition: model-primary
categories:
  - Netadmin
tags:
  - qos
  - mikrotik
  - webrtc
  - networking
syndication:
  twitter_text: >-
    My QoS classified conferencing media by the port ranges in the vendor
    docs. Modern Chrome carries Meet media over QUIC on UDP 443, which
    matches none of them — so calls landed in the default queue.
  linkedin_hook: |
    Port-based traffic classification has run out of road, and I found out from choppy video calls.

    My router prioritises conferencing media by UDP port range, straight from the vendor documentation. Those ports are real. The media often doesn't use them — modern Chrome carries WebRTC over QUIC on UDP 443.

    The obvious fix is to add 443 to the priority lane. Don't: QUIC on 443 also carries YouTube and Drive, so you'd put a 4K stream inside the lane you were protecting.

    Two things that do work: match Chrome's own DSCP marks, or bound a bare 443 match by connection rate.
---

Someone in the house reported choppy Google Meet calls. I have QoS on the router
— a MikroTik RB5009 running fq-codel with a three-tier queue tree, shaped both
directions — and conferencing traffic is supposed to be in the priority lane. So
either the QoS wasn't working, or Meet wasn't landing in the lane I thought.

Measuring first, from a wired host on the same segment: zero packet loss to the
gateway, to the affected machine, and to `8.8.8.8`, with 0.05 ms jitter on the
LAN and 0.71 ms to the internet. Nothing wrong at the time I looked, which
already suggested I was chasing something intermittent and load-dependent rather
than broken.

So I went and read my own classifier.

## What the rules match

The queue tree is straightforward: a root capped just under measured line rate,
then three children by packet mark. Realtime gets priority 1 with `limit_at=50M`
and `max_limit=200M`; unmarked traffic gets priority 4; bulk gets priority 8.

The marking is where it falls apart. Here's what earns the `realtime` mark:

| Match | Intent |
| --- | --- |
| UDP 3478-3481 | STUN/TURN — Zoom, Teams, Meet, Discord |
| UDP 19302-19309 | Google Meet media |
| UDP 8801-8810 | Zoom media |
| UDP 22466 | Slack Huddles |
| UDP 7775-7785, 19340 | a game |
| TCP 443 to `99.77.152.0/24` | Twilio Video fallback |

Those port ranges come from vendor documentation and they're not wrong, exactly.
`19302` really is Google's STUN port; you can look it up in Meet's network
requirements today.

But modern Chrome frequently carries the actual media over **QUIC on UDP 443**
to Google's edge. That matches nothing in the table, so it falls into
`*-default` at priority 4, competing on equal terms with every download,
backup, and OS update on the network. Under load, that's the choppiness.

The tell that I'd already met this problem and not generalized from it is the
last row. Twilio Video — used by a telehealth app in the house — falls back to
TCP 443 when UDP is blocked, and at some point I'd noticed and written a rule
for it, scoped to Twilio's specific AWS prefix. I solved the instance and missed
the pattern.

## Adding UDP 443 makes it worse

The obvious fix is to add UDP 443 to the realtime match. This is a bad idea and
worth being explicit about why.

QUIC on 443 carries YouTube, Drive, Gmail, and a growing share of ordinary web
traffic. Marking all of it priority 1 would put a 4K YouTube stream inside a
lane capped at `max_limit=200M`, sharing it with the call you were trying to
protect. That's *worse* than the status quo, where Meet at least competes on
even footing in the default queue instead of being crowded by YouTube inside a
smaller ceiling.

Port-based classification has run out of road here. The port no longer
identifies the application.

## DSCP is the clean answer

Chrome marks its own WebRTC media: **EF (46)** for audio, **AF41 (34)** for
video. Matching on that is port-agnostic, so it catches Meet, Teams, Zoom and
Slack regardless of which transport they picked:

```text
/ip firewall mangle
add action=mark-connection chain=forward dscp=46 new-connection-mark=realtime passthrough=yes
add action=mark-connection chain=forward dscp=34 new-connection-mark=realtime passthrough=yes
```

The mechanism that makes this work in both directions is worth understanding.
Your ISP almost certainly bleaches DSCP on the inbound path, so only the
*egress* packets carry the marking. But `mark-connection` is bidirectional —
mark the connection on the way out and the return traffic inherits it. That's
the same trick the existing `dst_port` rules rely on, so the download side is
covered even though the inbound packets arrive unmarked.

The caveat: DSCP is set by the client, so any host on your LAN can claim
priority 1 by marking its own packets. On a home network with hosts you control,
fine. On anything less trusted, it isn't a classifier, it's a request.

## connection-rate as the fallback

For clients that don't set DSCP, there's a second approach that makes a bare
UDP 443 match safe — bound it by throughput:

```text
add action=mark-connection chain=forward protocol=udp dst-port=443 \
    connection-rate=0-6M new-connection-mark=realtime passthrough=yes
add action=mark-connection chain=forward protocol=udp dst-port=443 \
    connection-rate=6M-100G new-connection-mark=bulk passthrough=yes
```

WebRTC media sits around 0.5 to 4 Mbps sustained. YouTube and Drive ramp well
past 6 Mbps and get demoted to bulk dynamically as they do. The rate ceiling is
what removes the need for a destination prefix list: any flow that stays under
6 Mbps can't meaningfully crowd a lane with `limit_at=50M`, whatever it is.

It costs per-packet evaluation on every UDP 443 flow, which on an RB5009 with
fasttrack already disabled for shaping is acceptable but not free. Watch
`/system resource print` after enabling it.

## place-before is not optional

One MikroTik-specific detail that cost me a moment. My existing packet-marking
rules use `passthrough=no`:

```text
add action=mark-packet chain=forward connection-mark=realtime new-packet-mark=realtime passthrough=no
```

New connection-marking rules appended to the chain land *after* that, so they'd
never be evaluated for a packet on an already-marked connection. They need
`place-before` pointing at the packet-marking rule. If you manage these in
Terraform, that's `place_before =
routeros_ip_firewall_mangle.realtime_pkt_mark.id`
— and it isn't optional.

## What I'd check on your own setup

Open `chrome://webrtc-internals` during a call and look at the selected
candidate pair's remote port. If it's in 19302-19309, your port rules are
working. If it's 443, they aren't, and you've been running without the
prioritization you thought you had.

Then check the queue counters during a call. If the default queue is pinned at
its limit while the realtime queue sits near idle, that's the confirmation.

## Notes

- Meet's documented STUN ports are real; the media often doesn't use them.
- Never blanket-match UDP 443 — QUIC carries YouTube and Drive too.
- DSCP EF (46) / AF41 (34) is port-agnostic and catches every conferencing app.
- `mark-connection` is bidirectional, which is what covers the download
  direction when the ISP bleaches inbound DSCP.
- A `connection-rate` ceiling makes a bare 443 match safe without a prefix list.
