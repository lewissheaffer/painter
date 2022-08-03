const hostURL = "painterserver.azurewebsites.net"; //"localhost:8080";

var canvas = document.getElementsByTagName("canvas")[0];
var undoButton = document.getElementById("undoButton");
var context = canvas.getContext("2d");
var height = canvas.height = 200;
var width = canvas.width = 300;
var savedData = []
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
    { text: 'Sorry, but your browser doesn\'t support WebSocket.' }
  ));

  canvas.hide();
}
// open connection
var connection = new WebSocket(`ws://${hostURL}`);
connection.onopen = function () {
  console.log("connected")
  connection.send("This is a test");
};

connection.onerror = function (error) {
  // just in there were some problems with connection...
  content.html($('<p>', {
    text: 'Sorry, but there\'s some problem with your '
      + 'connection or the server is down.'
  }));
};

//Handle incoming websocket messages
connection.onmessage = function (message) {
  // try to parse JSON message. Because we know that the server
  try {
    var data = message.data
    //var json = JSON.parse(message.data);
  } catch (e) {
    console.log('Invalid JSON: ', message.data);
  }
  if (data === 'update') { // entire message history
    console.log("Websocket message recieved")
    retrieveUpdate();
  }
  else if (data === 'history') { // entire message history
    retrieveHistory();

  } else if (data === 'undo') {
    console.log('undoing')
    undoDrawing();
  }
  else {
    console.log('Hmm..., I\'ve never seen JSON like this:', data);
  }
};

/**
 * If the server wasn't able to
 * respond to the in 3 seconds then show some error message
 * to notify the user that something is wrong.
 */
setInterval(function () {
  if (connection.readyState !== 1) {
    console.log("error: server failed to respond")
  }
}, 3000);


function onUndoButtonClick(e) {
  if (savedData.length > 0) {
    var imgData = savedData.pop();
    context.putImageData(imgData, 0, 0);
    //Send a message through websockets indicating undo
    connection.send("undo");
  }
}

function undoDrawing() {
  if (savedData.length > 0) {
    var imgData = savedData.pop();
    context.putImageData(imgData, 0, 0);
    //Send a message through websockets indicating undo
  }
}

//Will execute on release of the mouse
function onMouseClick(e) {
  mouseClicked = false;
  sendUpdate(savedData[savedData.length - 1])
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

function sendUpdate(canvasObject) {
  const canvasUrl = canvas.toDataURL()
  fetch('http://${hostURL}/update', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ "url": canvasUrl }),
  })
    .then(response => {
      console.log("sending websocket update message")
      connection.send('update')
    })
    .catch((error) => {
      console.error('Error:', error);
    });
}

function retrieveUpdate() {
  fetch('http://${hostURL}/getUpdate')
    .then(response => response.json())
    .then(data => {
      dataURL = data.url
      var img = new Image;
      img.src = dataURL;
      savedData.push(img);
      img.onload = () => { context.drawImage(img, 0, 0); };
    })
    .catch((error) => {
      console.error('Error:', error);
    });
}

function retrieveHistory() {
  fetch('http://${hostURL}/history')
    .then(response => response.json())
    .then(data => {
      dataURL = data.url
      var img = new Image;
      img.src = dataURL;
      savedData.push(img);
      img.onload = () => { context.drawImage(img, 0, 0); };
      // savedData = data.history;
      // console.log(savedData[savedData.length - 1].canvasObject);
      // context.putImageData(savedData[savedData.length - 1].canvasObject, 0, 0);
    })
    .catch((error) => {
      console.error('Error:', error);
    });
}
