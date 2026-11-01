---
title: "Designing the connection to the walls and designing them!!!"
date: 2026-05-02T08:45:23Z
minutes: 169
phase: cad
cover: /journal/5082/01.webp
falloutId: 5082
recordings:
  - https://lookout.hackclub.com/api/media/24cd763d-6736-4204-b814-cc2be1a67d77/video.mp4
  - https://lookout.hackclub.com/api/media/8c2a5f22-0b6b-4388-be14-7067c33dfd82/video.mp4
---

First, I inserted the sketch (using Insert Derive, a new feature that I learned) with the combination sketch from the platform and the walls. Then I projected the important parts (here only the connections) to a new sketch so that I can redesign them. I also learned the tool to project points, lines, and bodies, sooo cool!

And after doing that it looked like that:
![Figure 1](/journal/5082/01.webp)

Afterwards I added a tolerance on all sides (where I haven't already applied one) of 0.2 mm so that everything will fit perfectly:
![Figure 2](/journal/5082/02.webp)

For the beginning, I extruded them to the height of the connector, so 3.3 mm, but I will probably have to adjust that in the future (and I forgot to say I also added a tolerance of 0.05 mm):
![Figure 3](/journal/5082/03.webp)

Then I continued making the holes for the heat inserts:

1. I again projected the center points of the connectors to draw the circles  
2. Luckily I knew which diameter I should use for the heat insert holes: 3.3 mm, because I already did that for the arm holder heat insert holes, so I just copied that value  
3. Then I drew the circles with the projected points as centers  

![Figure 4](/journal/5082/04.webp)

Then I proceeded with extruding them:

I extruded them 3mm + 1mm in height because the insert has a height of 3mm and needs 1mm buffer for optimal grip (thanks Google). And added additionally 4mm for more strength! 

But during that, I encountered a problem: the extruded connectors were only 3.3 mm high, while the holes were 4 mm.

So it looked like that after extruding. The only problem was that I extruded the holders only to 3.3 mm and the holes to 4 mm. That’s why I had to go back to the beginning (T-T) and extrude them more so that they properly contain the holes:
![Figure 5](/journal/5082/05.webp)

But after repairing and redesigning everything, it looked like that:
![Figure 6](/journal/5082/06.webp)

After all this progress, I wanted to properly see how everything looks assembled, so I:

1. Created a new file called “All-together”  
2. Then I had to google how to combine or insert everything into one file, because I first thought you just copy the parts (completely wrong). I found out about the feature “Insert Derive” which lets you insert bodies, sketches, etc. into another file and it updates automatically if you change the original file  
3. Then I inserted the base file and the walls, which were perfectly aligned already, so I didn’t have to move them. But the arms were a pain: I had to move them manually and align them perfectly. Then, because I didn’t know about the mirror tool at first (which would have saved me sooo much time before T-T), I copied one arm again. After that I found the mirror tool and mirrored them along the Y-axis  
4. I also organized the bodies folder by creating two subfolders called “walls” and “arms” so I can work more cleanly  

Then after doing all that, I saw the drone fully assembled for the first time  and it was ABSOLUTELY FANTASTIC!!!

To continue, I inserted the sketch from the walls and projected it to a new sketch so that I can modify it independently from the other parts:
![Figure 7](/journal/5082/07.webp)

Then I redrew the walls and also extended them over the arm connectors so that there are no holes and everything is nicely connected:
![Figure 8](/journal/5082/08.webp)

After selecting all the wall parts, I extruded them to 8 mm as a new body, so I can later cut the bottom part because otherwise it would collide with the base:
![Figure 9](/journal/5082/09.webp)

The problem during cutting was that I couldn’t find a cutting tool, but I discovered that you can extrude and enable “cut mode” and that worked perfectly (cut for 3.3 + 0.1 mm tolerance):
![Figure 10](/journal/5082/10.webp)

After saving that file and updating the All-together file, it looked like that (almost perfect):
![Figure 11](/journal/5082/11.webp)

But there was a small detail that didn’t look nice and made the CAD unclean:
![Figure 12](/journal/5082/12.webp)

To remove this small wall cut , I went back to the sketch and drew the missing part by making a +0.2 mm outline. That fixed the problem, and after extruding it looked clean again:
![Figure 13](/journal/5082/13.webp)

I was almost finished, but there were a huge number of edges and corners, so I decided (for better look and better 3D printing) to round them all.

I mostly chose the rounding radius by feeling (look + space saving), and after doing that it looked like this:
![Figure 14](/journal/5082/14.webp)

A positive side effect of rounding was also that I gained more space for the PCB.

And lastly I updated the All-together file again, and now the drone looks like this (amazing, jippy!!):
![Figure 15](/journal/5082/15.webp)

VERY happy with the progress today, because I was really afraid of starting with the wall connections since I didn’t really know how to design them, but in the end I got this!!
