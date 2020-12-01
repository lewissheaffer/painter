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

// my color assigned by the server
var myColor = false;
// my name sent to the server
var myName = false;
// if user is running mozilla then use it's built-in WebSocket
window.WebSocket = window.WebSocket || window.MozWebSocket;
// if browser doesn't support WebSocket, just show
// some notification and exit
if (!window.WebSocket) {
  content.html($('<p>',
    { text:'Sorry, but your browser doesn\'t support WebSocket.'}
  ));

  canvas.hide();
}
// open connection
var connection = new WebSocket('ws://localhost:8080');
connection.onopen = function () {
  console.log("connected")
};
connection.onerror = function (error) {
  // just in there were some problems with connection...
  content.html($('<p>', {
    text: 'Sorry, but there\'s some problem with your '
       + 'connection or the server is down.'
  }));
};
// most important part - incoming messages
connection.onmessage = function (message) {
  // try to parse JSON message. Because we know that the server
  try {
    var json = JSON.parse(message.data);
  } catch (e) {
    console.log('Invalid JSON: ', message.data);
  }
  // NOTE: if you're not sure about the JSON structure
  // check the server source code above
  // first response from the server with user's color
  if (json.type === 'color') {
    myColor = json.data;
    // from now user can start sending messages
  } else if (json.type === 'history') { // entire message history
    // insert every single message to the chat window

  } else if (json.type === 'update') { // it's a single message
    savedData.add(json.newCanvasObject);

  } else if (json.type === 'undo') {
      onUndoButtonClick();
  }
  else {
    console.log('Hmm..., I\'ve never seen JSON like this:', json);
  }
};


/**
 * This method is optional. If the server wasn't able to
 * respond to the in 3 seconds then show some error message
 * to notify the user that something is wrong.
 */
setInterval(function() {
  if (connection.readyState !== 1) {
    console.log("error: server failed to respond")
  }
}, 3000);



function onUndoButtonClick(e) {
  if(savedData.length > 0) {
    var imgData = savedData.pop();
    context.putImageData(imgData,0,0);
    sendUpdate('undo', imgData);
  }
}

//Will execute on release of the mouse
function onMouseClick(e) {
    mouseClicked = false;
    sendUpdate('update', savedData[savedData.length - 1])
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

function sendUpdate(type, canvasObject) {
  let payload = {
    type: type,
    canvasObject: canvasObject,
  }
  //connection.send(JSON.stringify(payload));
  connection.send("this is a message");
}
