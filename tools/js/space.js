const cvs = document.getElementById("mainCanvas");
cvs.width=window.innerWidth-10; cvs.height=window.innerHeight-10;
const ctx = cvs.getContext("2d");

var BODY_MOVING = null;
var MOUSE_MOVING = false;
var prev_mouse_move = 0;
var mx = 0;
var my = 0;
var prev_mx = 0;
var prev_my = 0;
const G = 10;
var delta = 0.0167; //60fps
var stepsPerDelta = 8;
const og_planet_vel = orbitVelocity(10000,Math.floor(window.innerWidth/2)+400,Math.floor(window.innerHeight/2));
const bodies = [
    {
        x:Math.floor(window.innerWidth/2),
        y:Math.floor(window.innerHeight/2),
        vx:0,
        vy:0,
        mass:10000,
        radius:200,
        colour:"#ffd166",
        luminosity: 25
    }
];

var seed;
const url = new URL(window.location.href);
if (url.searchParams.get("seed") != null) {
    seed = Number(url.searchParams.get("seed"));
}
else {
    seed = Math.floor(Math.random() *1e9);
    url.searchParams.set("seed",seed);
    window.history.replaceState({},"",url);
}




function mulberry32(a) { //from stackoverflow.com
  return function() {
    let t = a += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }
}

const rng = mulberry32(seed); //using this funct for seeded systems

function generateRandomHex() {
  return '#' + Math.floor(rng() * 16777215).toString(16).padStart(6, '0');
}

function generateColor(minBrightness = 128) {
  while (true) {
    const r = Math.floor(rng() * 256);
    const g = Math.floor(rng() * 256);
    const b = Math.floor(rng() * 256);
    const brightness = (0.2126 * r) + (0.7152 * g) + (0.0722 * b);

    if (brightness >= minBrightness) {
      return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
    }
  }
}

function randrange(min,max) {
    return Math.floor(rng()*(max-min)+min);
}


if (seed===1) {
    bodies.push({
        x:Math.floor(window.innerWidth/2)+400,
        y:Math.floor(window.innerHeight/2),
        vx:og_planet_vel.vx,
        vy:og_planet_vel.vy,
        mass:5,
        radius:20,
        colour:"#4cc9f0",
        luminosity: 0
    });
}
else {
    for (let i=0; i<randrange(4,9);i++) {
        createRandomNewBody(randrange(100,window.innerWidth-100),randrange(100,window.innerHeight-100));
    }
}

//orbitspd: v=sqrt(GM/r)
function orbitVelocity(M,x1,y1,x2=Math.floor(window.innerWidth/2),y2=Math.floor(window.innerHeight/2)) {
    
    const dx = (x1-x2);
    const dy = (y1-y2);
    const dist = Math.hypot(dx,dy)
    const v = Math.sqrt(G*M/dist);
    const unitX = dx/dist;
    const unitY = dy/dist;
    const vx = -unitY*v;
    const vy = unitX*v;
    return {
        vx:vx,
        vy:vy
    };
}


function handleCollision(a,b) {
    if (bodies.indexOf(a) === 0) {
        bodies.splice(bodies.indexOf(b),1);
        a.vx/=2;
        a.vy/=2;
    }
    else if (bodies.indexOf(b) === 0) {
        bodies.splice(bodies.indexOf(a),1);
        b.vx/=2;
        b.vy/=2;
    }
}


