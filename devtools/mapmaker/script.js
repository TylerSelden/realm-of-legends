var canvas, ctx;

var config = {
  width: 100,
  height: 75,
  spacing: 25
}

var camera = {
  x: 0,
  y: 0,
  mousedown: false,
  mouseX: 0,
  mouseY: 0,
  // newMouseX: 0,
  // newMouseY: 0,
  deltaX: 0,
  deltaY: 0,
  mousedownX: 0,
  mousedownY: 0,
  layer: 1
}

window.onload = function() {
  canvas = document.getElementById("canvas");
  ctx = canvas.getContext("2d");

  setup();

  renderloop();
}

function resizeCanvas() {
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
}

function setup() {
  canvas.addEventListener("mousedown", (event) => {
    camera.mousedown = true;
    var rect = canvas.getBoundingClientRect();
    camera.mouseX = event.clientX - rect.left;
    camera.mousedownX = event.clientX - rect.left;
    camera.mouseY = event.clientY - rect.top;
    camera.mousedownY = event.clientY - rect.top;
  });
  document.addEventListener("mouseup", (event) => {
    camera.mousedown = false;
    var rect = canvas.getBoundingClientRect();
    var x = event.clientX - rect.left;
    var y = event.clientY - rect.top;

    if (x == camera.mousedownX && y == camera.mousedownY) {
      var { totalWidth, totalHeight, offsetX, offsetY } = offsets();

      var realX = x + camera.x;
      var realY = y + camera.y;

      var boxX = Math.floor((x - offsetX) / totalWidth);
      var boxY = Math.floor((y - offsetY) / totalHeight);

      var coordX = Math.floor(camera.x / totalWidth) + boxX;
      var coordY = Math.floor(camera.y / totalHeight) + boxY;

      // do nothing if space between is clicked
      if (realX % totalWidth > config.width || realY % totalHeight > config.height) return;

      console.log("Clicked on box:", coordX, coordY);
    }
  });
  document.addEventListener("mousemove", (event) => {
    if (!camera.mousedown) return;
    camera.mousedown = true;
    var rect = canvas.getBoundingClientRect();
    var x = event.clientX - rect.left;
    var y = event.clientY - rect.top;

    camera.x -= x - camera.mouseX;
    camera.y -= y - camera.mouseY;
    
    camera.mouseX = x;
    camera.mouseY = y;
  });
  canvas.addEventListener("keydown", (event) => {
    var keycode = event.keyCode;
    if (keycode == 38) {
      camera.layer++;
    } else if (keycode == 40) {
      camera.layer--;
    }
  });
}

function offsets() {
  var totalWidth = config.width + config.spacing;
  var totalHeight = config.height + config.spacing;

  var offsetX = (Math.floor(camera.x / totalWidth) * totalWidth) - camera.x;
  var offsetY = (Math.floor(camera.y / totalHeight) * totalHeight) - camera.y;

  return { totalWidth, totalHeight, offsetX, offsetY };
}

function renderloop() {
  resizeCanvas();

  
  var { totalWidth, totalHeight, offsetX, offsetY } = offsets();

  // Calculate the number of rectangles that can fit in the canvas
  var columns = Math.floor(canvas.width / totalWidth) + 3;
  var rows = Math.floor(canvas.height / totalHeight) + 3;

  // Render the rectangles
  for (var i = 0; i < rows; i++) {
    for (var j = 0; j < columns; j++) {
      var x = (j - 1) * totalWidth + offsetX;
      var y = (i - 1) * totalHeight + offsetY;
      var coordX = j - 1 + Math.floor(camera.x / totalWidth);
      var coordY = i - 1 + Math.floor(camera.y / totalHeight);

      drawBox(x, y, config.width, config.height, coordX, coordY);
    }
  }

  requestAnimationFrame(renderloop);
}


var dark = false;
function drawBox(x, y, w, h, coordX, coordY) {
  if (dark) {
    ctx.fillStyle = "#333333";
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = "#ffffff";
  } else {
    // ctx.fillStyle = "#bbbbbb";
    ctx.fillStyle = "#555555";
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = "#ffffff";
    // ctx.fillStyle = "#000000";
  }
  ctx.font = "14px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  ctx.fillText(`(${coordX}, ${coordY}, ${camera.layer})`, x + w / 2, y + h / 2);
}
