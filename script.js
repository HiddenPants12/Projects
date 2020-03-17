var G = 6.67 * Math.pow(10, -3)
const earthR = 6378 * 1000000 / 3.7759276;
const earthM = 5.972 * Math.pow(10, 24);
const earthIMG = 225;
const moonR = 1737.1 * 1000000 / 3.7759276;
const moonM = 7.34767309 * Math.pow(10, 22);
const sunR = 695700 * 1000000 / 3.7759276;
const sunM = 1988500 * Math.pow(10, 24);
const mercuryR = 2439.7 * 1000000 / 3.7759276;
const mercuryM = 3.3011 * Math.pow(10, 23);
const venusR = 6051.8 * 1000000 / 3.7759276;
const venusM = 4.867 * Math.pow(10, 24);
const marsR = 3376.2 * 1000000 / 3.7759276;
const marsM = 6.39 * Math.pow(10, 23);
const jupiterR = 66854 * 1000000 / 3.7759276;
const jupiterM = 1898.19 * Math.pow(10, 24)
const saturnR = 58232 * 1000000 / 3.7759276;
const saturnM = 568.34 * Math.pow(10, 24)
var touchedBody = {};
let freezeTime = false;
let globalTextures = {
  earth: 'https://www.pngarts.com/files/3/Planet-Earth-Transparent-Background-PNG.png',
  moon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ee/Weather_icon_-_full_moon.svg/512px-Weather_icon_-_full_moon.svg.png',
  sun: 'https://i.ya-webdesign.com/images/nasa-png-of-sun-1.png',
  mercury: 'https://i0.wp.com/freepngimages.com/wp-content/uploads/2016/05/planet-mercury-transparent-background.png?fit=680%2C680',
  venus: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/Venus_globe_-_transparent_background.png/600px-Venus_globe_-_transparent_background.png',
  mars: 'https://upload.wikimedia.org/wikipedia/commons/2/27/Mars_transparent.png',
  jupiter: 'https://upload.wikimedia.org/wikipedia/commons/e/e1/Jupiter_%28transparent%29.png',
  saturn: 'http://assets.stickpng.com/thumbs/580b585b2edbce24c47b270d.png'
}

// install plugin
Matter.use(
  'matter-wrap', // not required, just for demo
  'matter-attractors' // PLUGIN_NAME
);

let wireframestrue = false;

let angleShowVar = false;

function addRadius(r1, r2) {
  return Math.pow(Math.pow(r1, 3) + Math.pow(r2, 3), 1 / 3);
}

//handle wireframes from settings
function wireframesChange() {
  if (wireframestrue) {
    wireframestrue = false
  } else {
    wireframestrue = true
  }
}

function pickRandom(max, min) {
  return Math.floor(Math.random() * max + min) - min
}

let particles = []

function angleShow() {
  if (angleShowVar) {
    angleShowVar = false
  } else {
    angleShowVar = true
  }
}

function gamemodeMenu() {
  hideAll();
  document.getElementById("gamemodeMenu").style.display = "block";
}

function hideAll() {
  document.getElementById("menu").style.display = "none";
  document.getElementById("gamemodeMenu").style.display = "none";
  document.getElementById("settingsMenu").style.display = "none";
}

function settingsMenu() {
  hideAll();
  engine.positionIterations = document.getElementById("positionIterations").value
  document.getElementById("settingsMenu").style.display = "block";
}

function getVolume(body) {
  return 4 / 3 * Math.PI * Math.pow(body.circleRadius, 3);
}

function getRatio(bodyA, bodyB) {
  let volumeA = getVolume(bodyA);
  let volumeB = getVolume(bodyB);
  return Math.max(volumeA, volumeB) / Math.min(volumeA, volumeB);
}

let mouseDown = false;

var gameScale = 1000000000000000000000000000

var Engine = Matter.Engine,
  Render = Matter.Render,
  Runner = Matter.Runner,
  Body = Matter.Body,
  Common = Matter.Common,
  MouseConstraint = Matter.MouseConstraint,
  Mouse = Matter.Mouse,
  World = Matter.World,
  Bodies = Matter.Bodies,
  Bounds = Matter.Bounds,
  Events = Matter.Events,
  Composite = Matter.Composite,
  Vertices = Matter.Vertices,
  Axes = Matter.Axes,
  Vector = Matter.Vectors;

