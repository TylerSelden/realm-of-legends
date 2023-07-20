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
  var exits = {};

  if (elems.north.value.trim() !== "") exits.north = { coords: [elems.northx.value, elems.northy.value, elems.northz.value], description: elems.north.value }
  if (elems.east.value.trim() !== "") exits.east = { coords: [elems.eastx.value, elems.easty.value, elems.eastz.value], description: elems.east.value }
  if (elems.south.value.trim() !== "") exits.south = { coords: [elems.southx.value, elems.southy.value, elems.southz.value], description: elems.south.value }
  if (elems.west.value.trim() !== "") exits.west = { coords: [elems.westx.value, elems.westy.value, elems.westz.value], description: elems.west.value }

  var roomData = {
    name: elems.name.value,
    description: elems.description.value,
    exits: exits,
    items: elems.items.value.split(/[^a-zA-Z0-9-_]+/),
    additionals: additionals
  }
  if (elems.items.value == "") roomData.items = [];
  
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

  additionals = [];
  elems.add.innerHTML = "";
}

function loadCoords(room) {
  if (room.exits.north !== undefined) {
    elems.north.value = room.exits.north.description;
    elems.northx.value = room.exits.north.coords[0];
    elems.northy.value = room.exits.north.coords[1];
    elems.northz.value = room.exits.north.coords[2];
  } else setDefaultExits(0);

  if (room.exits.east !== undefined) {
    elems.east.value = room.exits.east.description;
    elems.eastx.value = room.exits.east.coords[0];
    elems.easty.value = room.exits.east.coords[1];
    elems.eastz.value = room.exits.east.coords[2];
  } else setDefaultExits(1);

  if (room.exits.south !== undefined) {
    elems.south.value = room.exits.south.description;
    elems.southx.value = room.exits.south.coords[0];
    elems.southy.value = room.exits.south.coords[1];
    elems.southz.value = room.exits.south.coords[2];
  } else setDefaultExits(2);

  if (room.exits.west !== undefined) {
    elems.west.value = room.exits.west.description;
    elems.westx.value = room.exits.west.coords[0];
    elems.westy.value = room.exits.west.coords[1];
    elems.westz.value = room.exits.west.coords[2];
  } else setDefaultExits(3);
}

function selectBox(x, y, z) {
  document.getElementById("coords").innerText = `(${x}, ${y}, ${z})`;
  if (boxHasData(x, y, z)) {
    var room = data[x][y][z];
    elems.name.value = room.name;
    elems.description.value = room.description;
    loadCoords(room);
    elems.items.value = room.items.join(", ");

    loadAdditionals(room);
  } else {
    clearFields();
  }
  // setDefaultExits();
  hideDisplay();
}

function setDefaultExits(dir) {
  if (dir == 0) {
    elems.northx.value = currentRoom.x;
    elems.northy.value = currentRoom.y - 1;
    elems.northz.value = currentRoom.z;
  }

  if (dir == 1) {
    elems.eastx.value = currentRoom.x + 1;
    elems.easty.value = currentRoom.y;
    elems.eastz.value = currentRoom.z;
  }

  if (dir == 2) {
    elems.southx.value = currentRoom.x;
    elems.southy.value = currentRoom.y + 1;
    elems.southz.value = currentRoom.z;
  }
  
  if (dir == 3) {
    elems.westx.value = currentRoom.x - 1;
    elems.westy.value = currentRoom.y;
    elems.westz.value = currentRoom.z;
  }
}

function setup() {
  elems.name = document.getElementById("name");
  elems.description = document.getElementById("description");
  elems.north = document.getElementById("north");
  elems.east = document.getElementById("east");
  elems.south = document.getElementById("south");
  elems.west = document.getElementById("west");
  elems.items = document.getElementById("items");
  // well this is gonna be fun
  elems.northx = document.getElementById("north-x");
  elems.northy = document.getElementById("north-y");
  elems.northz = document.getElementById("north-z");
  elems.eastx = document.getElementById("east-x");
  elems.easty = document.getElementById("east-y");
  elems.eastz = document.getElementById("east-z");
  elems.southx = document.getElementById("south-x");
  elems.southy = document.getElementById("south-y");
  elems.southz = document.getElementById("south-z");
  elems.westx = document.getElementById("west-x");
  elems.westy = document.getElementById("west-y");
  elems.westz = document.getElementById("west-z");

  elems.defContent = document.getElementById("default");
  elems.editor = document.getElementById("editor");

  elems.add = document.getElementById("additionals");
  elems.addSel = document.getElementById("additionals-select");
  elems.addCfg = document.getElementById("additional-config");
  elems.addName = document.getElementById("additional-name");

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

var additionals = [];

function addElement(name, id) {
  var br = "";
  if (!elems.add.innerHTML.endsWith("<br>\n") && elems.add.innerHTML !== "") br = "<br>\n";

  // i know this is really bad practice but i don't really care that much
  elems.add.innerHTML += `${br}<button class="expandable-menu-button" onclick="loadAdditional(${id})">${name}</button>\n<button class="red singlechar" onclick="removeAdditional(${id})">-</button><br>\n`
}

var additionalsFuncs = {
  "Sign": {
    add: () => {
      var textbox = document.getElementById("Sign.text");
      var index = additionals.length;
      additionals.push({type: "Sign", data: textbox.value});
      textbox.value = "";
      
      addElement("Sign", index);
    },
    load: (id) => {
      var textbox = document.getElementById("Sign.text");
      textbox.value = additionals[id].data;
    },
    reload: (id) => {
      addElement("Sign", id);
    }
  }
}

function loadAdditional(id) {
  var add = elems.addSel.value;
  elems.addCfg.style = "";
  elems.addName.innerText = `Add a ${add}:`;
  document.getElementById(add).style = "";

  if (id !== undefined) additionalsFuncs[add].load(id);
}

function addAdditional() {
  var add = elems.addSel.value;
  elems.addCfg.style = "display: none;";
  document.getElementById(add).style = "display: none;";

  additionalsFuncs[add].add();
}

function removeAdditional(id) {
  if (additionals.length > 1) {
    additionals.splice(id, 1) 
  } else {
    additionals = [];
  }
  //remove that stupid element
  var split = elems.add.innerHTML.split("<br>");
  split.pop(); // remove the last (empty) one

  split.splice(id, 1);

  elems.add.innerHTML = split.join("<br>");
}

function loadAdditionals(room) {

  additionals = room.additionals;
  elems.add.innerHTML = "";
  
  for (var i in additionals) {
    additionalsFuncs[additionals[i].type].reload(i);
  }
}