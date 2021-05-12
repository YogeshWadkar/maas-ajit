const io = require('socket.io-client');

var socket = io('http://localhost:3000?token=vwQaYHBAuNwkS9JgVsYx2X0dOEf6kuOKA5k5GrN2WBtCMOdUYz0cSUn1iL4OlG9J&uid=3&ctx=meeting&ctxId=084-767-321');
console.log('Connected!');

socket.on('chatmessage', function(msg) {

    console.log('Got message: ', msg);

});