// create engine
var engine = Engine.create();

world = engine.world;

var slider2 = document.getElementById("myRange");
var TimeValue = slider2.value;

function FgCalc(bodyA, bodyB) {
  var bToA1 = Matter.Vector.sub(bodyB.position, bodyA.position),
    distanceSq1 = Matter.Vector.magnitudeSquared(bToA1) || 0.0001,
    normal1 = Matter.Vector.normalise(bToA1),
    magnitude1 = -MatterAttractors.Attractors.gravityConstant * (bodyA.mass * bodyB.mass / distanceSq1),
    force1 = Matter.Vector.mult(normal1, magnitude1);

  // console.log(Matter.Vector.neg(force1))
  return force1;
}

function getAllFG() {
  let list = [];
  let list2 = [];
  let tl = 0;
  let FG;
  for (let i = 0; i < particles.length; i++) {
    tl = i;
    for (let i = 0; i < particles.length; i++) {
      if ((particles[i] != particles[tl])) {
        FG = FgCalc(particles[tl], particles[i]);
        list2.push(`${particles[i].label}: [x: ${(FG.x).toFixed(4)} y: ${(FG.y).toFixed(4)}]`)
      }
    }
    list.push(`${particles[i].label}: [${list2}]`)
    list2 = [];
  }
  return list;
}

// create renderer
var render = Render.create({
  element: document.body,
  engine: engine,
  options: {
    width: Math.min(document.documentElement.clientWidth, 5000),
    height: Math.min((document.documentElement.clientHeight), 5000),
    wireframes: wireframestrue,
    showDebug: false,
    showBroadphase: false,
    showBounds: false,
    showVelocity: false,
    showCollisions: false,
    showSeparations: false,
    showAxes: false,
    showPositions: false,
    showAngleIndicator: angleShowVar
  }
});

let keyDown = [];
let screenMultiplier = 1;
let screenNew = {
  min: { x: -(render.options.width * screenMultiplier), y: -(render.options.height * screenMultiplier) },
  max: { x: (render.options.width * screenMultiplier), y: (render.options.height * screenMultiplier) }
};
document.body.addEventListener("keydown", function(e) {
  keyDown[e.which] = true;
});
document.body.addEventListener("keyup", function(e) {
  keyDown[e.which] = false;
});

MatterAttractors.Attractors.gravityConstant = G;

Render.run(render);

// create runner
var runner = Runner.create();

function moveCamera(x, y) {
  var bounds = render.bounds;
  var newBounds = {};
  newBounds.min = { x: x - ((bounds.max.x - bounds.min.x) / 2), y: y - ((bounds.max.y - bounds.min.y) / 2) };
  newBounds.max = { x: x + ((bounds.max.x - bounds.min.x) / 2), y: y + ((bounds.max.y - bounds.min.y) / 2) };
  return newBounds;
}

function timeFreezeToggle() {
  freezeTime = !freezeTime;
}

function getDistance(p1, p2) {
  var a = p1.x - p2.x;
  var b = p1.y - p2.y;

  return Math.sqrt(a * a + b * b);
}

function FgCalc2(bodyA, bodyB) {
  var bToA1 = Matter.Vector.sub(bodyB.position, bodyA.position),
    distanceSq1 = Matter.Vector.magnitudeSquared(bToA1) || 0.0001,
    normal1 = Matter.Vector.normalise(bToA1),
    magnitude1 = -MatterAttractors.Attractors.gravityConstant * (bodyA.mass * bodyB.mass / distanceSq1),
    force1 = Matter.Vector.mult(normal1, magnitude1);

  return Matter.Vector.magnitude(Matter.Vector.neg(force1));
}

