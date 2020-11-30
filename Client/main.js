var canvas = document.getElementsByTagName("canvas")[0];
var undoButton = document.getElementById("undoButton");
var context = canvas.getContext("2d");
var height = canvas.height = 200;
var width = canvas.width = 300;
savedData = []
var mouseClicked = false, mouseReleased = true;

canvas.addEventListener("click", onMouseClick, false);
canvas.addEventListener("mousemove", onMouseMove, false);
canvas.addEventListener("mousedown", onMouseDown);
undoButton.addEventListener("click", onUndoButtonClick);

function onUndoButtonClick(e) {
  if(savedData.length > 0) {
    var imgData = savedData.pop();
    context.putImageData(imgData,0,0);
  }
}

//Will execute on release of the mouse
function onMouseClick(e) {
    mouseClicked = false;
}

function onMouseDown(e) {
  mouseClicked = true;
  var imgData = context.getImageData(0, 0, width, height);
  savedData.push(imgData);
}

function onMouseMove(e) {
    if (mouseClicked && e.clientX <= width && e.clientY <= height) {
        context.beginPath();
        context.ellipse(e.clientX, e.clientY, 7.5, 7.5, 0, Math.PI * 2, false);
        context.lineWidth = 5;
        context.strokeStyle = "#000";
        context.fill();
        context.stroke();
    }
}
