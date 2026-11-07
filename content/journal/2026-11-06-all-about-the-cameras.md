---
title: ALL about the CAMERAS!
date: 2026-11-06T18:00:00.000Z
minutes: 260
phase: forest
cover: /journal/entry-mw58916s/mw5fn65cc9b98a.webp
---

Hellooo, today I wanted to work out everything about the cams: how many I need, how to get a good price, and where to place them. They have two jobs: the navigation (depth as input) and the multispectral cams that can detect signs of bark beetles.



First of all, I thought about how to place the arms. A week ago I was at a workshop from Fraunhofer, and there were drones with V-shaped arms so that the propellers didn't get in the way of the camera and you had a clear view. So I began to research different types. I already knew some, like the classic X shape, the H shape and the V shape. What I found out was the Dead Cat frame, which is perfect: you can place the camera further forward and the propellers aren't in the picture. That is exactly what I want, because I want a big view of everything around the drone.

I also thought about tilted arms, because I saw them on some DJI drones. After researching what they are for, I quickly dropped that idea again. They are for more stability, which is good at first, but they are less efficient and need more power to fly, which is kinda bad.

SOOOO, I decided on the Dead Cat frame and a horizontal drone design.

---


Next, I wanted to decide how to place the cams and how many I need.

My first thought was a 180° 3D depth cam, so that I can later give it to the AI that I train (navigation through the forest). The plan was 3 DIY depth cams (6 cams in total) with a view of 60° each, so that I don't get a fisheye effect. The first pair goes in the front and the other two at 45° to the left and right.

![First plan: three depth camera pairs with 60° view each](/journal/entry-mw58916s/mw5fn65cc9b98a.webp)

Then 2 more cams for the detection of bark beetles, so 8 cams in total.

But this brought SEVERAL PROBLEMS:

**1. Size**
The cams had huge PCBs behind the lens. They take a lot of space and it would be hard to place the cameras near the edges. A servo holder with 2 cameras also has to fit, and because the PCB is tall, the nose would have to be HUGE and I couldn't afford that.

**2. Price**
It would be hella expensive: 8 cams at about 70-100 dollars each = too much money that I can't afford and no sponsor would give me.

**3. Multiplexer**
I would have to design a complex multiplexer IC myself, because buying one that costs 200-300 dollars multiple times would so not be possible.

---

So I threw this idea partly into the trash and checked how DJI does it (again).

Their camera boards are so small that they are about as small as the lens they use. They use a rigid-flex PCB (Starr-Flex-Platine) where they combine all the cams, and it also does the things that are done on the big PCB of consumer cams. It is perfectly designed for the case. So I was just like: "Why shouldn't I also do that?!?!"

I checked how it would be possible:

1. The rigid-flex PCB was a bit more expensive, but ok, not too expensive.
2. How the camera should be mounted and where it should be: the good news is the camera sensor is only 30 bucks, but the bad news is that it has like 70 pins that are less than 1 mm apart and have to be soldered by a PCBA service. Most of the companies that do that don't have these sensors, and the design of the PCB would be very complicated. I wanna go the safe way and not mess my drone up.

Then I had the idea to use only 2 pairs of depth cams, but most of the problems stayed the same: too little space and giant PCBs.

So I was kinda stuck at this point and searched for other cams that are smaller than the others.


And then BINGOOOOO, I found a camera module whose PCB is the SAME SIZE AS THE LENS!!!!!!

![The camera module whose PCB is the same size as the lens](/journal/entry-mw58916s/mw5gxj3f2590d6.webp)

And its specs are PERFECT:

- Field of view: 120°
- Fixed focus (more on that below)
- PCB the same size as the lens, so it is tiny and easy to place near the edges
- Available as a colour and a monochrome version
- Price: 35 dollars per cam

I also noticed that I don't need a 180° view, 120° is actually enough. And the price is perfect too: 35 dollars per cam!!!

Then I thought that I only need 2 depth cams, oriented like this:

![Two depth cams, first orientation](/journal/entry-mw58916s/mw67mttqec1d5a.webp)

But both cams would still interfere at the top corner, and it would be a bit tight on space. Then I found another variant with an even better view: a 145° objective that still keeps the fisheye effect low. A wider view means the two cams see more of the forest on the sides and overlap more in the middle, which is good for the depth.

The specs of this variant:

- Field of view: 145°
- Low fisheye effect
- Fixed focus

I measured that the distance between the 2 cams should be 60 mm. That is a good compromise: close enough that the two views overlap early (so the drone can see things that are near), and still far enough apart to get usable depth. It also keeps the nose small.

Then I thought that maybe I could use both cams for the bark beetles too. But then I remembered that the bark beetles cams have to be the monochrome version. A colour sensor has a colour filter in front of every pixel. If you put an infrared narrow-band filter on top (730 nm red edge and 850 nm NIR), the colour filter blocks most of the light again and the image gets very noisy. So for the bark beetles I need monochrome. Luckily, on Alibaba there are both versions, and I can get the 4 cams for a total of 140 dollars.

Then I wondered whether the cams have autofocus, and I learned something new: the focus has to be fixed. With autofocus the image changes a bit while it focuses, and the drone would be irritated about what the hell just happened.


NOWW I knew which cams to use and roughly where to place them, but I had problems here again. But I think I had a brilliant idea.

Firstly, I took some inspiration from the DJI Mavic 3 Pro, where both cams are on the upper stage and the cameras that have to orientate are under that. But my multispectral cams mostly have to look upwards, so this part would block their view.

![Camera placement inspired by the DJI Mavic 3 Pro](/journal/entry-mw58916s/mw686z3v1671d3.webp)

So my first idea was to just put them at the bottom of this bar. But I wasn't completely happy with this, because it looks kinda weird, and if it rains a little bit, water would collect there, which would have the exact opposite effect of the original idea.

That's why I got this idea: I could place the 2 nav cams on the outside, and in the center the other 2 cams for the bark beetles, stacked over each other. This fixes my problems and is also more aerodynamic.

But this had one problem: now the baseline between the 2 cameras was bigger, and the focus would be at 10-15 m.

The math solution (yippeeee!!): in CAD I angle the two outer nav cams inward by exactly **10.4°**. I calculated it with

`α = arctan(B / (2 · D_min))`

where B is the distance between the two cams and D_min = 30 cm is the closest distance I still want to see in 3D. This way the views of the two cams cross right in front of the nose.

The total view to the front is a GIGANTIC 164.8°, and the pure 3D stereo area is a perfect 123.2°.

---

So actually happy with the progress today. Did some good work here, and also with the math, nice.

TMW will be the OPTIMAL PART SELECTION OF THE DRONE. See ya!
