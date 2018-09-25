function gaussian(mean, sigma) {
  return function(x) {
    return 1 / Math.pow(Math.E, (Math.pow(x - mean, 2)) / (2 * sigma * sigma));
  };
};

function draw(canvas, lines) {
  const ctx = canvas.getContext("2d");
  
  var distance = -200;
  for (var i = 0; i < lines.length; i++) {
    const line = lines[i];
    var y = canvas.height / 2 + distance;
    ctx.moveTo(0, y);
    var n = 40;
    for (var j = 0; j < n; j++) {
      var nx = j / n - 0.5;
      ctx.lineTo(
        j * canvas.width / n,
        y + line(nx) * -20);
    }
    ctx.stroke();

    distance += 400 / lines.length;
  }
}

function mountains(n) {
  var parts = [];
  for (var i = 0; i < n; i++) {
    parts.push(gaussian((Math.random()-0.5)/2, Math.random() / 10));
  }
  return function(x) {
    var acc = 0;
    for (var i = 0; i < parts.length; i++) {
      acc += parts[i](x);
    }
    return acc;
  };
}

function ready() {
  const canvas = document.getElementById('target');
  var lines = [];
  for (var i = 0; i < 20; i++) {
    //lines.push(gaussian(0, 0.09));
    lines.push(mountains(3));
  }
  draw(canvas, lines);  
}

document.addEventListener('DOMContentLoaded', ready);
