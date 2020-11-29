var canvas = document.getElementsByTagName("canvas")[0];
var context = canvas.getContext("2d");
var height = canvas.height = window.innerHeight;
var width = canvas.width = window.innerWidth;

var mouseClicked = false, mouseReleased = true;

document.addEventListener("click", onMouseClick, false);
document.addEventListener("mousemove", onMouseMove, false);

function onMouseClick(e) {
    mouseClicked = !mouseClicked;
}

function onMouseMove(e) {
    if (mouseClicked) {
        context.beginPath();
        context.arc(e.clientX, e.clientY, 7.5, 0, Math.PI * 2, false);
        context.lineWidth = 5;
        context.strokeStyle = "#000";
        context.stroke();
    }
}
