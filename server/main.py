import time
from multiprocessing import Process, Queue
from queue import LifoQueue
# import busio
# import board
# import digitalio
# from adafruit_bno055 import BNO055_I2C


import uvicorn
from fastapi import FastAPI

QUEUE_MAX_SIZE=1

thread = None
app = FastAPI()
data = Queue(maxsize=QUEUE_MAX_SIZE)


def thread_main(thread_id):
    try:
        while True:
            t = time.time()
            data.put({'time': t, 'id': thread_id})

    except KeyboardInterrupt:
        return

@app.on_event("startup")
async def start_background_processes():
    global thread

    thread = Process(target=thread_main, args=(0,))
    thread.start()

@app.on_event("shutdown")
async def start_background_processes():
    global thread

    if thread is not None:
        thread.terminate()


@app.on_event("shutdown")
async def stop_background_processes():
    global thread
    thread.terminate()


@app.get('/imu')
def get_imu_data():
    element = data.get()
    return element


if __name__ == '__main__':
    uvicorn.run('main:app', host="0.0.0.0", port=5000, log_level='info')
        
