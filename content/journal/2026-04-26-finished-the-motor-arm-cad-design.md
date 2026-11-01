---
title: "Finished the Motor-Arm CAD design!"
date: 2026-04-26T20:03:32Z
minutes: 86
phase: cad
cover: /journal/4111/01.webp
falloutId: 4111
recordings:
  - https://lookout.hackclub.com/api/media/eadea0cb-7eba-4867-9160-201d867545b6/video.mp4
---

1. I started with the cable canal, but I wasn’t sure if I should use a lid or just leave it open. I decided to first leave it open and not design a lid because it would be pretty complicated, increase the weight, and make debugging or modifying the drone harder.

While starting to design the tunnel in the 2D sketch, I noticed a mistake: I saw that the ends of the arms were rounded by mistake.

![Figure 1](/journal/4111/01.webp)

So I added corners for better next design.

After fixing this, I draw the tunnel which is 3 mm width, because the cable is 2.4 mm.

![Figure 2](/journal/4111/02.webp)

Then I extruded the canal by 3 mm so that the cables can perfectly fit:

![Figure 3](/journal/4111/03.webp)

But it didn’t look clean, so for better cable handling I rounded the corners / sides:
- the back line I added a 3 mm fillet  
- the side parts I added a 1 mm fillet  

![Figure 4](/journal/4111/04.webp)

Then I continued: I started designing a small part that extrudes from the end of the 2 arms so that I can put an M2 heat insert in it and later screw it onto the base for more stability. But because I didn’t really have a clear plan where everything should be / look like and how all sizes should fit, I first started with a design of how the arm connects to the base and how the PCB and other parts should be positioned.
![Figure 5](/journal/4111/05.webp)

After I had a plan, I decided to make the height exactly 3 mm because the insert is the same size. I also made it 10 mm long for more stability so the screw has enough space, but also the cable can go into the base without any problems.

![Figure 6](/journal/4111/06.webp)

After that I also rounded the corners (2 mm) and extruded the hole for the insert, then I copied and redesigned this part on the other arm.

![Figure 7](/journal/4111/07.webp)

Lastly, I also added an extra height of 0.1 mm to the whole arm to compensate for small errors, for example from the insert.

This session today was nice and I managed to finish the arms! I am happy with the design! In the next session I will start with the base (hopefully also today!).
