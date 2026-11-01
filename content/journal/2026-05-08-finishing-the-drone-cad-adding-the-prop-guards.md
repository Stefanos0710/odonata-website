---
title: "Finishing the Drone CAD: adding the prop guards!"
date: 2026-05-08T19:09:51Z
minutes: 103
phase: cad
cover: /journal/6140/01.webp
falloutId: 6140
recordings:
  - https://lookout.hackclub.com/api/media/bb94bc1f-ba94-47e5-aa7d-022d8d77b695/video.mp4
---

Today I wanted to make the prop guards so that I don’t cut my fingers during testing (scared).

So I started by first creating a new file for the guards.  
2. created a new sketch

Then I continued with finding the propeller sizes: they are 76.5mm diameter.

And after searching how tall, how wide, and how much distance between prop guards and props there should be and how tall they should be, etc., I got this:  
4-10mm thick, 4mm distance between the prop and the guard, and make them higher than the prop for more safety.

After that I also decided that I will cut 2mm of the motor arm away where the motor will be placed so that I can recreate that 2mm and clamp the guards between the arm and the motor.

So I first drew how big the props should be and then added 4mm so that everything will work fine, and lastly also made an outline so that the prop will be 2mm thick:

![Figure 1](/journal/6140/01.webp)

Next I measured how tall the motor props are so that I can extrude that part, but for some reason there were 2 values:

Thickness: 5.5mm

Maximum propeller thickness: 8.84mm

But I didn’t understand which was the real size of the propeller.

But after checking and googling I saw that the 8.84mm was the real one, and after seeing that you should use about 2x the height of the props for indoor use, I chose to use 16mm height. That is why I extruded that for that much.

Then I continued with calculating how tall the connector to the guard should be, because the guards also need arms. I decided to use a design like that:

![Figure 2](/journal/6140/02.webp)

For that I took the height of the props: 8.84, divided them by 2 because I want the center of the guards to be at the same height as the center of the props. Then I added the height of the motor and so I got my arm height size:

> 8.84mm / 2 + 11mm = 5.42

So I had to make the 2 arms 5.42 high but angled to the center. So I first started by making it.

So after that I drew the plate that should be screwed between the holder and the motor, so I drew the arm:

![Figure 3](/journal/6140/03.webp)

And after I extruded it and rounded it I did that process also 90° to the right:

![Figure 4](/journal/6140/04.webp)

![Figure 5](/journal/6140/05.webp)

And lastly I added the plate between the arm and the motor.  
And after copying the upper 2mm of the motor holder it looked like that:

![Figure 6](/journal/6140/06.webp)

And lastly rounded it.

After that I deleted the upper 2mm of the motor holder:

![Figure 7](/journal/6140/07.webp)

But then I remembered that I forgot to add the hole for the cable tunnel.

But before fixing that I implemented everything into the all-together file to check if everything was fine.  
After adding the first one I mirrored the 2nd and then the 3rd and 4th, and after that it looked like this:

![Figure 8](/journal/6140/08.webp)

But I still had the problem that the cable channel was blocked:

![Figure 9](/journal/6140/09.webp)

SO I quickly edited a hole into that.

And after drawing the cable channel part:

![Figure 10](/journal/6140/10.webp)

I quickly extruded it in cut mode and rounded the corners:

![Figure 11](/journal/6140/11.webp)

Lastly on the arms I wanted to round these corners because it looked very unprofessional:

![Figure 12](/journal/6140/12.webp)

And after rounding it looked like that:

![Figure 13](/journal/6140/13.webp)

So after all it looked like that:

![Figure 14](/journal/6140/14.webp)

Then I noticed that I had unnecessarily much weight on the drone because these parts of the guards were unnecessary:

![Figure 15](/journal/6140/15.webp)

So I decided to remove them and rounded the corners, and then it looked like that:

![Figure 16](/journal/6140/16.webp)

But I quickly realized that it wouldn’t fit if I implemented that like that because the guard would go into the walls of the drone:

![Figure 17](/journal/6140/17.webp)

So I decided to remove an additional 22.5° so that no problems appear:

![Figure 18](/journal/6140/18.webp)

And after saving and updating the inserted items it looked like that and was perfect!!!

![Figure 19](/journal/6140/19.webp)

But while I was correcting and rereading my journal I saw that I calculated that  
8.84mm / 2 + 11mm = 5.42  
and that is completely wrong.

So after checking the height I took in my sketch, it was 7.5mm for some reason, so I had to add 8mm to it.  
So I split the bodies and added the 8mm so that it was correct again, and after rounding, saving, and updating the CAD it looked like that:

![Figure 20](/journal/6140/20.webp)

After I was basically finished with the CAD (for the drone), I wanted to see how much it weighed.  
So I put the whole drone into the slicer (without supports) and it weighed about 170g, which is actually good and about what I planned!

The only things that are missing in the drone are the holders for the PCB and the holes for the pogo pins, but I’ll do them while building the landing station (next journal).

Overall happy that I finally (almost) finished the CAD of the drone. Excited!!
