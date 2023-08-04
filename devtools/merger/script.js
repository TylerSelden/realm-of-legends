var finalFile = {};
var newFile = {};
var data = {};
var final = true;


// function uploadAll() {
//   handleUpload(true);
//   handleUpload(false);
//   merge();
// }

function handleUpload() {
  var input = document.createElement("input");
  input.type = "file";
  input.addEventListener("change", function() {
    var file = input.files[0];
    var reader = new FileReader();
    reader.addEventListener("load", function() {
      var jsonContent = reader.result;
      try {
        var process = {};
        eval(jsonContent); // I know this isn't super safe, users beware!!
        if (final) {
          finalFile = process.rooms;
          // document.getElementById("upload").onclick = handleUpload;
          // document.getElementById("upload").innerText = "Upload new JS file";
          final = false;
          handleUpload();
        } else {
          newFile = process.rooms;
          merge();
        }
      } catch(e) {
        alert("Invalid JS file.");
        console.error(e);
      }
    });
    reader.readAsText(file);
  });
  input.click();
}

function merge() {
  for (var x in newFile) {
    for (var y in newFile[x]) {
      for (var z in newFile[x][y]) {
        if (data[x] == undefined) data[x] = {};
        if (data[x][y] == undefined) data[x][y] = {};
        if (finalFile[x] !== undefined && finalFile[x][y] !== undefined && finalFile[x][y][z] !== undefined) {
          data[x][y][z] = finalFile[x][y][z];
        } else {
          data[x][y][z] = newFile[x][y][z];
        }
      }
    }
  }
  alert("Merge successful (you know, probably).");
  handleDownload();
}


function handleDownload() {
  var jsonString = `// The Rooms :/\n\nprocess.rooms = ${JSON.stringify(data, null, 2).replace(/"([^"\d]+)":/g, '$1:').replace(/"(-?\d+)",/g, '$1,').replace(/"(-?\d+)"\n/g, '$1\n')};`;
  var blob = new Blob([jsonString], { type: "text/js" });

  var a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "data.js";

  a.click();

  URL.revokeObjectURL(a.href);
}