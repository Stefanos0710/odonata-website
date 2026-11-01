---
title: "Finishing the drone code and starting with the server!"
date: 2026-05-28T08:20:54Z
minutes: 293
phase: firmware
cover: /journal/9861/01.webp
falloutId: 9861
recordings:
  - https://lookout.hackclub.com/api/media/bff8c5a2-1af6-42c6-a57f-a04d9bafd6cd/video.mp4
---

And after yesterday, after mostly finishing the battery status, I had to make it also threaded, because it should run in the background. So I firstly created a class named `Battery`, then I added all the defined parameters and variables with `self`, and then added the function `battery_status` with a `while self.running` loop like all the others before. Then I also made a current battery status variable, so that in `get_battery_percentage` you just return this one. I also made that the battery percentage only updates every 2 seconds because it is not that important to get information like 10 times per second.

Then I also made a function to start the thread and to stop it, and after the battery code was finished I wanted to write the description of the scripts in the firmware README and explain how it works etc. But for that I first wanted to read the submission docs for the design submit, so that I include everything. But after starting the README I thought that it would be smarter to make it after I am finished with also the main and the server.

So I continued by making in `Motor` the function so that the drone, after it took off, can move around like to the front, left, right etc.

I made 4 (3 real) parameters:

```python
def move_drone(master, direction="front", speed=0.5, distance=1.0):
    """
    :param direction: the direction in which the drone should move, can be "front", "back", "left" or "right"
    :param speed: the speed at which the drone should move in m/s
    :param distance: the distance the drone should move in meters
    """
```

and applied this style with the commands and params to all functions in this file and then also to the others.

After that, like in the takeoff function, I set the mode to no GPS so that it can be controlled manually. Then I coded that it checks whether the direction is front, back, left or right and sets the velocity x and y firstly for all to `0.0`, but then to the corresponding speed that was defined before and also the corresponding sensor is given.

Only if the user tells the drone to go back it returns, because the drone doesn’t have a sensor on the back. It gives a message and warning that the drone firstly has to yaw to make it.

But because the sensor can only measure for about 2 to 3 meters I had to implement an alternative way to measure where and when to stop the drone. Then I had the idea that I can predict the time that the drone takes and then make a timer. I calculate it simply by dividing the distance by the speed and then I get the predicted time and start the timer.

Then I make a `while True` loop for the real movement. Now I measure the elapsed time and the current distance. Then I check if the distance is reached, but if the sensor is not measuring correctly and gives output error codes like `8190`, `8191` or `0`, it checks the time and if it’s reached it breaks the loop. And if the current distance is equal or bigger than the distance it also breaks.

Then I added the local target for the drone and added that only horizontal velocity is possible and added `vx` and `vy`. After waiting per loop 100ms to ensure 10Hz, after the while loop it checks if it’s too close so that it goes a bit back so that it doesn’t collide with that, and after that it changes into altitude hold mode.

```python
def move_drone(master, direction="front", speed=0.5, distance=1.0, stopping_distance=0.5):
    """
    :param direction: the direction in which the drone should move, can be "front", "back", "left" or "right"
    :param speed: the speed at which the drone should move in m/s
    :param distance: the distance the drone should move in meters
    :param tof_sensors: the list of the tof sensors, which are used to measure the distance to the obstacles in the corresponding direction, and they are in the order of the channels (0, 1, 2, 3)
    :param stopping_distance: the distance at which the drone should stop in meters
    """

    # initialize the velocity values for the x and y direction
    vy, vx = 0.0, 0.0

    # activate the no_gps mode, to be able to control the drone without gps
    master.set_mode('GUIDED_NOGPS')
    time.sleep(1) # wait a bit to ensure the mode is changed

    if direction == "front":
        vy = speed
        sensor_index = 1
    elif direction == "back":
        vy = -speed
        sensor_index = None # we don't have a sensor facing backwards, so we can't measure the distance to obstacles in that direction, the drone has to yaw firstly and then it will move
        return
    elif direction == "left":
        vx = -speed
        sensor_index = 3
    elif direction == "right":
        vx = speed
        sensor_index = 0
    else:
        print("Invalid direction, please choose from 'front', 'back', 'left' or 'right'")
        return

    # calculate the time needed to move to the target distance with the given speed and time
    time_needed = distance / speed

    # start the timer to control the movement for the calculated time
    start_time = time.time()

    # here happens the real movement logic
    while True:
        elapsed_time = time.time() - start_time
        current_distance = tof_sensor.get_distances()[sensor_index]

        # if the sensor sends an error value, because the distance is too far, we rely on the time to control the movement
        if current_distance == 8190 or current_distance == 8191 or current_distance == 0:
            print("Distance measurement error, moving for the calculated time")

            # if the elapsed time is greater than or equal to the calculated time, we can stop the movement
            if elapsed_time >= time_needed:
                print(f"Reached target distance of {distance} meters")
                break

        # if the sensor sends valid distances, we use the distance control
        else:
            # if the current distance is less than or equal to the stopping distance, we stop the movement to avoid collision
            if current_distance <= distance*1000 or current_distance <= stopping_distance*1000:
                print(f"Reached stopping distance of {stopping_distance} meters, stopping to avoid collision")
                break

        # here happens the movement command
        master.mav.set_position_target_local_ned_send(
            0,
            master.target_system, master.target_component,
            mavutil.mavlink.MAV_FRAME_LOCAL_NED,
            0b0000111111000111,
            0, 0, 0,
            vx if 'vx' in locals() else 0, vy if 'vy' in locals() else 0, 0,
            0, 0, 0,
            0, 0
        )

        time.sleep(0.1)

    # if the drone is too close to an object, move backwards for a half second
    if current_distance <= stopping_distance*1000:
        print("Too close to an object, moving backwards for 0.5 seconds to avoid collision")
        master.mav.set_position_target_local_ned_send(
            0,
            master.target_system, master.target_component,
            mavutil.mavlink.MAV_FRAME_LOCAL_NED,
            0b0000111111000111,
            0, 0, 0,
            -vx if 'vx' in locals() else 0, -vy if 'vy' in locals() else 0, 0,
            0, 0, 0,
            0, 0
        )
        time.sleep(0.5)

    # now the drone has to hover in that position
    print("Entering hover mode")
    master.set_mode('ALT_HOLD')
    time.sleep(1)
```

