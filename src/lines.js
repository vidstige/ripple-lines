const glMatrix = require('gl-matrix');
const vec2 = glMatrix.vec2;
const vec3 = glMatrix.vec3;
const vec4 = glMatrix.vec4;
const mat4 = glMatrix.mat4;

// scales a clip coordinate (transformed by projection) into 
// NDC coordinates (vec3). Normally only x and y are used.
function ndc(out, v) {
  vec3.copy(out, v);
  return vec3.scale(out, out, 1.0 / v[3]);
}

function extend(v) {
  return vec4.fromValues(v[0], v[1], v[2], 1);
}

// Projects a vec4 using a mat4 and then scales to ndc
function project(out, v, M) {
  const clip = vec4.transformMat4(vec4.create(), v, M);
  return ndc(out, clip);
}

// Projects a 3D line to a 2D line
function project_line(line, M) {
  var p = vec3.create();
  project(p, extend(line.p), M);
  
  // TODO: How to transform u directly?
  var line_p1 = vec3.add(vec3.create(), line.p, line.u);
  var p1 = vec3.create();
  project(p1, extend(line_p1), M);

  return {
    p: p,
    u: vec3.subtract(vec3.create(), p1, p)
  };
}

function plane_plane_intersection(p1, p2) {
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

// Line intersection with axis aligned line, e.g. x=-1
function aax_line_line(line, x) {
  const px = line.p[0], py = line.p[1];
  const ux = line.u[0], uy = line.u[1];
  return vec2.fromValues(x, py + uy * (x - px) / ux);
}

// Line intersection with axis aligned line, e.g. y=-1
/*function aay_line_line(line, y) {
  const px = line.p[0], py = line.p[1];
  const ux = line.u[0], uy = line.u[1];
  return vec2.fromValues(px + ux * (y - py) / uy, y);
}*/

function clip_to_ndc(line) {
  // TODO: Also clip agaist screen top and bottom.
  const left = aax_line_line(line, -1);
  const right = aax_line_line(line, 1);
  return {p0: left, p1: right};
}

function transform_plane(out, plane, M) {
  var tmp = mat4.create();
  mat4.invert(tmp, M);
  mat4.transpose(tmp, tmp);
  vec4.transformMat4(out, plane, tmp);
  return out;
}

// Computes ray-plane intersection
function ray_plane(out, ray, plane) {
  const plane_normal = vec3.copy(vec3.create(), plane);
  const d = plane[3];
  //const t = -( N.O + d ) / ( N.D );
  const t = -( vec3.dot(plane_normal, ray.o) + d ) / vec3.dot(plane_normal, ray.d);
  return vec3.scaleAndAdd(out, ray.o, ray.d, t);
}

function backproject(screen, camera) {
  // Ray in clip coordinates
  const ray_clip = vec3.fromValues(screen[0], screen[1], -1, 1);

  var total = mat4.create();
  mat4.multiply(total, camera.projection, camera.pose);
  
  var total_inv = mat4.create();
  mat4.invert(total_inv, total);
  //mat4.transpose(total_inv, total_inv);
  //const ray_eye = inverse(total) * ray_clip;
  const ray_world = vec4.create();
  vec3.transformMat4(ray_world, ray_clip, total_inv);

  const origin_world = vec3.transformMat4(vec3.create(), vec3.fromValues(0, 0, 0), total_inv);

  // drop w and normalize
  return {
    o: origin_world,
    d: vec3.normalize(vec3.create(), ray_world),
  };
}

/*function rgb(r, g, b) {
  return 'rgb(' + Math.floor(255*r) + ',' + Math.floor(255*g) + ',' + Math.floor(255*b) + ')';
}

// For debugging
function draw_heightmap(ctx, w, h, camera, scene) {
  for (var x = 0; x < w; x++) {
    for (var y = 0; y < w; y++) {
      const sx = 2 * x/w - 1;
      const sy = 2 * y/h - 1;
      const ray = backproject(vec2.fromValues(
        sx + 0.5/w,
        sy + 0.5/h), camera);
      const p = ray_plane(vec3.create(), ray, scene.plane);
      const uv = vec2.fromValues(p[0], p[2]);
      const i = scene.heightmap(uv);
      ctx.fillStyle = rgb(i, 0, i);
      ctx.fillRect(sx, sy, 2/w, 2/h);
    }
  }
}*/

// camera - camera matrix
// scene - plane (e.g. y = 0) and height map function f(u, v)
function render(canvas, camera, scene) {
  const ctx = canvas.getContext("2d");
  if (ctx.transform.setMatrix) {
    // pure image hack
    ctx.transform.setMatrix([canvas.width/2, 0, 0, canvas.height/2, canvas.width/2, canvas.height/2]);
  } else {
    ctx.setTransform(canvas.width/2, 0, 0, canvas.height/2, canvas.width/2, canvas.height/2);
  }
  ctx.clearRect(-1, -1, 2, 2);

  //draw_heightmap(ctx, 64, 48, camera, scene);


  ctx.lineWidth = 2 / canvas.height;
  ctx.fillStyle = "white";

  for (var z = -8; z < -1; z += 0.5) {
    // Construct plane parallel to camera
    var z_plane = vec4.fromValues(0, 0, 1, z);

    // Intersect scene plane and z plane
    const plane = transform_plane(vec4.create(), scene.plane, camera.pose);
    const line3d = plane_plane_intersection(plane, z_plane);

    // Project line
    const line2d = project_line(line3d, camera.projection);
    
    // Clip with screen edges
    const lineSegment = clip_to_ndc(line2d);

    const ray0 = backproject(lineSegment.p0, camera);
    const ray1 = backproject(lineSegment.p1, camera);

    const p0 = ray_plane(vec3.create(), ray0, scene.plane);
    const p1 = ray_plane(vec3.create(), ray1, scene.plane);

    // HACK: Just grab uv from x,z in projected point
    // Only works when plane = [0, 1, 0, 0]. uv should be 
    // projected onto orthonogal 3d U, V vectors _in_ the plane.
    const uv0 = vec2.fromValues(p0[0], p0[2]);
    const uv1 = vec2.fromValues(p1[0], p1[2]);

    // Find normal of plane in screen space
    var total = mat4.create();
    mat4.multiply(total, camera.projection, camera.pose);
    const above0_world = extend(vec3.add(vec3.create(), p0, scene.plane));
    const above0_clip = vec4.transformMat4(vec4.create(), above0_world, total);
    const above0 = ndc(vec3.create(), above0_clip);
    const up0 = vec2.subtract(vec2.create(), above0, lineSegment.p0);

    const above1_world = extend(vec3.add(vec3.create(), p1, scene.plane));
    const above1 = ndc(vec3.create(), vec4.transformMat4(vec4.create(), above1_world, total));
    const up1 = vec2.subtract(vec2.create(), above1, lineSegment.p1);
  
    // interpolate linesegment and uv pairs
    var p = vec2.create();
    var uv = vec2.create();
    var up = vec2.create();
    var plot = vec2.create();
    
    ctx.beginPath();

    vec2.scaleAndAdd(plot, lineSegment.p0, up0, scene.heightmap(uv0));
    ctx.moveTo(plot[0], plot[1]);

    const n = 64;
    for (var j = 0; j < n; j++) {
      const t = (j + 1) / n;
      vec2.lerp(p, lineSegment.p0, lineSegment.p1, t);
      vec2.lerp(uv, uv0, uv1, t);
      vec2.lerp(up, up0, up1, t);
      vec2.scaleAndAdd(plot, p, up, scene.heightmap(uv));
      ctx.lineTo(plot[0], plot[1]);
    }
    ctx.stroke();
    ctx.lineTo(1, 1);
    ctx.lineTo(-1, 1);
    ctx.closePath();
    ctx.fill();
  }
}

function gaussian(mean, sigma) {
  return function (p) {
    var tmp = vec2.subtract(vec2.create(), p, mean);
    return 0.5 * Math.exp(-vec2.dot(tmp, tmp) / (2 * sigma * sigma));
  };
}

module.exports = {
  gaussian: gaussian,
  render: render
};