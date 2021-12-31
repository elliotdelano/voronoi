const canvas = document.getElementById('canvas');

const app = new PIXI.Application({
    view: canvas,
    width: canvas.width,
    height: window.innerHeight,
    autoDensity: true,
    antialias: true
});

const { stage, view, ticker, renderer } = app;

document.body.appendChild(view);

let _w = canvas.width;
let _h = window.innerHeight;

window.addEventListener('resize', resize);
function resize() {
    _w = canvas.width;
    _h = window.innerHeight;

    //draw();

    renderer.resize(_w, _h);
}

var mouseX;
var mouseY;

var pointCount = 40;
var points = [];
getNewRandomPoints(pointCount - 1);

window.addEventListener('mousemove', function (e) {
    mouseX = e.offsetX;
    mouseY = e.offsetY;
    points[pointCount] = [mouseX, mouseY];
});

let camera = new PIXI.Container();
stage.addChild(camera);
stage.interactive = true;



var pixels = new Set();

var lines = new Set();

var QUALITY = document.getElementById("qual").value;

function generatePixelSet() {
    pixels = new Set();
    for (var i = 0; i < _w / QUALITY; i++) {
        for (var j = 0; j < _h / QUALITY; j++) {
            pixels.add([i, j]);
        }
    }
}

function draw() {

    var img = new PIXI.Graphics();
    var line = new PIXI.Graphics();
    var rect = new PIXI.Graphics();
    img.clear();
    line.clear();

    var drawnPointsCount = 0;

    var lastPoint = points[0];

    // for (let point of points) {
    //     img.beginFill(point[2]);
    //     img.lineStyle(3, 0x000000);
    //     img.drawCircle(point[0], point[1], 10);
    //     img.endFill();
    //     drawnPointsCount++;
    //     lastPoint = point;
    // }
    console.dir(pixels);
    for (let rec of pixels) {

        rect.beginFill(compareAllPositions(rec[0], rec[1])[2]);
        //console.log("Drawing Rectangle");
        rect.drawRect(rec[0] * QUALITY, rec[1] * QUALITY, QUALITY, QUALITY);
        rect.endFill();
    }

    rect.interactive = true;
    rect.on('mousedown', function (e) {
        console.log(e);
        points.add(generateSetPoint(e.data.global.x, e.data.global.y));
    })
    camera.addChild(line);
    camera.addChild(rect);
    camera.addChild(img);
    //
}

$(function () {
    $('#go').click(render);
});

$(function () {
    $('#clear').click(clear);
});

function clear() {
    points = [];
    QUALITY = document.getElementById("qual").value;
    draw();
}

function render() {

    var count = document.getElementById("count").value;
    QUALITY = document.getElementById("qual").value;
    console.log("Rendering " + count + "points");
    clear()
    generatePixelSet();
    getNewRandomPoints(count);
    draw();
}

function compareAllPositions(x, y) {
    var metric = document.getElementById("distanceMath").value;
    var closest = [20000, 20000];
    for (let point of points) {
        if (Metric(point[0] - x * QUALITY, point[1] - y * QUALITY, metric) < Metric(closest[0] - x * QUALITY, closest[1] - y * QUALITY, metric)) {
            //console.log("New Closest Point: " + JSON.stringify(point));
            closest = point;
        }
    }
    return closest;
}

function Metric(x, y, mt) {
    if (mt == 1) { return Math.hypot(x, y) }
    if (mt == 2) { return Math.abs(x) + Math.abs(y) }
    if (mt == 3) { return (Math.pow(Math.pow(Math.abs(x), 3) + Math.pow(Math.abs(y), 3), 0.33333)) }
}


//var currentPoints = 0;

function update() {
    //if(currentPoints != points.size) {
    //    draw();
    //    currentPoints = points.size;
    //    
    //}

    requestAnimationFrame(update);
}

update();

function getNewRandomPoints(count) {
    for (var i = 0; i < count; i++) {
        points.push(generateRandomPoint([0, renderer.width], [0, renderer.height]));
    }
}

function generateSetPoint(x, y) {
    return [x, y, randomHexColor()];
}

function generateRandomPoint(boundX, boundY) {
    return [getRandomInt(boundX[0], boundX[1]), getRandomInt(boundY[0], boundX[1]), randomHexColor()];
}

function randomHexColor() {
    return "0x" +
        ("00" + getRandomInt(0, 256).toString(16)).slice(-2) +
        ("00" + getRandomInt(0, 256).toString(16)).slice(-2) +
        ("00" + getRandomInt(0, 256).toString(16)).slice(-2);
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min);
}