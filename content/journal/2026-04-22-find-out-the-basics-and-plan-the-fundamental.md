---
title: "Find out the basics and plan the fundamental"
date: 2026-04-22T21:31:00Z
minutes: 233
phase: research
cover: /journal/3456/01.webp
falloutId: 3456
recordings:
  - https://lookout.hackclub.com/api/media/b6f6d021-7fbb-4be1-8b2f-5608a45261e2/video.mp4
  - https://lookout.hackclub.com/api/media/3165a61b-8592-4b2d-a718-28b1a420eed7/video.mp4
---

Before I started, I only had a rough idea. I wanted to build a drone that can mostly fly on its own and also has a docking station for charging and keeping it safe. I also already had in mind that I want to use a Raspberry Pi as a kind of brain for internet control and later video stream, but I didn’t really know yet how I would integrate that into the drone.


![Figure 1](/journal/3456/01.webp)

Since I never built a drone before and had almost no experience in this field, I started from zero and learned (by doing):

1. what a drone actually is  
2. how a drone works (lift, motors, control)  
3. what parts are needed and what they do  

This was important because otherwise every part I would pick later would feel random and would probably be wrong

After I saw that there are multiple drone layouts, like X, H and +, I chose the X design because:
- it is the most stable in flight  
- it is mostly used for indoor flying  
- it is easier to build for beginners  

![Figure 2](/journal/3456/02.webp)

Then I learned that every drone is controlled by a flight controller (FC).

At first I thought they were almost the same and that I could just buy one and it would be fine, but there are HUGE differences.

There are a lot of different FCs and every choice depends on something else: frame size, sensors, voltage, UARTs, software, etc.

This is where I really got stuck in a loop:

I would pick a part, then realize another part doesn’t match, then change that part, and suddenly the first one doesn’t fit anymore. T-T

So it became like:
- choose FC, changes motor choice  
- choose motor, changes battery  
- choose battery, changes weight  
- weight, changes whole frame idea  

And then I had to go back again.

It felt like building one decision always breaks another decision...

Another HUGE problem was that:
- many parts were not available in local shops  
- some parts were completely sold out  
- China shops were (only sometimes) cheaper but had long delivery times (3 weeks, which was too long...)

But after a long time of searching I finally found some pretty good components for my drone.

At the same time I also shaped the system idea more clearly: the Raspberry Pi should not control the motors directly, but instead be as a higher level controller for things like internet connection, remote control and later video streaming, while the flight controller handles the real-time flight control. That split made the whole architecture much clearer.

At first I wanted an F4 flight controller with Betaflight because it is:
- powerful enough  
- widely used  

But then I ran into the same problem as before:
- many were too expensive  
- many were out of stock  
- some had long shipping delays  

So after a lot of switching and comparing, I decided on the:

**DarwinFPV F411 15A AIO**

because it was available, fit perfectly in the budget and supports all other parts that I chose.

The next problem I ran into was the weight / thrust ratio

At first my setup gave only ~2:1 thrust ratio.

That is theoretically enough to fly, but extremely slow and unstable.

So I decided to upgrade motors from 1104 to 1204 size

So I lastly decided on the **Happymodel 1204 5000KV**, because it has very good thrust, is compatible with the other components and is pretty cheap with fast delivery.

To combine everything, I adjusted the full system with the right battery:
> Tattu R-Line 850mAh 3S 150C

and for the props:
> Gemfan Hurricane 3016 (3 inch)

After checking again if everything was compatible with each other, I had my final components :

- FC: DarwinFPV F411 15A AIO  
- Motor: Happymodel 1204 5000KV  
- Battery: 3S 850mAh  
- Props: Gemfan 3016  

Estimated thrust:
~280g per motor × 4 = ~1120g total

This gives around a 3.7:1 thrust ratio, which is actually solid for this drone!

Pretty happy with the progress and learned very much!
