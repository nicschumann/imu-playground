import time
from multiprocessing import Process, Queue

import busio
import board
import digitalio
from adafruit_bno055 import BNO055_I2C


import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

QUEUE_MAX_SIZE=1

thread = None
app = FastAPI()
data = Queue(maxsize=QUEUE_MAX_SIZE)

i2c = busio.I2C(board.SCL, board.SDA)
sensor = BNO055_I2C(i2c)

def thread_main(thread_id):
    try:
        while True:
            x, y, z = sensor.euler
            if x is not None and y is not None and z is not None:
                timestamp = time.time()
                data.put(
                    {'t': timestamp, 'x': x, 'y': y, 'z': z}
                )

    except KeyboardInterrupt:
        return


app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def start_background_processes():
    global thread

    thread = Process(target=thread_main, args=(0,))
    thread.start()

@app.on_event("shutdown")
async def stop_background_processes():
    global thread

    if thread is not None:
        thread.terminate()



@app.get('/imu')
def get_imu_data():
    element = data.get()
    
    return element # "{'time': t, 'id': thread_id}"


if __name__ == '__main__':
    uvicorn.run('main:app', host="0.0.0.0", port=5000, log_level='info')
        
