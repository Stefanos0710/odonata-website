---
title: Starting Research for V2!!!
date: 2026-11-05T18:00:00.000Z
minutes: 165
phase: forest
cover: /journal/entry-mw3u7ekn/mw3z1jv691dfd8.webp
---

Today, since I am on vacation and cannot finish V1, I am starting to research V2 and getting the first sponsors...

I was pretty confused and didn't really know where to start; maybe on the FC, overall finding out what the specs should be, what the old drone was bad at, what to optimize and much, much more. So after a clear thinking phase I decided to first write down everything that didn't work well on the last drone:

- Stability in flight: it wobbles and can't hold its position well
- The FC was terrible: too little storage to load MAVLink etc., and pretty slow
- The base was pretty wobbly, the arms were TOOOO flexible and the case broke easily
- Center of mass was a HUGE problem (especially the battery)
- Flight time was a problem too (under 5min)
- The drone was heavier than I thought (>300g)
- The onboard computer (Raspberry Pi Zero 2 W) was awful, the Wi-Fi often didn't work

So I first looked into HOW I could fix the problems I encountered.

---

**1. Stability in flight**

Here I went down a huge rabbit hole of how you can PERFECTLY stabilize a drone in the air (I think I searched the whole internet).

What I found is that DJI and other crazy drone companies rely on a TON OF SENSORS: optical flow sensors, RTK GPS, lidar, high-speed camera input, high-end FCs with extremely good noise filtering, and UWB sensors to measure the distance indoors (they mostly place 4 of them in the room and their drones can then autonomously do crazy stunts; some unis are doing that, too). 

But since I have (unfortunately) a limited budget, and most of these systems work best indoors, I have to find the best sensors that I only REALLY need, at an acceptable price, so that I won't be broke for the next 30 years. And since forests are outdoors, where there can be a lot of wind etc., I need to highly optimize the drone's stability system (I'll call it DSS, cool name :3).

So the 3 main components that I'll need are:

- **A high-speed FC** (optimally an H7 or F7 version). I also saw that ArduPilot has the EKF3 algorithm, which handles the high-speed data from the other sensors we'll talk about now perfectly.
- **An optical flow sensor + lidar.** It takes pictures of the ground at 100 Hz (100 times per second) and has a lidar, so it can compare the pictures and calculate how it moved. The current best module is the MTF-01P, which is only 35 dollars, yipeeee!!! (not the best, but for consumers probably one of the best)
- **RTK GPS.** Fortunately, RTK GPS can give you 1–3 cm accuracy, but you normally need a base station or one from a company as a ground station. But because I live in Bavaria, Germany, there is a system called SAPOS which gives you it completely for free, so I only need the antenna!!! So I'll take a 2 or 3 band RTK module, so that I have about 1–2 cm accuracy, and in the forest about 10–30 cm, which together with the optical flow should be perfect. I also have to use GPS to set the area where the drone needs to measure and track things in the forest, and to find its ground station again.

While writing these 3 things up, I noticed something that I think will save my drone: I can use the 4 cameras that I'll use for the depth as a 3-dimensional optical flow sensor. Then I can kick out the other optical flow sensor and just use a ToF for the height, together with the barometer.

btw this is how most of DJI's drones work!!!

But then I thought of an issue again: when I'm not in a closed forest where I have a lot of different textures (trees) to calibrate the position, and am on a field instead, it would totally drift off. But then I remembered that I'll have a perfect RTK GPS connection, which fixes everything again.

SO now the first problem is fixed!

**2. The FC**

This was kinda fixed in the last step, where I said that I'd need a high-speed controller with at least 2 MB of storage (not like the old one, which had 512 KB) and more RAM. I was thinking of an H7 or F7, but which exact model, or whether I should design one myself to optimize it for Odonata, I'll check later, when I've decided which parts I will take and which components give the longest flight time etc.

**3. The base, the arms and the case**

This should be an easier fix, because the new drone will be bigger. I took a bit of inspiration from the big DJI drones and how they are built:

![Inspiration: how DJI builds its big drones](/journal/entry-mw3u7ekn/mw3z1jv691dfd8.webp)

I'll 3D print the middle center case part, and the arms will be made of carbon fiber tubes, so that they are light but also incredibly stiff.

For the filament I also kinda fell into a rabbit hole, because there are SOOOOOOOO many different filament kinds:

Polycarbonate (PC), PC-ABS, PA6 (Nylon), PA12 (Nylon), PA11 (Nylon), PA12-CF, PA6-GF, PCTG, PETG, ABS, ASA, Polypropylene (PP), TPU 95A, TPU 85A, TPE, PEEK, PEKK, PPS, PPS-GF, PPA, PPA-CF, PPA-GF, PEI (ULTEM), PC-PBT, CPE... and sooo much onnnn

Then I filtered out the ones that are bad with humidity and kept the ones that are stiff and don't bend easily:

Polycarbonate (PC), PC-ABS, PCTG, PETG, ABS, ASA, PPS, PPS-GF, PEI (ULTEM), PC-PBT, CPE.

And of those, the ones that I can print on my P2S and that cost under 50 €:

PC-ABS, PCTG, PETG, PETG-CF, ABS, ASA.

And lastly I found out what I'll use: PETG-CF for the main parts that have to be very stiff and robust. ASA for the cover and the parts that are outside, because it is water resistant, humidity doesn't affect it, it is UV resistant and also strong. And TPU 95A for bumpers like the landing feet and for the cameras.

SO this is also fixed.

**4. Center of mass**

Yeah, I mean, I can only try to design it more precisely. "Hab's mir hinter die Ohren geschrieben" is how I'd say it in German.

**5. Flight time**

Like the one before: better research and better design. As light as possible, bigger props, optimal motors and a big, huge battery which is efficient. I would love it if this drone had 30+ minutes of flight time.

**6. Weight**

Exactly like the one before: BETTER DESIGN.

**7. The onboard computer**

Here I actually know exactly what to take: NVIDIA Jetson Orin NX 16GB.

btw I should get one from my sponsor :3

---

SOOO I think I have a base plan now and a plan to start.

Tomorrow or in the next few days I'll plan and calculate all the parts, make a rough plan of the architecture and of what exactly V2 should do. See ya soon, supppper hyped for V2!!!!