Next, I continued with the yaw drone function. As input you put in the angle and the duration. From that I had to calculate the radians because MAVLink doesn’t take the angle directly. Then after using the `0b010111100111` mask, which only activates the yaw, I gave as input the yaw rate and lastly switched back into altitude hold mode.

```python
def yaw_drone(master, yaw_rate=90, duration=2):
    """
    Yaw the drone in a specific direction with a specific yaw rate for a specific time.

    :param yaw_rate: positive values for right and negative values for left in degrees
    :param duration: the time for which to yaw the drone in seconds
    """

    # activate the no_gps mode, to be able to control the drone without gps
    master.set_mode('GUIDED_NOGPS')
    time.sleep(1)

    # calculate the yaw rate in radians per second
    yaw_rate_rad_s = yaw_rate * (math.pi / 180)

    start_time = time.time()

    # here happens the real yawing logic
    while time.time() - start_time < duration:
        master.mav.set_position_target_local_ned_send(
            0,
            master.target_system, master.target_component,
            mavutil.mavlink.MAV_FRAME_LOCAL_NED,
            0b010111100111,
            0, 0, 0,
            0, 0, 0,
            0, 0, 0,
            0,
            yaw_rate_rad_s
        )
        time.sleep(0.1)

    print("Entering hover mode")
    master.set_mode('ALT_HOLD')
    time.sleep(1)
```

And lastly I wanted to make the `land_drone` function.

I firstly changed the guided mode to no GPS and made some basic settings.

Then I made the `while True` loop and created 3 phases. The first phase was for the yaw alignment and it works by making small moves and comparing it with the tolerance which is measured previously.

After trying out how much tolerance is possible I found out that 5 degrees are possible.

![Figure 1](/journal/9861/01.webp)

And if it was aligned then the next phase started. The second phase aligns the x/y coordinates by also making small moves and a total tolerance of 10 pixels.

Lastly it was the landing phase, phase 3. There it goes slowly down with `0.25m/s` and goes to `10cm` over the ground measured by the ToF sensor and then the drone goes into LAND mode, which basically lets the drone down, but when it touches the ground it stops and disarms

