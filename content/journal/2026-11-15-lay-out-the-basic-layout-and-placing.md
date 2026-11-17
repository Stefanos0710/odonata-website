---
title: Lay out the basic layout and placing
date: 2026-11-15T18:00:00.000Z
minutes: 0
phase: forest
cover: /journal/entry-mwi1al5k/mwkz9fckde8d4c.webp
---

First I tried to fit the frame with 8.5 inch props, but that didnt work. With the 45 cm max width I wanted a Dead Cat layout (front motors further apart, back motors closer together), and I need about 15 cm of space between the front props for the body. But with 8.5 inch props that just doesn't fit. So I tried to 7 inch props, and that WORKED!!; also because the flight time is still pretty good.

Then I also started thinking about the angle of the arms, and I want to angle them about 30° inwards so they don't get in the way of the cameras.
 
The next big thing was the battery. I want to put it in a shaft at the bottom of the drone, so the battery (the heaviest part) decides the center of gravity. And I had the idea to make the shaft a bit bigger, so that other batteries can also fit, smaller or bigger ones, and just fill the empty space with foam.
 
But how big should the shaft be? After searching with Claude for similar batteries with more capacity, which would make a flight time of 35+ min possible, I decided to make the battery space 206 × 84 × 54 mm big.
 
There was also a problem with the carrier board, but more about that later.
 
And then the planning of where I should put all the other components.
 
And I realized that there would be a LOTTT of components, soooo:
 
- PDB
- Carrier board
- FC
- 4-in-1 ESC
- Camera board
- GPS

For the GPS I don't need my own PCB, a ready module is way easier and it goes straight to the FC anyway (on a stick, away from the Jetson and the battery cables because of the compass).
 
But then I'd also need a board to connect the sensors with the FC, SOOOO I'd need to create 4 PCBs. My first idea was an in-between board that connects the servo and the sensors to the Jetson, plus the PDB, plus the camera board, plus the FC. And that's a LOOTTTTTT!
 
And after a bit of thinking I had the idea to combine the camera board with the sensors and call it **VAMI Board**, for **V**ideo **A**nd **M**easurement **I**nterface, which is pretty cool. Then I had to "only" design the PDB and the FC, so 3 PCBs to build, and then add the carrier and the ESC.
 
 
And next: the PLACEMENT!!
 
So obviously the FC has to be in the center, and the PDB as close as possible to the battery, so at the back.
 
Because there is a lot of space at the bottom, I can also move the battery forward or back in its shaft, so I can adjust the center of gravity.
 
Btw, what I also thought: I could make an unfolding part at the back where you can take out the battery, connect/disconnect it and also turn the drone on/off.
 
But then a problem occurred when finding the place for the carrier board. It would take most of the space and the FC would not be in the center anymore.
 
SOOO, I thought I'd research what you can do against it. You could adjust the software and tell it how much offset the FC has from the center of gravity, but that isn't perfect. Then I thought maybeee putting it on top of the carrier board, next to the Jetson, and just placing it in the center, which would be kind of a good idea, but I didn't think of the cooling of the Jetson, so this idea was also scrapped. But then I had the idea: WHY NOT JUST PUT IT UNDER THE JETSON AND THE CARRIER BOARD?!?!
 
And I think that is the best solution, but now I wanna calculate how tall the drone will be, 'cause it shouldn´t be like 20 cm (I hope, RIGHT?)
 
Btw, here is a drawing of how I thought it will look:
 
![Sketch of the planned body layout](/journal/entry-mwi1al5k/mwkz9fckde8d4c.webp)
 
And after calculating the height:
 
- bottom shell: 3 mm
- battery case: 48 mm
- ceiling: 3 mm
- FC: 15 mm
- distance between the FC and the carrier: 10 mm
- carrier board + Jetson: 25 mm
- heatsink: 25 mm
- top cover: 3

So in total: 131 mm , so about 13 cm.
 
Which is pretty decent, so let's continue with the other parts (PDB and VAMI).
 
I thought of putting the PDB at the back, so that when you open the back you can easily plug/unplug the battery, and the VAMI board at the front near the cameras, because the carrier board's camera connectors are also in this direction.
 
For the cooling my plan was to put the fan on the left or right side of the drone, so I can just make an airflow through it. So basically I make holes on the left and right side, the heatsink fins sit in a tube that goes through the drone, and on one side there is a fan that pulls the air through. The tube is separate from the inside, so the body stays rainproof and only the metal is in the airflow. For 25 W the heatsink should be around 100 cm³ (for example 80 × 60 × 20 mm), but that's only a rough estimate, so I'll test it on the bench.
 
SOoo, now we have planned the overall position of the parts, and now I wanna find out which carbon tubes I need that are strong enough, so that I can start FINALLY with the CAD.
 
For the arms I first estimated the peak thrust per arm (about 1.6 kg, from ~2.2 kg takeoff weight and a thrust-to-weight of ~3), then ran a simple cantilever beam model in Python to compare tube diameters and wall thicknesses at 130–160 mm arm length, and picked 16 × 1.0 mm roll-wrapped carbon tubes because a bigger diameter makes the arm way stiffer for almost no extra weight (2.5× stiffer for ~3 g), which keeps the arm's resonance above the motor vibrations and should make tuning PX4 easier. Roll-wrapped because pultruded tubes are bad at twisting and clamping. The 70 GPa and the 1.6 kg per arm are assumptions, so I'll check the real resonance in the gyro FFT after the first flights.
 
The motor cables also fit through the tube easily, because it has 14 mm inside.
 
And I want 8 arms in total, so that I have a backup when one breaks.


Next session I´ll start with CAD DESIGN; really excited! See ya!
