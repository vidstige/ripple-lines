function gussian(n, height) {
  const result = [];
  for (var i = 0; i < n; i++) {
    result.push(0); // TODO
  }
}

function draw(canvas, lines) {
  const ctx = canvas.getContext("2d");
  
  var distance = -100;
  for (var i = 0; i < lines.length; i++) {
    const line = lines[i];
    var y = canvas.height + distance;;
    ctx.moveTo(0, y);
    for (var j = 0; j < line.length; j++) {
      ctx.lineTo(j*canvas.width/line.length, y + line[j]);
    }
    ctx.stroke();

    distance += 100 / lines.length;
  }
}



function ready() {
  const canvas = document.getElementById('target');
  var lines = [];
  lines.push([10, -10, 30]);
  lines.push([10, -10, 30]);
  draw(canvas, lines);  
}

document.addEventListener('DOMContentLoaded', ready);
