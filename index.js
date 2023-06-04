const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();

var PORT = process.env.PORT || 8080;

const server = http.Server(app).listen(PORT);

var urlencodedparser = bodyParser.urlencoded({extended:false});

app.get("/", (req, res)=>{
    res.sendFile(__dirname + "/home.html");
});