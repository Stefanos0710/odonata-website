---
title: "Fixing PCB, CAD and lastly starting and finishing the Landing station!"
date: 2026-05-25T10:12:43Z
minutes: 359
phase: landing
cover: /journal/9079/01.webp
falloutId: 9079
recordings:
  - https://lookout.hackclub.com/api/media/18ada570-57e6-4fd8-b9e5-8464013dad85/video.mp4
---

After uploading the PCB into Fusion, it looked like that:
![Figure 1](/journal/9079/01.webp)

and after placing it in the drone, it looked like that: 
![Figure 2](/journal/9079/02.webp)

and now I started creating the columns, so that I can screw the PCB with the fx on the drone.

After measuring the height, I started placing them (height was 8.82mm) +4mm , because of the thickness of the platfrorm

but firstly I had to check how big the hole should be

and I decided that I should add an additional 2mm for more stability, and also so that the heat insert fits perfectly, and after adding the holes which I copied from the arms and lastly rounded the bottom, it looked like that: 
![Figure 3](/journal/9079/03.webp)

and after adding the PCB on it again, it looked like that:
![Figure 4](/journal/9079/04.webp)

and then I wanted to add the text to the drone, so I firstly searched up how to do that. You have to make a new sketch and then there is a tool called "Text" where you can write sth on the sketch

Firstly I wrote the name on it: ODONATA
![Figure 5](/journal/9079/05.webp)

and then the version plus date: 
![Figure 6](/journal/9079/06.webp)

then I started making the 3D model a bit cooler and made small like notches on the sides: 
![Figure 7](/journal/9079/07.webp)

I tried other things like /// >>> or ||| but that didn't look nice and I just left it as it was, but now...... THE DRONE ITSELF IS FINISHED!!!
Here is the finished drone:

![Figure 8](/journal/9079/08.webp)

and then I started with the landing station. Like I said before, it will be like that and will have its own AprilTag attached in the front.

I firstly drew the lines and made an outline of 1cm, so that if the drone has an offset of 10mm it will position itself, and now I also made a small outline of 0.5mm, so that the drone can perfectly fit.

And then I deleted the old lines and kept the others, and so I got that: 
![Figure 9](/journal/9079/09.webp)

but after that I saw that I forgot to add the holes for the front, back, and the arms. So I went back and changed that.

And after adding them in the sketch, it looked like that:

![Figure 10](/journal/9079/10.webp)

now I only had to make the 10mm offset, so it works out with the 10mm error.

And then I had to stop because I had a headache, and after measuring my temperature I had a very high fever, so I lay down. And now, one day later, I'm better and continuing! During that time, I remembered that I forgot to add the on/off switch for the drone into the CAD, and I decided to place it on the back because it's the easiest to click there; on the sides, the propellers make it more dangerous.

And I decided to use this switch: https://www.digikey.de/de/products/detail/e-switch/RA1113112R/3778055?gclsrc=aw.ds&gad_source=1&gad_campaignid=20496382285&gclid=Cj0KCQjww8rQBhDjARIsAE43KPMbfgeEBc8-5HGrJN0BMzVz1RTfrfVK5zAIDxv98wixdx1Dpi16iw4aAjvNEALw_wcB because it can handle up to like 120V and 10A, which IS PERFECT!! It looks like the classic switch (cool): 
![Figure 11](/journal/9079/11.webp)

and then I found the dimensions of the cutout and I directly applied them into the CAD:


and after cutting it out, it looked like that, but the cover holder thing was also sticking out, SO I decided to also cut it.

And I wanted to see if the battery and the switch would fit into it, and during that, I saw that the JST-GH that I added to the PCB was different from the one on the battery, so I had to update the footprint: 
![Figure 13](/journal/9079/13.webp)

and after searching online, I found out that I would need this one: `Connector_JST:JST_XH_B4B-XH-A_1x04_P2.50mm_Vertical`

and after updating, I had to fix some issues with that: 
![Figure 14](/journal/9079/14.webp)

and after finding the optimal position and rewiring, it looked like this (and in 3D, I was a bit shocked btw that this connector is THAT BIG):

![Figure 15](/journal/9079/15.webp)
![Figure 16](/journal/9079/16.webp)

but then I was very afraid that the battery wouldn't fit perfectly, so I designed the battery to test it, and..... the battery didn't fit, whYyYY? 
![Figure 17](/journal/9079/17.webp)

