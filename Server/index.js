"use strict";
// Optioal. You will see this name in eg. 'ps' or 'top' command
process.title = 'node-chat';
// Port where we'll run the websocket server
var webSocketsServerPort = 8080;

var express = require('express');
var cors = require('cors')
var app = express();
var expressWs = require('express-ws')(app);

//Current canvas object url 
let canvasUrl = null;

//List of client connections
let clients = []

app.use(express.json());
app.use(cors());

app.get('/getRoute', function (req, res, next) {
  console.log('get route');
  res.json({ 'route': 'name' });
});

app.post('/update', function (req, res, next) {
  // console.log('update');
  canvasUrl = req.body.url
  res.send("done!");
});

app.get('/history', function (req, res, next) {
  console.log('history request');
  res.json({ 'url': canvasUrl });
});

app.get('/getUpdate', function (req, res, next) {
  res.json({ 'url': canvasUrl });
});

app.ws('/', function (ws, req) {
  ws.on('close', () => {
    //Remove the client upon their loss of connection
    clients.forEach((item, index) => {
      if (item == ws) {
        console.log("Deleting specific client")
        clients.splice(index, 1);
      }
    })
  })
  ws.on('message', function (msg) {
    if (msg == "update") {
      clients.forEach((item, index) => {
        if (item != ws) {
          item.send("update")
        }
      })
    }
    else if (msg == "undo") {
      clients.forEach((item, index) => {
        if (item != ws) {
          item.send("undo")
        }
      })
    }
  });

  //The following code will execute upon connection from a client
  clients.push(ws)
  if (canvasUrl) {
    console.log("Sending History")
    ws.send("history");
  }
  console.log("Client Connected!")

});

app.listen(8080);