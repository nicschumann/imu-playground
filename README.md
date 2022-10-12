# RPi IMU Server

Demos a little client/server system for Raspberry Pi equipped with a [BNO055](https://www.adafruit.com/product/2472) IMU breakout board connect over I2C. This repo provides:

- **IMU Server**. A python program to run on your Raspberry Pi. It runs to processes, a `uvicorn` wsgi server, and a polling process that reads IMU values off of the Pi's I2C bus and puts them in a Queue for the frontend. By default, it will expose this server to the local network the Pi is connected to on port `5000`. Depends on `FastAPI`, `uvicorn`, and a few different adafruit GPIO, I2C, and IMU drivers. See source in `server/main.py` for details.

- **IMU Client**. A Javascript program to run on your laptop. It opens an HTML page that polls the local network for a raspberry pi running the server mentioned above on port `5000` (by default, it polls `http://raspberrypi.local:5000/imu`, which is the default hostname for a Pi on your local network). It then prints out the X, Y, and Z euler angles from the IMU, and uses them to color a `<div>`.

This was thrown together for a as a quick demo of getting sensor data from a Raspberry Pi across a local network, and doing something somewhat visual with it in a browser. 

*Exercise 1*. A good software exercise would be to adapt the client code to render a cube in the browser with orientation determined by the Euler angles or quaternion from the IMU.

*Exercise 2*. A good hardware exercise would be to adapt the server code to use SPI rather than I2C for communication with the IMU. This IMU is known to experience clock stretching on the I2C bus with Raspberry Pi, which causes sensor calibration issues. SPI apparently doesn't have this issues.