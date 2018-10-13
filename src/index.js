const lines = require('./lines.js');
const heightmaps = require('./heightmaps');
const glMatrix = require('gl-matrix');
const dat = require('dat.gui'); 

const vec3 = glMatrix.vec3;
const vec4 = glMatrix.vec4;
const mat4 = glMatrix.mat4;

function ready() {
  var up = vec3.fromValues(0, 1, 0);
  var pose = mat4.create();
  var projection = mat4.create();

  const scene = {
    //heightmap: heightmaps.gaussian(vec2.fromValues(0, 0), 0.04),
    //heightmap: heightmaps.square,
    heightmap: heightmaps.mountains(3),
    plane: vec4.fromValues(0, -1, 0, 0)};

  var tweaking = {
    fov: 1.3,
    height: 0.75,
    center_height: 0.6,
    z_min: -9,
    z_max: 0,
    angle: 60,
    distance: 2.45,
    lines: true
  };
  var gui = new dat.gui.GUI();
  gui.remember(tweaking);
  gui.add(tweaking, 'fov', 0.2, 4).step(0.1);
  gui.add(tweaking, 'height', 0, 4).step(0.05);
  gui.add(tweaking, 'center_height', -4, 3).step(0.1);
  gui.add(tweaking, 'z_min', -12, -2).step(0.5);
  gui.add(tweaking, 'z_max', -2, 0).step(0.05);
  gui.add(tweaking, 'angle', 0, 360).step(1);
  gui.add(tweaking, 'distance', 0.2, 5).step(0.05);
  gui.add(tweaking, 'lines');

  const canvas = document.getElementById('target');
  function render() {
    const a = 2*Math.PI * tweaking.angle / 360;
    var eye = vec3.fromValues(
      tweaking.distance * Math.sin(a),
      tweaking.height,
      tweaking.distance * Math.cos(a));
    const center = vec3.fromValues(0, tweaking.center_height, 0);
    mat4.lookAt(pose, eye, center, up);
    mat4.perspective(projection, tweaking.fov, 640/480, 0.1, 3);
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
