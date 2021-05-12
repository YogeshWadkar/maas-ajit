const io = require('socket.io-client');

var socket = io('http://localhost:3000?token=6gSOXmfQyz3tcA6hJfdRzDIuFoo3ZWixcBt4QurXhiM8Urame9QRCaJbyAXWdrHw&uid=4&ctx=meeting&ctxId=084-767-321');
console.log('Connected!');

socket.on('chatmessage', function(msg) {

    console.log('Got message: ', msg);

});