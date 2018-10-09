const lines = require('./lines.js');
const glMatrix = require('gl-matrix');
const vec2 = glMatrix.vec2;
const vec3 = glMatrix.vec3;
const vec4 = glMatrix.vec4;
const mat4 = glMatrix.mat4;

function ready() {
  var up = vec3.fromValues(0, 1, 0);
  var center = vec3.fromValues(0, 0.19, 0);
  var pose = mat4.create();
  var projection = mat4.create();
  mat4.perspective(projection, 1.3, 640/480, 0.1, 2);

  const scene = {
    heightmap: lines.gaussian(vec2.fromValues(0, -0.19), 0.030),
    plane: vec4.fromValues(0, -1, 0, 0)};

  const canvas = document.getElementById('target');
  function render(t) {
    const a = t / 400;
    //var eye = vec3.fromValues(0, 0.4, -2);
    var eye = vec3.fromValues(2*Math.sin(a), 0.4, -2*Math.cos(a));
    mat4.lookAt(pose, eye, center, up);
    const camera = {projection, pose};

    lines.render(canvas, camera, scene);
  }

  function animate(t) {
    render(t);
    requestAnimationFrame(animate);
  }
  requestAnimationFrame(animate);
}

document.addEventListener('DOMContentLoaded', ready);
