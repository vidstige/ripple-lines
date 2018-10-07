const fs = require('fs');

const pureImage = require('pureimage');
const glMatrix = require('gl-matrix');
const vec2 = glMatrix.vec2;
const vec3 = glMatrix.vec3;
const vec4 = glMatrix.vec4;
const mat4 = glMatrix.mat4;

const lines = require('../src/lines.js');

function main() {
  var up = vec3.fromValues(0, 1, 0);
  var eye = vec3.fromValues(0, 0.4, -2);
  var center = vec3.fromValues(0, 0, 0);
  var pose = mat4.create();
  mat4.lookAt(pose, eye, center, up);
  var projection = mat4.create();
  mat4.perspective(projection, 1.3, 640/480, 0.1, 2);

  var canvas = pureImage.make(640, 480);

  const camera = {projection, pose};
  const scene = {
    heightmap: lines.gaussian(vec2.fromValues(0, -0.19), 0.030),
    plane: vec4.fromValues(0, -1, 0, 0)};
  lines.render(canvas, camera, scene);

  const destination = 'screenshots/2.png';
  pureImage.encodePNGToStream(canvas, fs.createWriteStream(destination)).then(() => {
    console.log("Wrote " + destination);
  }).catch((e)=>{
    console.error("Could not save " + destination);
  });
}

main();