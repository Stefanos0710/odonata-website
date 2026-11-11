---
title: SPONSORING and the PERFECT parts!
date: 2026-11-11T18:00:00.000Z
minutes: 400
phase: forest
---

SOOOO, a lot happened in the last few days for V2.

First of all.... I got my first sponsor: Rohde & Schwarz, who are lending me the NVIDIA Jetson Orin NX 16GB until the end of July, which is AWESOME!!!!!!

I also wrote to a TON of other companies for sponsoring, but none of them has answered yet. I hope they will, because it would be extremely expensive to buy all the parts on my own. SO I hope I'll get an answer soon.

Oh and btw, I also need sponsoring for the server to train the drone! SO if some company reads this and has resources for that, please sponsor me. But anyways, let's continue.


## The cameras

I checked on the cameras and HAD a long, very detailed and extremely helpful conversation with **HONG KONG AU-STAR ELECTRON TECHNOLOGY CO., LIMITED**. They sold me these sensors for a VERY good price of 52 dollars a cam (60 dollars for the one with the special 730 nm filter). The PCB is almost as small as the camera lens, which is perfect.

This is what I got:

- AR0234 global shutter sensor, 1920x1200, up to 120 fps, MIPI (module model AS-BE438A20M8-81)
- monochrome, not color
- module size 20x20 mm with an 81 mm flat cable
- M12x0.5 lens holder, the lens is not glued, 95° horizontal field of view
- a hardware trigger pin is brought out, so I can sync the two stereo cameras