function setOrbitalVel(body2) {
  let netForce;
  let bToA;
  let bToASqaured;
  let v;
  let FG = {
    force: 0,
    body1: {}
  };
  for (let i = 0; i < particles.length; i++) {
    if (Math.abs(FgCalc2(body2, particles[i])) > FG.force) {
      FG.force = Math.abs(FgCalc2(body2, particles[i]));
      FG.body1 = particles[i];
    }
  }

  if (FG.body1.mass > body2.mass) {
    bToA = Matter.Vector.sub(FG.body1.position, body2.position);
    bToAM = Matter.Vector.magnitude(bToA);
    v = { x: Math.sqrt((G * FG.body1.mass) / bToA), y: Math.sqrt((G * FG.body1.mass) / bToA) }
    Matter.Body.setVelocity(body2, v);
    console.log(bToA)
    console.log(v)
  }
}

// add bodies
world.bodies = [];
world.gravity.scale = 0;

let wrapBodies = false;

let imgUpdate = []
let imgUpdate2 = []

function createCelestialBody(name, fakeRadius, RRadius, RMass, imgWidth, imgHeight, img) {
  var radius = Common.random(10, 30);
  var body = Bodies.circle(
    mouse.position.x,
    mouse.position.y,
    fakeRadius, {
      mass: 700,
      frictionAir: 0,
      isStatic: false,
      label: name,
      render: {
        fillStyle: 'rgb(4, 53, 185)'
      },
      plugin: {
        attractors: [
          MatterAttractors.Attractors.gravity
          ]
      }
    }
  );

  body.render.sprite = {
    xScale: fakeRadius / (imgWidth / 2),
    yScale: fakeRadius / (imgHeight / 2),
    xOffset: 0.5,
    yOffset: 0.5,
    texture: img
  }

  var ratio = getRatio(body, Bodies.circle(
    Common.random(screenNew.min.x, screenNew.max.x),
    Common.random(screenNew.min.y, screenNew.max.y),
    RRadius, {
      mass: 700,
      frictionAir: 0,
      isStatic: false,
      label: 'R' + name,
      plugin: {
        attractors: [
          MatterAttractors.Attractors.gravity
          ]
      }
    }
  ))

  var trueMass = RMass / ratio;
  body.mass = trueMass;

  // setOrbitalVel(body)

  if (wrapBodies) {
    body.plugin.wrap = {
      min: { x: -(render.options.width * screenMultiplier), y: -(render.options.height * screenMultiplier) },
      max: { x: (render.options.width * screenMultiplier), y: (render.options.height * screenMultiplier) }
    }
  }
  particles.push(body);
  World.add(world, body);
}

function loadIMGUpdates(img, imgWidth, imgHeight) {
  imgUpdate.push({
    img: img,
    width: imgWidth,
    height: imgHeight
  })
  imgUpdate2.push(img)
}

loadIMGUpdates('https://www.pngarts.com/files/3/Planet-Earth-Transparent-Background-PNG.png', 720, 720)
loadIMGUpdates('https://i.ya-webdesign.com/images/nasa-png-of-sun-1.png', 400, 400)
loadIMGUpdates('https://upload.wikimedia.org/wikipedia/commons/thumb/e/ee/Weather_icon_-_full_moon.svg/512px-Weather_icon_-_full_moon.svg.png', 512, 512)
loadIMGUpdates('https://i0.wp.com/freepngimages.com/wp-content/uploads/2016/05/planet-mercury-transparent-background.png?fit=680%2C680', 680, 680)
loadIMGUpdates('https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/Venus_globe_-_transparent_background.png/600px-Venus_globe_-_transparent_background.png', 600, 600)
loadIMGUpdates('https://upload.wikimedia.org/wikipedia/commons/2/27/Mars_transparent.png', 500, 500)
loadIMGUpdates('https://upload.wikimedia.org/wikipedia/commons/e/e1/Jupiter_%28transparent%29.png', 779, 773)
loadIMGUpdates('http://assets.stickpng.com/thumbs/580b585b2edbce24c47b270d.png', 400, 400)

function findHighest(num, char, repeatListNum, repeatListStr, thing) {
  let obj = {
    number: 0,
    string: ''
  }

  for (let i = 0; i < repeatListNum.length; i++) {
    if (((Math.floor(thing / (repeatListNum[i] * 0.1)) / 1000) + '').charAt(char) != num) {
      obj.number = repeatListNum[i]
      obj.string = repeatListStr[i]
    }
  }
  return obj;
}

