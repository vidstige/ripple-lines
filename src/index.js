const lines = require('./lines.js');
const glMatrix = require('gl-matrix');
const dat = require('dat.gui'); 

//const vec2 = glMatrix.vec2;
const vec3 = glMatrix.vec3;
const vec4 = glMatrix.vec4;
const mat4 = glMatrix.mat4;

function square(uv) {
  const s = 0.01;
  const u = uv[0], v = uv[1];
  if (u > -s && u < s && v > -s && v < s) {
    return 0.1;
  }
  return 0;
}

function ready() {
  var up = vec3.fromValues(0, 1, 0);
  var center = vec3.fromValues(0, -0.5, 0);
  var pose = mat4.create();
  var projection = mat4.create();
  mat4.perspective(projection, 1.4, 640/480, 0.1, 3);

  const scene = {
    //heightmap: lines.gaussian(vec2.fromValues(0, 0), 0.04),
    heightmap: square,
    plane: vec4.fromValues(0, -1, 0, 0)};

  var tweaking = {
    height: 0.4,
    z_min: -7,
    z_max: 0,
    angle: 0,
    distance: 0.2,
    lines: true
  };
  var gui = new dat.gui.GUI();
  gui.remember(tweaking);
  gui.add(tweaking, 'height', 0, 2).step(0.05);
  gui.add(tweaking, 'z_min', -12, -2).step(0.5);
  gui.add(tweaking, 'z_max', -2, 0).step(0.05);
  gui.add(tweaking, 'angle', 0, 360).step(1);
  gui.add(tweaking, 'distance', 0.5, 5).step(0.05);
  gui.add(tweaking, 'lines');

  const canvas = document.getElementById('target');
  function render() {
    const a = 2*Math.PI * tweaking.angle / 360;
    var eye = vec3.fromValues(
      tweaking.distance * Math.sin(a),
      tweaking.height,
      tweaking.distance * Math.cos(a));
    mat4.lookAt(pose, eye, center, up);
    const camera = {projection, pose};
    
    if (tweaking.lines) {
      lines.render(canvas, camera, scene,
        {z: {min: tweaking.z_min, max: tweaking.z_max}});
    } else {
      lines.draw_heightmap(canvas, 32, 32, camera, scene);
    }
  }
  
  for (var i = 0; i < gui.__controllers.length; i++) {
    gui.__controllers[i].onChange(render);
  }
  render();

  //function animate(t) {
  //  render(t);
  //  requestAnimationFrame(animate);
  //}
  //requestAnimationFrame(animate);
}

document.addEventListener('DOMContentLoaded', ready);
