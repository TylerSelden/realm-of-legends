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
  deltaX: 0,
  deltaY: 0,
  mousedownX: 0,
  mousedownY: 0,
  layer: 1
}

var currentRoom = {
  x: null,
  y: null,
  z: null
}

var elems = {}

function handleUpload() {
  if (!confirm("Warning: This will overwrite what you've already created! Are you sure?")) return;
  var input = document.createElement("input");
  input.type = "file";
  input.addEventListener("change", function() {
    var file = input.files[0];
    var reader = new FileReader();
    reader.addEventListener("load", function() {
      var jsonContent = reader.result;
      try {
        alert("Upload successful.");
        data = JSON.parse(jsonContent);
      } catch(e) {
        alert("Invalid JSON file.");
        console.error(e);
      }
    });
    reader.readAsText(file);
  });
  input.click();
}

function handleDownload() {
  var jsonString = JSON.stringify(data, null, 2);
  var blob = new Blob([jsonString], { type: "application/json" });

  var a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "data.json";

  a.click();

  URL.revokeObjectURL(a.href);
}

window.onload = function() {
  canvas = document.getElementById("canvas");
  ctx = canvas.getContext("2d");

  setup();

  renderloop();
}

var data = {};

function resizeCanvas() {
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
}

function isEmpty(obj) {
  for (const prop in obj) {
    if (Object.hasOwn(obj, prop)) {
      return false;
    }
  }

  return true;
}

function saveRoom() {
  var roomData = {
    name: elems.name.value,
    description: elems.description.value,
    exits: {
      north: elems.north.value,
      east: elems.east.value,
      south: elems.south.value,
      west: elems.west.value
    },
    items: elems.items.value.split(/[^a-zA-Z0-9-_]+/)
  }
  saveBox(currentRoom.x, currentRoom.y, currentRoom.z, roomData)
}
function deleteRoom() {
  deleteBox(currentRoom.x, currentRoom.y, camera.layer);
}


function showDisplay() {
  elems.defContent.style = "";
  elems.editor.style = "display: none;";
}
function hideDisplay() {
  elems.editor.style = "";
  elems.defContent.style = "display: none;";
}

function saveBox(x, y, z, roomData) {
  if (data[x] == undefined) data[x] = {};
  if (data[x][y] == undefined) data[x][y] = {};
  data[x][y][z] = roomData;
}
function deleteBox(x, y, z) {
  delete data[x][y][z];
  if (isEmpty(data[x][y])) delete data[x][y];
  if (isEmpty(data[x])) delete data[x];
}

function clearFields() {
  elems.name.value = "";
  elems.description.value = "";
  elems.north.value = "";
  elems.east.value = "";
  elems.south.value = "";
  elems.west.value = "";
  elems.items.value = "";
}

function selectBox(x, y, z) {
  document.getElementById("coords").innerText = `(${x}, ${y}, ${z})`;
  if (boxHasData(x, y, z)) {
    var room = data[x][y][z];
    elems.name.value = room.name;
    elems.description.value = room.description;
    elems.north.value = room.exits.north;
    elems.east.value = room.exits.east;
    elems.south.value = room.exits.south;
    elems.west.value = room.exits.west;
    elems.items.value = room.items.join(", ");
  } else {
    clearFields();
  }
  hideDisplay();
}

function setup() {
  elems.name = document.getElementById("name");
  elems.description = document.getElementById("description");
  elems.north = document.getElementById("north");
  elems.east = document.getElementById("east");
  elems.south = document.getElementById("south");
  elems.west = document.getElementById("west");
  elems.items = document.getElementById("items");

  elems.defContent = document.getElementById("default");
  elems.editor = document.getElementById("editor");
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
      if (realX % totalWidth > config.width || realY % totalHeight > config.height) return showDisplay();

      currentRoom.x = coordX;
      currentRoom.y = coordY;
      currentRoom.z = camera.layer;

      selectBox(coordX, coordY, camera.layer);
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

function boxHasData(x, y, z) {
  if (data[x] == undefined || data[x][y] == undefined) return false;
  if (data[x][y][z] !== undefined) {
    return true;
  }
}

function drawBox(x, y, w, h, coordX, coordY) {
  var dark = true;
  //check if box has data

  if (boxHasData(coordX, coordY, camera.layer)) dark = false;

  // if (data[x][y][camera.layer] !== undefined) dark = false;
  if (dark) {
    ctx.fillStyle = "#333333";
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = "#ffffff";
  } else {
    // ctx.fillStyle = "#bbbbbb";
    ctx.fillStyle = "#777777";
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = "#ffffff";
    // ctx.fillStyle = "#000000";
  }
  ctx.font = "14px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  if (boxHasData(coordX, coordY, camera.layer)) {
    ctx.fillText(`(${coordX}, ${coordY}, ${camera.layer})`, x + w / 2, y + h / 3);
    var roomName = data[coordX][coordY][camera.layer].name;
    if (roomName.length > 10) roomName = roomName.slice(0, 10) + "...";
    ctx.fillText(`${roomName}`, x + w / 2, y + (2/3 * h));
  } else {
    ctx.fillText(`(${coordX}, ${coordY}, ${camera.layer})`, x + w / 2, y + h / 2);
  }
}