function moveTimestep() {
  Engine.update(engine, timestep)
}

function sideMenuFunc(body) {
  document.getElementById("sideMenu").style.display = "block"
  document.getElementById("sideMenuBodyLabel").value = body.label
  document.getElementById("sideMenuBodyMass").value = body.mass
  document.getElementById("sideMenuBodyRadius").value = body.circleRadius
}

function updateValuesFromSide() {
  touchedBody.label = document.getElementById("sideMenuBodyLabel").value
  touchedBody.mass = document.getElementById("sideMenuBodyMass").value
  touchedBody.circleRadius = document.getElementById("sideMenuBodyRadius").value
}

function updateSideFromValues(body) {
  document.getElementById("sideMenuBodyLabel").value = body.label
  document.getElementById("sideMenuBodyMass").value = body.mass
  document.getElementById("sideMenuBodyRadius").value = body.circleRadius
}

// add mouse control
var mouse = Mouse.create(render.canvas),
  mouseConstraint = MouseConstraint.create(engine, {
    mouse: mouse,
    stiffness: 1,
    constraint: {
      render: {
        visible: false
      }
    }
  });

World.add(world, mouse)
World.add(world, mouseConstraint);

// keep the mouse in sync with rendering
render.mouse = mouse;

Matter.Render.lookAt(render, screenNew)

var zoom = 1;
var cameraChange = zoom / 4
var globalPairs = {};
let down73 = false;

Events.on(engine, "collisionActive", function(e) {
  globalPairs = e;

  if (keyDown['73'] && !down73) {
    console.log(e)
    console.log('Active Collisions: ' + e.pairs.length)
    down73 = true;
    var down73Loop = setInterval(function() {
      if (!keyDown['73']) {
        down73 = false;
        clearInterval(down73Loop);
      }
    }, 100)
  }
})

Events.on(engine, "collisionStart", function(e) {
  var ba = e.pairs[0].bodyA
  var bb = e.pairs[0].bodyB
  if (ba.circleRadius > bb.circleRadius) {
    ba = e.pairs[0].bodyA
    bb = e.pairs[0].bodyB
  }

  if (ba.circleRadius < bb.circleRadius) {
    ba = e.pairs[0].bodyB
    bb = e.pairs[0].bodyA
  }

  var bacr = ba.circleRadius
  var bbcr = bb.circleRadius
  var cr = (bacr + bbcr) / 2

  var bam = ba.mass

  Body.scale(ba, addRadius(ba.circleRadius, bb.circleRadius) / ba.circleRadius, addRadius(ba.circleRadius, bb.circleRadius) / ba.circleRadius);

  Body.setMass(ba, bam + bb.mass)
  Composite.remove(world, bb);

  // scale textures
  if (imgUpdate2.indexOf(ba.render.sprite.texture) != -1) {
    let index = imgUpdate2.indexOf(ba.render.sprite.texture)
    ba.render.sprite = {
      xScale: ba.circleRadius / (imgUpdate[index].width / 2),
      yScale: ba.circleRadius / (imgUpdate[index].height / 2),
      xOffset: 0.5,
      yOffset: 0.5,
      texture: imgUpdate[index].img
    }
  }
})

function toggleInfo() {
  if (infoOpen) {
    infoOpen = false;
    document.getElementById("infoDIV").style.display = "none";
  } else {
    infoOpen = true;
    document.getElementById("infoDIV").style.display = "block";
  }
}

window.addEventListener("wheel", function(e) {
  zoom = (screenNew.max.x - screenNew.min.x) / 50
  dir = Math.sign(e.deltaY) * zoom;
  screenNew.max = { x: screenNew.max.x + dir * (render.options.width / render.options.height), y: screenNew.max.y + dir };
  screenNew.min = { x: screenNew.min.x - dir * (render.options.width / render.options.height), y: screenNew.min.y - dir };
  render.bounds = screenNew;
});

var selectedSection = null;

var addSelectedSection = null;

var addSelectedSectionBody = null;
var toolsSelectedSection = null;

var infoOpen = false;

