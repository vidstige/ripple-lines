const vec2 = require('gl-matrix').vec2;
const exp = Math.exp;

function gaussian(mean, sigma) {
  return function (p) {
    var tmp = vec2.subtract(vec2.create(), p, mean);
    return 0.2 * exp(-vec2.dot(tmp, tmp) / (2 * sigma * sigma));
  };
}

function mountains(n) {
  const s = 0.1;
  const peaks = [];
  for (var i = 0; i < n; i++) {
    const mean = vec2.subtract(vec2.create(),
      vec2.random(vec2.create(), s),
      vec2.fromValues(s/2, s/2));
    const sigma = 0.03;
    peaks.push(gaussian(mean, sigma));
  }

  return function(uv) {
    var h = 0;
    for (var i = 0; i < peaks.length; i++) {
      h += peaks[i](uv);
    }
    return h;
  };
}

function square(uv) {
  const s = 0.03;
  const u = uv[0], v = uv[1];
  if (u > -s && u < s && v > -s && v < s) {
    return 0.1;
  }
  return 0;
}

module.exports = {gaussian, square, mountains};
