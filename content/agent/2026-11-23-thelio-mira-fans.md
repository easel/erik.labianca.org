---
title: "My Thelio's fans were loud because nothing was driving them"
date: 2026-11-23T15:00:00-05:00
author: "Erik LaBianca"
draft: false
description: "A Thelio Mira with stuck-high fans: no system76-power daemon was running. Porting a smoothed fan controller from my Windows driver fixed the noise."
composition: model-primary
categories:
  - Sysadmin
tags:
  - system76
  - thelio
  - fan-control
  - linux
  - ryzen
---

A System76 Thelio Mira (Ryzen 9 5950X, Thelio Io board) on Arch was running
its fans at about 90% with the CPU only moderately busy. The cause turned out to
be simpler than a bad curve.

## Nothing was in charge

```bash
systemctl is-active com.system76.PowerDaemon   # inactive
cat /sys/class/hwmon/hwmon2/pwm1_enable        # 1 (manual)
cat /sys/class/hwmon/hwmon2/pwm1               # 231, about 90%
```

Only `system76-power-debug` was installed, not the daemon. The Io board was in
manual mode at a high duty cycle and stayed there regardless of temperature.

## The stock curve is not quiet either

With the daemon running, Mira uses `FanCurve::standard()`: 30% at 45°C, 40% at
65°C, and 100% at 88°C, applied to a single reading every second. On a 5950X
that routinely sits at 80-90°C under PBO, any transient load spins the fans up
hard.

I had already built a better controller for the
[Windows port](https://github.com/easel/thelio-io-windows) of the Thelio Io
driver, so I ported it to Linux. It adds:

- a 0%/40%/100% curve at 40/60/90°C;
- a 5-sample average of the hottest CPU/GPU sensor;
- immediate rise to a 40% quiet floor;
- a 1%/s ramp above the floor that only starts after load has been sustained
  for 10 s (CPU load at 50% or more near 90°C, or a GPU at 70°C or more);
- a 10 s delay before ramping down;
- an instant 100% at 93°C as a safety override.

Only `thelio-mira-*` boards use it. Every other model keeps its stock curve.

## Result

After installing, `pwm1` dropped from 231 to 102 (the 40% floor) and fan speed
fell from about 1600 RPM to about 700 RPM, with the CPU at 85°C under a heavy
Steam workload. That is the intended trade: the controller lets a PBO CPU run
warm instead of chasing it with noise. If you want it cooler, lower the 90°C
target or raise the floor in `FanConfig`.

## Install it

The patch is on a fork, one commit on top of upstream:
[easel/system76-power, branch `thelio-mira-pbo-fan-controller`](https://github.com/easel/system76-power/tree/thelio-mira-pbo-fan-controller).

```bash
git clone -b thelio-mira-pbo-fan-controller https://github.com/easel/system76-power
cd system76-power
cargo build --release
sudo make install prefix=/usr
sudo systemctl daemon-reload
sudo systemctl enable --now com.system76.PowerDaemon
```

You also need the `system76-io` kernel module (`system76-io-dkms` on Arch) so
the Io board shows up as an hwmon device. `system76-power` also manages power
profiles, so you may want to disable `power-profiles-daemon`. Stopping the
daemon hands fan control back to the board.

This is tested on one machine, a Thelio Mira r1. The Windows controller's CPU
package-power trigger is not ported, because AMD package power has no standard
hwmon source on Linux.
