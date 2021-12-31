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
getNewRandomPoints(pointCount-1);

window.addEventListener('mousemove', function(e) {
    mouseX = e.offsetX;
    mouseY = e.offsetY;
    points[pointCount] = [mouseX, mouseY];
});

let camera = new PIXI.Container();
stage.addChild(camera);
stage.interactive = true;



//var pixels = new Set();

//var lines = new Set();

//var QUALITY = document.getElementById("qual").value;

//function generatePixelSet() { 
//    pixels = new Set();
//    for(var i = 0; i < _w/QUALITY; i++) { 
//        for(var j = 0; j < _h/QUALITY; j++) { 
//            pixels.add([i, j]); 
//        } 
//    } 
//}

//function draw() {
//    
//    var img = new PIXI.Graphics();
//    var line = new PIXI.Graphics();
//    var rect = new PIXI.Graphics();
//    img.clear();
//    line.clear();
//
//    var drawnPointsCount = 0;
//
//    var lastPoint = [points][0];
//    
//    for(let point of points) {
//        img.beginFill(point[2]);
//        img.lineStyle(3, 0x000000);
//        img.drawCircle(point[0], point[1], 10);
//        img.endFill();
//        drawnPointsCount++;
//        lastPoint = point;
//    }
//    console.dir(pixels);
//    for(let rec of pixels) {
//        
//        rect.beginFill(compareAllPositions(rec[0], rec[1])[2]);
//        //console.log("Drawing Rectangle");
//        rect.drawRect(rec[0]*QUALITY, rec[1]*QUALITY, QUALITY, QUALITY);
//        rect.endFill();
//    }
//
//    rect.interactive = true;
//    rect.on('mousedown', function(e) {
//        console.log(e);
//        points.add(generateSetPoint(e.data.global.x, e.data.global.y));
//    })
//    camera.addChild(line);
//    camera.addChild(rect);
//    camera.addChild(img);
//    //
//}

//$(function() {
//    $('#go').click(render);
//});
//
//$(function() {
//    $('#clear').click(clear);
//});

function clear() {
    points = new Set();
    QUALITY = document.getElementById("qual").value;
    draw();
}

function render() {
    
    var count = document.getElementById("count").value;
    QUALITY = document.getElementById("qual").value;
    console.log("Rendering " + count + "points");
    generatePixelSet();
    getNewRandomPoints(count);
    draw();
}

function compareAllPositions(x, y) {
    var metric = document.getElementById("distanceMath").value;
    var closest = [20000,20000];
    for(let point of points) {
        if(Metric(point[0] - x*QUALITY, point[1] - y*QUALITY, metric) < Metric(closest[0] - x*QUALITY, closest[1] - y*QUALITY, metric)) {
            //console.log("New Closest Point: " + JSON.stringify(point));
            closest = point;
        }
    }
    return closest;
}

function Metric(x,y,mt) {
    if(mt==1) {return Math.hypot(x,y)}
    if(mt==2) {return Math.abs(x) + Math.abs(y)}
    if(mt==3) {return(Math.pow(Math.pow(Math.abs(x),3) + Math.pow(Math.abs(y),3),0.33333))}
    if(mt==4) {return x+y } 
}

const frag = `
    uniform vec2 u_mouse;
    uniform int u_count;
    uniform vec2 u_dim;
    uniform int u_metric;

    uniform vec2 points[40];

    varying vec2 vTextureCoord;

    

    const int NUMBER = 100;

    float rand(vec2 co){
        return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
    }

    float metric(vec2 p1, vec2 p2, int m) {
        float pd1 = p2.x - p1.x;
        float pd2 = p2.y - p1.y;
        if(m==1) {
            return distance(pd1, pd2);
        }
        if(m==2) {
            
        }
        if(m==3) {
            
        }
    }

    float map(float value, float min1, float max1, float min2, float max2) {
        return min2 + (value - min1) * (max2 - min2) / (max1 - min1);
    }

    vec2 voronoi(vec2 p) {
        vec2 closest = vec2(100.,100.);
        int max = u_count + 1;
        for(int i = 0; i < NUMBER; ++i) {
            //vec2(map(points[i].x, u_dim.x, u_dim.y, 0., 1.))
            if(i >= max) { break; }
            if(metric(p, points[i], u_metric) < metric(p, closest, u_metric)) {
                closest = points[i];
            }
        }
        return closest;
    }

    void main() {
        //points[u_count+1] = u_mouse;

        vec2 c = voronoi(vTextureCoord.xy);

        gl_FragColor = vec4(vec3(c.x , c.y, 1.0), 1.0);
    }
`;

var img = new PIXI.Sprite();
img.width = renderer.width;
img.height = renderer.height;
img.blendMode = PIXI.BLEND_MODES.ADD;
camera.addChild(img);

var uni = {
    u_mouse: { x: mouseX, y: mouseY, },
    u_count: pointCount,
    u_dim: { x:img.width, y:img.height },
    u_metric: 1,
    u_points: {
        type: '2fv',
        value: points
    }
}

var shader = new PIXI.Filter('', frag, uni);
img.filters = [shader];


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
    for(var i = 0; i < count; i++) {
        points.push(generateRandomPoint([0,renderer.width], [0,renderer.height]));
    }
}

function generateSetPoint(x, y) {
    return [x,y,randomHexColor()];
}

function generateRandomPoint(boundX, boundY) {
    return [getRandomInt(boundX[0], boundX[1]), getRandomInt(boundY[0], boundX[1])];
}

function randomHexColor() {
    return "0x"+
    ("00"+getRandomInt(0,256).toString(16)).slice(-2)+
    ("00"+getRandomInt(0,256).toString(16)).slice(-2)+
    ("00"+getRandomInt(0,256).toString(16)).slice(-2);
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min);
}