```python

def land_drone(master, landing_speed=0.25):
    """
    Land the drone by using the distance to the ground from the downward facing sensor and the distance to the april tag from the camera, which is also facing downwards, to control the landing process.

    :param landing_speed: the landing speed in m/s
    """  
    # changing to GUIDED_NOGPS mode, to be able to control the drone without gps
    master.set_mode('GUIDED_NOGPS')
    time.sleep(1) # wait a bit to ensure the mode is changed

    # convert the landing speed to negative, because the mavlink takes negative values for climbing up and positive values for climbing down
    landing_speed = abs(landing_speed)

    x_centre = 320 # 640/2, because the camera resolution is 640x480
    y_centre = 240 # 480/2, becasue the camera resolution is 640x480

    yaw_tolerance = 5/2 # in degrees
    pixel_tolerance = 20/2 # in pixel

    phase = 1 # phase 1: align yaw, phase 2: align x and y, phase 3: landing

    while True:
        data = cam.get_data()

        x_pixel, y_pixel, z_meter, yaw = data
        vx, vy, vz, yaw_rate = 0.0, 0.0, 0.0, 0.0

        if not data or len(data) != 4:
            print("Tag data not valid or tag not detected, hovering in current position!")
            
            # hover in the current position
            master.mav.set_position_target_local_ned_send(
                0, master.target_system, master.target_component,
                mavutil.mavlink.MAV_FRAME_LOCAL_NED,
                0b010111000111, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
            )

            time.sleep(0.1)
            continue

        if phase == 1:
            if not abs(yaw) < yaw_tolerance:
                yaw_rate = yaw * 0.1

                yaw_rad = math.radians(yaw_rate)
                yaw_rate = yaw_rad

                yaw_rate = max(-0.5, min(0.5, yaw_rate))

            else:
                print("Yaw aligned, switching to phase 2")
                phase = 2

        elif phase == 2:
            error_x = x_pixel - x_centre
            error_y = y_pixel - y_centre

            if abs(error_x) > pixel_tolerance:
                vy = (error_x / 320) * 0.3
                vy = max(-0.25, min(0.25, vy))

            if abs(error_y) > pixel_tolerance:
                vx = -(error_y / 240) * 0.3
                vx = max(-0.25, min(0.25, vx))

            if abs(error_x) <= pixel_tolerance and abs(error_y) <= pixel_tolerance:
                print("X and Y aligned, switching to phase 3")
                phase = 3

        elif phase == 3:
            vz = abs(landing_speed)

            ground_distance = tof_sensor.get_distances()[2] / 1000 # convert to meters

            if ground_distance <= 0.1:
                print("Landed successfully!")
                break
        
        # using mask 0b010111000111, to aktivate vx, vy, vz and yaw_rate control and deactivate all other controls
        master.mav.set_position_target_local_ned_send(
            0, master.target_system, master.target_component,
            mavutil.mavlink.MAV_FRAME_LOCAL_NED,
            0b010111000111, 
            0, 0, 0,        # position
            vx, vy, vz,     # velocity 
            0, 0, 0,        # acceleration
            0, yaw_rate     # yaw-rate, yaw
        )

        time.sleep(0.1) # for the next command after 100ms becasue we have to keep 10Hz control of the drone

    master.set_mode('LAND')
    time.sleep(1) # wait a bit to ensure the mode is changed

```

And next I wanted to combine everything in the main and program a small flight where the drone takes off, yaws, goes one meter to the drone, turns, yaws, centers and lands. And exactly that I did.

```python

def flight_loop():
    # start the drone and get the connection to the flight controller and arm
    master = turn_on_drone()
    motor.arm_drone(master)
    
    # take off to 1 meter altitude
    motor.takeoff_drone(master, target_altitude=1.0)

    # fly forward for 1 meter and then back
    for _ in range(2):
        # rotate the drone by 180 degrees
        motor.yaw_drone(master, yaw_rate=180, duration=2)

        # fly forward for 1 meter
        motor.move_drone(master, direction="front", speed=0.5, distance=1.0, stopping_distance=0.20)

    # land the drone
    motor.land_drone(master, landing_speed=0.25)

    # shutdown the drone and disconnect from the flight controller
    shutdown_drone(master)
```

Then in the `main.py` file I added the other things like move servo, get ToF distances, get battery status or test motors etc.

Next I had to make the server and the website to connect the server with the commands.

Firstly I created the `main.py` file where I added just the code to display an HTML file in the frontend folder, with just “Hello World” on it.

Firstly I wanted to use Flask because I know it very well, but it’s a bit slow, and FastAPI, which I have never used before, would be worth it, so I read a bit of the docs to get into it.

Then I built the basic HTML structure.

![Figure 2](/journal/9861/02.webp)

Because I want to finish the project tomorrow and don’t want to spend 10 hours on the design, I let Claude make a nice CSS look for my drone and after that I will do the frontend/backend connection myself. I used Antigravity because I anyway wanted to try it out.

After writing a prompt that basically said to make a CSS/JS minimalistic design for the HTML structure that I designed myself, it looked like that:

![Figure 3](/journal/9861/03.webp)

I pretty liked it, I just wanted that everything had to be visible without scrolling and there were some bugs, like the servo showed 90 degrees although it was at 0 degrees, but that should be fast to fix.

And after fixing that it looked like that:

![Figure 4](/journal/9861/04.webp)

And now I have to make the connection with the backend over an API. So I started by making the `server/main.py`. Therefore I wanted to make the direct API from the Raspberry Pi to the drone. So I made the direct connection to the Pi, but it got late and I’ll continue in the morning and hopefully finish the design tomorrow!
