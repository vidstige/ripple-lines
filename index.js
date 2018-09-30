// camera - camera matrix
// scene - plane (e.g. z = 0) and height map function f(u, v) = z
function render(canvas, camera, scene) {
  // 1. Iterate lines paralell to camera, farthest first
  //   1.1. Iterate points on line
  //   1.2. Evaluate heightmap
  //   1.3. Render line
  // 2. Profit  
  const ctx = canvas.getContext("2d");
  var projection = mat4.create();
  mat4.multiply(projection, camera.K, camera.pose);
  
  var vertices = [
    vec3.fromValues(0, 0, 0),
    vec3.fromValues(1, 0, 0),
    vec3.fromValues(1, 0, 1),
    vec3.fromValues(0, 0, 1),
  ];
  const r = 3;
  var screen = vec3.create();
  for (var i = 0; i < vertices.length; i++) {
    vec3.transformMat4(screen, vertices[i], projection);
    ctx.fillRect(
      canvas.width * (0.5 + screen[0] / screen[2]),
      canvas.height * (0.5 - screen[1] / screen[2]),
      r, r);
  }
}

function x2(x, y) {
  return 1 / (x*x + y*y);
}

function ready() {
  var up = vec3.fromValues(0, 1, 0);
  var eye = vec3.fromValues(0, 0.2, -2);
  var center = vec3.fromValues(0, 0, 0);
  var pose = mat4.create();
  mat4.lookAt(pose, eye, center, up);
  var K = mat4.create();
  mat4.perspective(K, 1.3, 640/480, 0.1, 2);
  console.log(K, pose);

  const canvas = document.getElementById('target');
  const camera = {K, pose};
  const scene = {heightmap: x2};
  render(canvas, camera, scene);
}

document.addEventListener('DOMContentLoaded', ready);