function spawn() {
  switch (addSelectedSectionBody) {
    case 'earth':
      createCelestialBody('Earth', 10, earthR, earthM, 720, 720, 'https://www.pngarts.com/files/3/Planet-Earth-Transparent-Background-PNG.png')
      break;
    case 'moon':
      createCelestialBody('Moon', 2.725, moonR, moonM, 512, 512, 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ee/Weather_icon_-_full_moon.svg/512px-Weather_icon_-_full_moon.svg.png')
      break;
    case 'sun':
      createCelestialBody('Sun', 1092, sunR, sunM, 400, 400, 'https://i.ya-webdesign.com/images/nasa-png-of-sun-1.png')
      break;
    case 'mercury':
      createCelestialBody('Mercury', 3.83, mercuryR, mercuryM, 680, 680, 'https://i0.wp.com/freepngimages.com/wp-content/uploads/2016/05/planet-mercury-transparent-background.png?fit=680%2C680')
      break;
    case 'venus':
      9.52
      createCelestialBody('Venus', 9.52, venusR, venusM, 600, 600, 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/Venus_globe_-_transparent_background.png/600px-Venus_globe_-_transparent_background.png')
      break;
    case 'mars':
      createCelestialBody('Mars', 5.31, marsR, marsM, 500, 500, 'https://upload.wikimedia.org/wikipedia/commons/2/27/Mars_transparent.png')
      break;
    case 'jupiter':
      createCelestialBody('Jupiter', 105.17, jupiterR, jupiterM, 779, 773, 'https://upload.wikimedia.org/wikipedia/commons/e/e1/Jupiter_%28transparent%29.png')
      break;
    case 'saturn':
      createCelestialBody('Saturn', 94.49, saturnR, saturnM, 400, 400, 'http://assets.stickpng.com/thumbs/580b585b2edbce24c47b270d.png')
  }
}

var flyBody;

Events.on(mouseConstraint, "mousedown", function() {
  touchedBody = mouseConstraint.body
  if (mouseConstraint.body != null) {

  } else {
    if (selectedBottomBar == 0) {
      spawn()
    }
  }
})

//document.getElementById("bottomBar").style.display = "block"

var barSectionHeight = 150;
var frames = 0;
var fps = 100;
var timestep = 10;
var multiple = 10;
var showedStep = 'auto';
var strMath = (Math.floor(engine.timing.timestamp / (multiple * 0.1)) / 1000) + ''
var showedStepAuto = 'ms';
var repeatingListNum = [0.01,
 10,
  10 * 60,
   (10 * 60) * 60,
   ((10 * 60) * 60) * 24];
var repeatingListStr = ['ms', 'sec', 'min', 'hour', 'day']
var drag = false;
var drag2 = false;
var down32 = false;
var rightMenu = false;
var realtime = 0;
var updateTime = 0;
var correctionConst = 0;
var correction = 0;
var totalRealtime = 0;
var selectedBottomBar = null;
var bottomBarAddBodiesSection = 1;
var spawnType = 'orbit';
var check = false;
var correctionPrev;
var timestepPrev;
var test1 = 5;
var oldVels = [];
// Runner.run(engine)

function updateBodyVelocities(ahh) {
  let num1 = ahh / 10
  for (let i = 0; i < world.bodies.length; i++) {
    if (oldVels[i] === undefined) {
      oldVels[i] = {
        x: world.bodies[i].velocity.x,
        y: world.bodies[i].velocity.y,
        p: num1
      }
    } else {
      oldVels[i].x = world.bodies[i].velocity.x / oldVels[i].p
      oldVels[i].y = world.bodies[i].velocity.y / oldVels[i].p
    }
    Body.setVelocity(world.bodies[i], { x: oldVels[i].x * num1, y: oldVels[i].y * num1 })
    oldVels[i].p = num1
  }
}

// Game Loop
setInterval(function() {
  totalRealtime = performance.now()
  if (realtime == 0) {
    correctionConst = performance.now()
  }
  correction = (performance.now() - realtime) - correctionConst
  realtime += 10 + correction;

  strMath = (Math.floor(engine.timing.timestamp / (multiple * 0.1)) / 1000) + ''
  if (showedStep == 'auto') {
    multiple = findHighest('0', 0, repeatingListNum, repeatingListStr, engine.timing.timestamp).number;
    showedStepAuto = findHighest('0', 0, repeatingListNum, repeatingListStr, engine.timing.timestamp).string;
  }
  if (showedStep == 'ms') {
    multiple = 0.01;
    showedStepAuto = 'ms'
  }
  if (showedStep == 'sec') {
    multiple = 10;
    showedStepAuto = 'sec'
  }
  if (showedStep == 'min') {
    multiple = 10 * 60;
    showedStepAuto = 'min'
  }
  if (showedStep == 'hour') {
    multiple = (10 * 60) * 60;
    showedStepAuto = 'hour'
  }
  if (showedStep == 'day') {
    multiple = ((10 * 60) * 60) * 24;
    showedStepAuto = 'day'
  }

  //timestep += slider2.value / 10;
  //console.log(slider2.value)

  if (Math.abs(timestep + correction) == timestep + correction) {
    check = false;
  } else {
    check = true;
  }

  if (drag && drag2) {
    timestep += (slider2.value * timestep) / 500
  } else {
    slider2.value = 0;
  }

  // pause button
  if (freezeTime) {
    document.getElementById("bbMenuTopFreezeTime").value = "▶";
  } else {
    document.getElementById("bbMenuTopFreezeTime").value = "❚❚";
    Engine.update(engine, (timestep + correction), 1);
    updateBodyVelocities(timestep + correction);
  }

  // Configure HTML Crap
  document.getElementById("bottomBar").style.top = render.options.height - 80 + "px"
  document.getElementById("bottomBar").style.height = 80 + "px"
  document.getElementById("bottomBar").style.width = 100 + "%"
  document.getElementById("bottomBar").style.zIndex = 5;

  document.getElementById("menuDiv").style.top = 0 + "px"
  document.getElementById("menuDiv").style.height = render.options.height - 80 + "px"
  document.getElementById("menuDiv").style.zIndex = 5;

  // Update Camera Settings
  zoom = (screenNew.max.x - screenNew.min.x) / 75
  cameraChange = zoom / 3

  frames = frames + 1;
  // document.getElementById("timeInSim").innerHTML = `FPS: ${fps}`;
  document.getElementById("timeInSim2").innerHTML = `${Math.floor(engine.timing.timestamp / (multiple * 0.1)) / 1000}`;
  document.getElementById("timeInSim3").innerHTML = `${Math.floor(timestep / (findHighest('0', 0, repeatingListNum, repeatingListStr, timestep * 100).number) * 100) / 100} ${findHighest('0', 0, repeatingListNum, repeatingListStr, timestep * 100).string}/sec`;
  // Mouse Offset
  Mouse.setOffset(mouse, { x: render.bounds.min.x, y: render.bounds.min.y });
}, 10)

// fps loop
setInterval(function() {
  fps = frames;
  frames = 0;
}, 1000)

// key loop
setInterval(function() {
  if (keyDown['32'] && !down32) {
    timeFreezeToggle()
    down32 = true;
    var down32Loop = setInterval(function() {
      if (!keyDown['32']) {
        down32 = false;
        clearInterval(down32Loop);
      }
    }, 100)
  }

  if (1 == 1) {
    if (keyDown['87']) {
      screenNew.max = { x: screenNew.max.x, y: screenNew.max.y - cameraChange };
      screenNew.min = { x: screenNew.min.x, y: screenNew.min.y - cameraChange };
      render.bounds = screenNew;
      // console.log(`minX: ${render.bounds.min.x} minY: ${render.bounds.min.y} maxX: ${render.bounds.max.x} maxY: ${render.bounds.max.y}`)
    }
    if (keyDown['83']) {
      screenNew.max = { x: screenNew.max.x, y: screenNew.max.y + cameraChange };
      screenNew.min = { x: screenNew.min.x, y: screenNew.min.y + cameraChange };
      render.bounds = screenNew;
      // console.log(`minX: ${render.bounds.min.x} minY: ${render.bounds.min.y} maxX: ${render.bounds.max.x} maxY: ${render.bounds.max.y}`)
    }
    if (keyDown['65']) {
      screenNew.max = { x: screenNew.max.x - cameraChange, y: screenNew.max.y };
      screenNew.min = { x: screenNew.min.x - cameraChange, y: screenNew.min.y };
      render.bounds = screenNew;
      // console.log(`minX: ${render.bounds.min.x} minY: ${render.bounds.min.y} maxX: ${render.bounds.max.x} maxY: ${render.bounds.max.y}`)
    }
    if (keyDown['68']) {
      screenNew.max = { x: screenNew.max.x + cameraChange, y: screenNew.max.y };
      screenNew.min = { x: screenNew.min.x + cameraChange, y: screenNew.min.y };
      render.bounds = screenNew;
      // console.log(`minX: ${render.bounds.min.x} minY: ${render.bounds.min.y} maxX: ${render.bounds.max.x} maxY: ${render.bounds.max.y}`)
    }
  }
}, 1)

function rightMenuToggle() {
  let interval = 0;
  let distance = 200;
  let time = 5;
  if (rightMenu) {
    rightMenu = false;
    interval = distance
    var move = setInterval(function() {
      document.getElementById("menuIMG").style.left = interval + 'px';
      document.getElementById("menuDiv").style.width = interval + 'px'
      interval = interval - time
      if (interval == 0) {
        document.getElementById("menuDiv").style.display = 'none'
        document.getElementById("menuIMG").style.left = 0 + 'px';
        document.getElementById("menuDiv").style.width = 0 + 'px'
        clearInterval(move)
      }
    }, 1)
  } else {
    rightMenu = true;
    interval = 0
    var move = setInterval(function() {
      document.getElementById("menuIMG").style.left = interval + 'px';
      document.getElementById("menuDiv").style.width = interval + 'px'
      document.getElementById("menuDiv").style.display = 'block'
      interval = interval + time
      if (interval == distance) {
        document.getElementById("menuIMG").style.left = distance + 'px';
        document.getElementById("menuDiv").style.width = distance + 'px'
        document.getElementById("menuDiv").style.display = 'block'
        clearInterval(move)
      }
    }, 1)
  }
}

function clearBodies(bodyArray) {
  for (let i = 0; i < bodyArray.length; i++) {
    Composite.remove(world, bodyArray[i]);
  }
}

var parsedWidth = parseInt(document.getElementById("menuDiv").style.width, 10)

// Update HTML Divs
setInterval(function() {
  parsedWidth = parseInt(document.getElementById("menuDiv").style.width, 10)
  // add body menu
  document.getElementById("addBodiesBottomBarMain").style.top = render.options.height - 250 + "px"
  document.getElementById("addBodiesBottomBarMain").style.left = document.getElementById("menuDiv").style.width
  document.getElementById("addBodiesBottomBarMain").style.height = 190 + "px"
  if (parsedWidth) {
    document.getElementById("addBodiesBottomBarMain").style.width = render.options.width - parseInt(document.getElementById("menuDiv").style.width, 10) + "px"
  } else {
    document.getElementById("addBodiesBottomBarMain").style.width = render.options.width + "px"
  }
  for (let i = 0; i < document.getElementsByClassName("selectedBottomBarClass").length; i++) {
    if (i == selectedBottomBar) {
      document.getElementsByClassName("selectedBottomBarClass")[selectedBottomBar].style.display = 'flex'
    } else {
      document.getElementsByClassName("selectedBottomBarClass")[i].style.display = 'none'
    }
  }

  for (let i = 0; i < document.getElementsByClassName("addBodiesTopBarClass").length; i++) {
    if (i == bottomBarAddBodiesSection) {
      document.getElementsByClassName("addBodiesTopBarClass")[bottomBarAddBodiesSection].style.display = 'table-cell'
    } else {
      document.getElementsByClassName("addBodiesTopBarClass")[i].style.display = 'none'
    }
  }
}, 1)

function toggleBottomBarSection(id) {
  if (selectedBottomBar == id) {
    selectedBottomBar = null;
  } else {
    selectedBottomBar = id;
  }
}

function toggleBottomBarAddBodiesSection(id) {
  if (bottomBarAddBodiesSection == id) {
    bottomBarAddBodiesSection = id;
  } else {
    bottomBarAddBodiesSection = id;
  }
}