function updateBodyVelocity(bodies,dt) {
    bodies.forEach(a => {
        bodies.forEach(b => {
            if (a!=b) {
                const dx = b.x-a.x;
                const dy = b.y-a.y;
                const dist = Math.hypot(dx,dy);
                if(dist<=a.radius+b.radius) handleCollision(a,b);

                const acceleration = (G*b.mass)/(dist**2);

                a.vx += (dx/dist)*acceleration*dt;
                a.vy += (dy/dist)*acceleration*dt;

            }
        });
    });
    if (BODY_MOVING) {

        BODY_MOVING.vx = (mx-BODY_MOVING.x)/2;
        BODY_MOVING.vy = (my-BODY_MOVING.y)/2;
    }
}
function drawCircle(x,y,rad,fill) {
    ctx.beginPath();
    ctx.arc(x,y, rad, 0, 2*Math.PI);
    ctx.fillStyle=fill;
    ctx.fill();
    ctx.strokeStyle=fill;
    ctx.stroke();
}
function EmitLight(body) {
    drawCircle(body.x, body.y, body.radius+body.luminosity*2.5,body.colour+"40");
    drawCircle(body.x, body.y, body.radius+body.luminosity*2,body.colour+"60");
    drawCircle(body.x, body.y, body.radius+body.luminosity*1.5,body.colour+"7a");
    drawCircle(body.x, body.y, body.radius+body.luminosity,body.colour+"85");
}
function drawAll(bodies) {
    bodies.forEach(body => {
        
        drawCircle(body.x,body.y,body.radius,body.colour)
        if (body.luminosity>0) EmitLight(body);
    });
}

window.addEventListener("resize", ()=> {
    var nx = cvs.width/2; var ny = cvs.height/2;
    cvs.width=window.innerWidth-10; cvs.height=window.innerHeight-10;
    const dx = cvs.width/2 - nx;
    const dy = cvs.height/2 - ny;
    bodies.forEach(body => {
        body.x += dx;
        body.y +=dy;
    });
});

window.addEventListener("mouseup", ()=>{
    BODY_MOVING=null;
});

window.addEventListener("mousedown", (event)=> {
    
    if (!BODY_MOVING) {
    bodies.forEach(body => {
        if ((body.x - mx)**2 + (body.y - my)**2 <= body.radius**2) {
            BODY_MOVING=body;
            BODY_MOVING.vx/=2;
            BODY_MOVING.vy/=2;    
            return;
        }
    });
    }
});

window.addEventListener("auxclick", (event)=> {
    if (event.button===1) {
        createRandomNewBody(event.clientX,event.clientY);
    }
});

window.addEventListener("mousemove", (event)=>  {
    prev_mx = mx;
    prev_my = my;
    mx = event.clientX;
    my = event.clientY;
    
    prev_mouse_move = performance.now();
    
});

window.addEventListener("keydown", (event)=> {
    
    if (event.key === "ArrowRight") {
        
        stepsPerDelta+=2;
    }
    else if (event.key === "ArrowLeft") {
        stepsPerDelta-=2;
    }
});





function createRandomNewBody(x,y) {
    let radius;
    let lumens = 0;
    const mass = randrange(1,20);
    const orbitData = orbitVelocity(bodies[0].mass,x,y);
    if (mass > 100) {
        radius = Math.floor(mass**(3));
    }
    else if (mass > 25) {
        radius=Math.ceil(mass**(2));
    }
    else {
        radius=Math.ceil(mass**(1.5));
    }
    radius=Math.ceil(radius/4);
    
    if (mass > 200 && (randrange(0,10)>5)) lumens=randrange(5,12);
    bodies.push({
        x:x,
        y:y,
        vx:orbitData.vx,
        vy:orbitData.vy,
        mass:mass,
        radius:radius,
        colour:generateColor(),
        luminosity: lumens
    });
}

function physicsStep(bodies,dt) {
    updateBodyVelocity(bodies,dt);
    bodies.forEach(body => {
        body.x+=body.vx*dt;
        body.y+=body.vy*dt;
    });
}

let prev = performance.now();
function update() {
    
    ctx.clearRect(0,0,cvs.width,cvs.height);
    const now = performance.now();
    delta = (now-prev)/1000;
    prev=now;
    for(let i=0; i<stepsPerDelta;i++) {
        physicsStep(bodies,delta/stepsPerDelta);
    }
    
    drawAll(bodies);
    
    requestAnimationFrame(update);
}
update();