The only negative thing is that I have to write the camera driver for the Jetson myself, because they only send the sensor initialization register list after the order :( and I also probably need a small adapter board, because the connector doesn't match the normal CSI connectors on carrier boards.

For a total of 261 $ I got 4 cameras with the specific lenses and filters I need:

- 2x with the 95° lens and an IR650 cut filter (the stereo pair for navigation)
- 1x with the 95° lens and a 730 nm bandpass filter (FWHM 20 ± 5 nm), no IR-cut (for the bark beetle)
- 1x with the 95° lens and an 850 nm bandpass filter (FWHM 50 ± 5 nm), no IR-cut (for the bark beetle)

Btw, the price includes 45 dollars of shipping (216 $ for the cameras + 45 $ shipping). Pretty happy with this purchase because similar cams in europa cost the same just for one cam



## The part research...

But anyways, then the GIGANTIC part research began: for finding out which motors, battery and propellers I need, what flight time I get, etc. That took AGES, and by AGES I mean a very very long time.

1. My goal

The whole drone has to stay under 45 cm, measured from the propeller at the front left to the propeller at the front right (the length is free). And I want a flight time of about 30 min.

The fixed parts (Jetson, carrier board, cameras, flight controller, GPS, cooler) weigh 850 g. Frame, guards, motors, props, ESC, wiring and battery come on top.

2. The candidates

Then I let Claude research the batteries, motors and propellers that could fit the drone. It checked 34 motors (19 of them can do the job on 6S), 4 prop sizes with 4 pitches each (16 props) and 16 battery packs. That makes 34 x 16 x 16 = 8,704 combinations.

The 19 motors that can do the job on 6S (rm is the terminal resistance, "est." means the vendor page didn't list it and it is an estimate):

```csv
motor,kv,mass_g,rm_mohm,best_flight_time_min,best_prop_and_pack
MAD BSC2807,1300,47.0,65 est.,31.9,8.5x3.5 / 6S4P M65A
DarwinFPV 2807,1300,55.7,60 est.,31.6,8.5x3.5 / 6S4P M65A
T-Motor F100 2810,1100,67.0,61,31.4,8.5x5 / 6S4P M65A
Hobbywing XRotor 2807,1300,59.0,55 est.,31.3,8.5x4 / 6S4P M65A
T-Motor F100 2810,1350,66.5,42,31.1,8.5x4.5 / 6S4P M65A
iFlight XING2 2809,1250,60.7,65.5,30.9,8.5x4 / 6S4P M65A
iFlight XING2 2809,1600,59.9,47,30.8,8.5x3.5 / 6S4P M65A
FT 2812,1100,77.0,46,30.6,8.5x5 / 6S4P M65A
MEPS Neon 2810,1180,67.0,65,30.4,8.5x4.5 / 6S4P M65A
Hobbywing XRotor 3110,1150,88.0,45,30.0,8.5x5 / 6S4P M65A
MEPS Neon 2810,1350,67.0,46,30.0,8.5x5 / 6S4P M65A
3110 (vendor test page C7.5 prop),1580,79.4,35.8,30.0,8.5x4 / 6S4P M65A
Yahree 3110,1250,87.5,36.4,29.9,8.5x5 / 6S4P M65A
Hobbywing XRotor 3115,1050,126.0,31,28.6,8.5x5 / 6S4P M65A
T-Motor V3115,1050,112.7,33.8,28.4,8.5x5 / 6S4P M65A
Hobbywing XRotor 3110,900,89.0,59,23.9,8.5x5 / DOGCOM 12Ah only
Yahree 3110,900,87.5,61,23.8,8.5x5 / DOGCOM 12Ah only
Hobbywing XRotor 3115,900,125.0,41,22.5,8.5x5 / DOGCOM 12Ah only
T-Motor V3115,900,113.1,38.1,21.8,8.5x5 / DOGCOM 12Ah only
```

The other 15 motors (some T-Motor MN3110, MN3508, MN3510, U3, V3120 and V3115 versions, and the iFlight XING2 2809 KV800) cannot do it on 6S unfortuantly :(( Their KV is too low to spin an 8.5 prop fast enough on 21 V, so they failed the test before even looking for efficientcy

... and to the props: I ran every size at 3.5, 4, 4.5 and 5 pitch. The width over the guards is 2 x diameter + 16 mm (8 mm clearance between the two neighbouring guard rings + 8 mm on the outside):

```csv
prop_size_in,diameter_mm,width_over_guards_mm,fits_450_mm
7,178,372,yes
7.5,191,397,yes
8,203,422,yes
8.5,216,448,yes (2 mm spare)
9,229,474,no
10,254,524,no
```

So the width limit caps the props at 8.5. Prop masses per piece: Gemfan 7040 7.9 g (7"), 10 g for 7.5" (estimated), HQ Cine8 8x4.5x3 13 g, T-Motor C8.5x5x3 14.8 g, HQ MacroQuad 8.5x4x3 15 g

The battery packs (the star * is the predicted current rating from claude):

```csv
pack,energy_wh,mass_g,wh_per_kg,cont_current_a
DOGCOM 6S 12Ah semi-solid,266,795,335,60
Tattu 6S 12Ah semi-solid,266,800,333,36
Tattu 6S 17Ah semi-solid,377,1376,274,51
DOGCOM 6S 22Ah semi-solid,488,1536,318,66
Tattu 6S 25Ah semi-solid,555,2048,271,75*
Tattu 6S 33Ah semi-solid (sold out),733,2355,311,100*
6S2P Molicel M65A,281,934,301,52
6S3P Molicel M65A,421,1394,302,78
6S4P Molicel M65A,562,1853,303,104
6S2P Amprius SA112,270,904,299,26
6S3P Amprius SA112,405,1348,300,39
6S2P Amprius SA17,259,928,279,36
6S2P Rincell RC50,216,820,263,50
6S2P Molicel P50B,216,880,245,100
6S3P Molicel P50B,324,1312,247,150
6S3P Samsung 50S,324,1312,247,60
```

The Li-ion packs are built from 21700 cells, plus 15 g + 12.5 g per parallel group for wiring and wrap.

3. Calculating all the combinations with fancy math

The next step was calculating all the combination and finding the optimal ones for flight time. I didn't just read the numbers off one vendor chart, because the charts only cover a few motor and prop pairs (and for the same 7" prop two vendors differ by about 40 percentage points). Instead every combination is solved from physics. The propeller efficiency is fitted once to 20 vendor bench tables, then the same equations run for all 8,704 combinations.

Weight: All-up weight = 850 g + frame + guards + ESC + wiring + 4 motors + 4 props + battery, with

```
frame = 245 g + 8 g per inch of prop above 7" + 4 % of the battery mass above 800 g
```

Propeller: Thrust and shaft power follow the standard coefficients:

```
T       = C_T * rho * n^2 * D^4
P_shaft = C_P * rho * n^3 * D^5
C_P     = C_T^(3/2) / (sqrt(2) * FM)
C_T     = 0.13 * pitch / D
```

T is thrust, n is the revolutions per second, D the prop diameter, rho the air density (1.20 kg/m³ for Munich) and FM the figure of merit. FM = 0.47 is the median of my fits to the bench data.

MOTOR: The torque gives the current, the losses are copper loss and no-load loss, and the ESC has an efficiency:

```
Kt          = 60 / (2 * pi * KV)
current     = torque / Kt
copper loss = I^2 * Rm
no-load loss: I0 scaled with rpm^1.5
ESC efficiency = 97 %
```

Maximum thrust: The highest thrust where the motor voltage stays under 98 % of 21 V (loaded 6S), the motor current stays under its rating, and the battery current stays under both the 60 A ESC and 1.5x the pack rating (per motor, one quarter of it).

Flight time:

```
flight time = 0.85 * pack Wh / (1.2 * motor power + 25 W)
```

0.85 is the usable energy (landing reserve and voltage sag), 1.2 is the flight factor (forward flight, gusts and control cost more than a static bench test) and 25 W is for the avionics.

I also checked the model against the vendor bench tables. Across 20 sets the mean error is 8.6 % and 17 of 20 are within 15 %. For example the T-Motor F100 KV1350 + HQ 8x4.5 is off by -0.4 %, and the T-Motor V3115 KV1050 + T8.5x5 by +0.8 %. I left out one "3110 KV1580" curve, because it claims 44 % less power than my model and than every other motor and prop pair, so I don't trust it.

How much the winner build changes when I change one assumption at a time:

```csv
assumption,value,flight_time_min
baseline,-,31.4
flight factor,1.0 / 1.4,37.4 / 27.0
prop figure of merit,0.55 / 0.40,36.5 / 26.8
usable energy,90 % / 80 %,33.2 / 29.5
avionics,15 W / 35 W,31.7 / 31.0
```

So I expect 27-37 minutes.

4. The best parts for the DRONE

The longest-flying build that fits 450 mm and 850 g of fixed parts is: **4x T-Motor F100 2810 KV1100, 4x T-Motor C8.5x5x3 props (216 mm) and a 6S4P Molicel M65A pack** (24 cells, 562 Wh). It weighs 3,442 g, hovers at 913 W (740 W for the motors x 1.2 flight factor + 25 W avionics) and the predicted flight time is **31.4 min**. Thrust-to-weight is 2.7.

Two lighter packs trade minutes for weight:

- 6S3P Molicel M65A (421 Wh): 29.2 min at 2.96 kg
- DOGCOM 6S 12Ah semi-solid (266 Wh): 25.7 min at 2.34 kg

The motor choice matters little, every 2807-2810 motor lands within about 1.5 minutes of the best one. The battery and the 8.5" prop decide the result. I picked the F100 because it has measured data and vendor bench tables, while four of the other top motors rest on estimated values.

In the end I went with the lighter pack, so these are my parts:

| Part | Pick | Weight |
|---|---|---|
| Motors | 4x T-Motor F100 2810 KV1100 | 268 g |
| Props | 4x T-Motor C8.5x5x3, 216 mm | 60 g |
| Battery | DOGCOM 6S 12Ah semi-solid, 266 Wh | 795 g |

Next I want to bench-test one F100 with a C8.5x5x3 prop on a scale at 6S (the model predicts about 185 W at 860 g of thrust), and later compare the measured hover power from the first flight with the model.

SOOOO, it's been a super productive few days! In the next update, I'll be starting the first draft of the paper!!! Really excited about what's coming. See ya!
