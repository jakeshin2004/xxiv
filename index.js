const http = require("http");
const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const socketIo = require("socket.io");

const { genRoomID } = require("./helper-functions/roomid.js");
const { genCards, parseCards } = require("./helper-functions/cards.js");
const { setTimeout } = require("timers");

var PORT = process.env.PORT || 8080;

const server = http.Server(app).listen(PORT);
var io = socketIo(server);

var urlencodedparser = bodyParser.urlencoded({ extended: false });
var curRooms = {}; // list of currently active rooms
var curName; // var for user current name
var curRoomId;

app.use(express.static(__dirname + "/client"));

app.get("/", (req, res) => {
  // console.log(req.query.roomId);
  if (req.query.roomId != null) {
    res.sendFile(__dirname + "/client/waiting.html");
  } else {
    res.sendFile(__dirname + "/client/home.html");
  }
});

io.sockets.on("connection", (socket) => {
  console.log("Connection established: " + socket.id);

  socket.on("nickname", (name) => {
    curName = name;
    curRoomId = null;
    data = {
      "dir": "/waiting.html",
      "name": name
    }
    socket.emit("redirect-home", data);
  });

  socket.on("ready", () => {
    var roomId;
    if (curRoomId == null){
      roomId = genRoomID(curRooms);
      curRooms[roomId] = {};
      curRooms[roomId].players = [];
      curRooms[roomId].player_count = 0;
    } else {
      roomId = curRoomId;
    }
    curRooms[roomId].players.push(curName);
    curRooms[roomId].player_count++;
    socket.join(roomId);
    io.to(roomId).emit("post-redirect", {"name": curName, "code": roomId, "roomData": curRooms});
  });

  socket.on('join', (data) => {
    curName = data.name;
    curRoomId = data.roomcode;
    data = {
      "dir": "/waiting.html",
      "name": data.name
    }
    socket.emit('redirect-home', data)
  });

  socket.on("disconnect", (socket) => {
    console.log("Socket disconnected");

  });

  socket.on('redirect-to-game', (roomId) => {
    io.to(roomId).emit('redirect-game', "/game.html");
    curRoomId = roomId;
  });

  socket.on('ready-game', (data) => {
    socket.join(curRoomId);

    if (!("cardValues" in curRooms[curRoomId])){
      curRooms[curRoomId].cards = genCards();
      curRooms[curRoomId].cardValues = [];
      curRooms[curRoomId].playerScores = {};

      for (let i = 0; i < 4; ++i){
        curRooms[curRoomId].cardValues.push(parseCards(curRooms[curRoomId].cards[i]));
      }
    }

    if (Object.keys(curRooms[curRoomId].playerScores).length == 0) {
      for (let i = 0; i < curRooms[curRoomId].players.length; ++i){
        curRooms[curRoomId].playerScores[curRooms[curRoomId].players[i]] = 0;
      }
    }

    data = {
      "cards": curRooms[curRoomId].cards,
      "roomID": curRoomId,
      "room": curRooms[curRoomId],
    }

    io.to(curRoomId).emit('start', data);
  });

  socket.on('freeze', (roomID) => {
    curRooms[curRoomId].answered = false;
    socket.broadcast.to(roomID).emit('block-call');
    socket.emit('enable');

    setTimeout(() => {
      io.to(roomID).emit('disable');
    }, 10000);
  });

  socket.on('winner', (data) => {
    curRooms[curRoomId].playerScores[data.winner] += 4;
    curRooms[curRoomId].cards = genCards();
    curRooms[curRoomId].cardValues = [];
    for (let i = 0; i < 4; ++i){
        curRooms[curRoomId].cardValues.push(parseCards(curRooms[curRoomId].cards[i]));
      }
    res_data = {
      "cards": curRooms[curRoomId].cards,
      "roomID": curRoomId,
      "room": curRooms[curRoomId],
    }
    io.to(data.roomID).emit('start', res_data)
  });
});

