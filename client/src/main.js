require('./style/main.css');

const DELAY = 50;
const MOVING_AVERAGE_LENGTH = 10;
const FIXED_PRECISION = 3;
let debug_element = document.getElementById('rpi-debug-output');

const elements = {
    x: {
        average: document.getElementById('x-average'),
        value: document.getElementById('x-value'),
    },
    y: {
        average: document.getElementById('y-average'),
        value: document.getElementById('y-value'),
    },
    z: {
        average: document.getElementById('z-average'),
        value: document.getElementById('z-value'),
    }
}

let averages = {
    x: [],
    y: [],
    z: []
};

const check_range = (value, low, high) => value >= low && value <= high;

const moving_average = ( data ) => {
    if (data.length <= 0) { return 0; }
    return data.reduce((a, b) => a + b, 0) / data.length;
}

const calculate_color = (data) => {
    let r = (data.x[0] / 360) * 255.0;
    let g = ((data.y[0] / 180) + 1) * 127.0;
    let b = ((data.z[0] / 180) + 1) * 127.0;

    return `rgb(${r}, ${g}, ${b})`;
}

setInterval(() => {
    fetch('http://raspberrypi.local:5000/imu')
        .then(async response => {            
            let data = await response.json();

            

            // add new data
            if ( check_range(data.x, 0, 360) ) { averages.x.push( data.x ); }
            if ( check_range(data.y, -180, 180) ) { averages.y.push( data.y ); }
            if ( check_range(data.z, -180, 180) ) { averages.z.push( data.z ); }

            // remove 
            if ( averages.x.length > MOVING_AVERAGE_LENGTH ) { averages.x.shift(); }
            if ( averages.y.length > MOVING_AVERAGE_LENGTH ) { averages.y.shift(); }
            if ( averages.z.length > MOVING_AVERAGE_LENGTH ) { averages.z.shift(); }

            // update instantaneous values
            elements.x.value.innerText = data.x.toFixed(FIXED_PRECISION);
            elements.y.value.innerText = data.y.toFixed(FIXED_PRECISION);
            elements.z.value.innerText = data.z.toFixed(FIXED_PRECISION);

            // calculate moving average windows.
            elements.x.average.innerText = moving_average(averages.x).toFixed(FIXED_PRECISION);
            elements.y.average.innerText = moving_average(averages.y).toFixed(FIXED_PRECISION);
            elements.z.average.innerText = moving_average(averages.z).toFixed(FIXED_PRECISION);

            let color = calculate_color(averages);
            debug_element.style.backgroundColor = color;

        })
}, DELAY);