and after trying and thinking for like 20 min what to so, I saw that the only solution would be to extrude the back by 15mm. So after adding a construction plane and moving it to the point, I split the back of the drone, moved it back, and made the back of the drone larger. And after positioning the battery in there, it was almost perfect (I'm just afraid how the center of gravity will be).

 ![Figure 18](/journal/9079/18.webp)

I just had to cut a bit of the cover holding part and it would be fine, SO I did it.

I cut the part that was unnecessary and I rounded the cut corners, and it looked like that: 

![Figure 19](/journal/9079/19.webp)

so after that, this part was finished:

![Figure 20](/journal/9079/20.webp)

But I still had to position the on/off switch. At first, I didn't want to position it on the cover, but I didn't have space anywhere else, so I had to do it. And after finding the perfect spot for the on/off button on the top, it looked like that:

![Figure 21](/journal/9079/21.webp)

It is the perfect position because it needs about 2cm to the bottom, and there is nothing for about 2.5cm, and it's directly under the pins which is connected to it.

and the drone is finished!!!!

and now we continue on the landing station again, but when I wanted to open it, it was lost.... I probably forgot to save, sooooo I had to start from the beginning T-T

I firstly started by making a new sketch and projecting the important lines: 

![Figure 22](/journal/9079/22.webp)

and after making an offset of 10mm (so that the drone centers itself): 

![Figure 23](/journal/9079/23.webp)

I then started extruding for 50mm, so that after landing the camera can still see the AprilTag and can stabilize itself etc. After that, I made the hole in the middle where the drone will land on: 
![Figure 24](/journal/9079/24.webp)

after that, I cut out where the parts will stick out, so the arms and the front and back body.

So I firstly removed the holes and the text from the platform, so that I can extrude and cut the things out of the landing station:
![Figure 25](/journal/9079/25.webp)

and so I cut the front and back object into the landing station: 
![Figure 26](/journal/9079/26.webp)

Now I had to cut the arms, but therefore I firstly had to measure the angle of the arms, and after measuring I found out that it was 3.6 degrees: 
![Figure 27](/journal/9079/27.webp)

But firstly I selected the arms and cut the holes:
![Figure 28](/journal/9079/28.webp)

and after that, I rounded the corners.

1. I rounded the corners of the arms with a radius of 2mm. I used that because it's small enough so that the drone is still in a good position, but also good for the printer so that it doesn't have to like stop and go in the other direction.

And then I continued on those corners: 
![Figure 29](/journal/9079/29.webp)

I decided to use 4mm here so that it looked like a half circle and so cleaner: 
![Figure 30](/journal/9079/30.webp)

and now I had to make an offset of 0.2mm so that the drone isn't stuck:

![Figure 31](/journal/9079/31.webp)

and now I added the angle for the drone arm, but I first had to search how you do that because I didn't know that.

And I tried with many tools like Loft, chamfer, and draft. At first, I didn't really know how they all worked so I had to find that out, and all of them had their problems and it didn't end up how I wanted it. I was thinking of other solutions like maybe cutting it with planes or making like a sketch and then extruding that part with cut, but luckily after checking Draft, it worked perfectly! And after adding 45 degrees, it was perfect and I only had to adjust the height of the platform where the drone will sit:

![Figure 32](/journal/9079/32.webp)

and then I wanted to make that landing station a bit nicer looking, so I added the project name: 
![Figure 33](/journal/9079/33.webp)

then also added a small like barrier by making an outline: 

![Figure 34](/journal/9079/34.webp)

and I had the idea to also add Bumpons so that it stays at its place and also cushions the drone a little bit, SO I right away made the holes for it in the CAD model.

I tried making them as close as possible to the edges of the landing station with a diameter of 13mm:
![Figure 35](/journal/9079/35.webp)

and after that, I extruded them with cut mode for 1.2mm:

![Figure 36](/journal/9079/36.webp)

to make it prettier, I also added some little like strips or like blocks here: 
![Figure 37](/journal/9079/37.webp)

and also added some text at the bottom:

![Figure 38](/journal/9079/38.webp)
 
lastly (for good looks, I also added an outline to the center tiles): 
![Figure 39](/journal/9079/39.webp)
![Figure 40](/journal/9079/40.webp)
Looks sooooooo cool!!

and now I only had to add the AprilTag attachment code thing, and for that I had to firstly find out where the center of the camera is.

I started by projecting the camera thing and finding the center. Then I calculated that I would need 5mm so that the connection would be strong enough, and then I drew the rectangle—and the AprilTag can be this large.

And then I had the idea to make it so that you can slide in a piece of paper so that you don't have to glue it etc., SO I had to make like a cover with walls, and that's what the sketch looked like:
![Figure 41](/journal/9079/41.webp)

and after extruding the parts, it looked like that: 

![Figure 42](/journal/9079/42.webp)

For the connecting mechanism, I thought of something like that. I added 2 of them for more stability, but also so that it cannot turn to the left and right, and then these teeth so that it doesn't come out.

![Figure 43](/journal/9079/43.webp)

and after rounding, it looked like that: 

![Figure 44](/journal/9079/44.webp)

and additionally I then added an offset of 0.25mm so that it perfectly fits:
![Figure 45](/journal/9079/45.webp)

and then I extruded it (cut) into the station by 5mm.

And directly afterward, I added the original piece to the AprilTag holder and rounded the connection by 1mm: 

![Figure 46](/journal/9079/46.webp)

After that, I rounded the corners of the holder itself and I was finished with the CAD for that PROJECT!

![Figure 47](/journal/9079/47.webp)

Happy with the progress today (last day), fixed the PCB + drone and started and ended the landing station. Sorry that this session got that long, I just didn't have the energy to fix and write the journal while I was sick...
