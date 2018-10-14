const glMatrix = require('gl-matrix');
const vec2 = glMatrix.vec2;
const vec3 = glMatrix.vec3;

function plane_plane(p1, p2) {
  const normal1 = vec3.clone(p1);
  const d1 = p1[3];
  const normal2 = vec3.clone(p2);
  const d2 = p2[3];
  // Find the normal of the line - u
  const u = vec3.cross(vec3.create(), p1, p2);

  // Find a point on the line
  var p = 
    vec3.cross(vec3.create(),
      vec3.subtract(vec3.create(),
        vec3.scale(vec3.create(), normal1, d2),
        vec3.scale(vec3.create(), normal2, d1)),
      u);
  p = vec3.scale(vec3.create(), p, vec3.squaredLength(u));
  return {
    p: p,
    u: u,
  };
}

// Computes ray-plane intersection
function ray_plane(out, ray, plane) {
  const plane_normal = vec3.copy(vec3.create(), plane);
  const d = plane[3];
  const t = -( vec3.dot(plane_normal, ray.o) + d ) / vec3.dot(plane_normal, ray.d);
  return vec3.scaleAndAdd(out, ray.o, ray.d, t);
}


// Line intersection with axis aligned line, e.g. x=-1
function vertical_line_line(line, x) {
  const px = line.p[0], py = line.p[1];
  const ux = line.u[0], uy = line.u[1];
  return vec2.fromValues(x, py + uy * (x - px) / ux);
}

// Line intersection with axis aligned line, e.g. y=-1
/*function horizontal_line_line(line, y) {
  const px = line.p[0], py = line.p[1];
  const ux = line.u[0], uy = line.u[1];
  return vec2.fromValues(px + ux * (y - py) / uy, y);
}*/

module.exports = {plane_plane, vertical_line_line, ray_plane};