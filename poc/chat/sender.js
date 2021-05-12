const io = require('socket.io-client');

var socket = io('http://localhost:3000?token=vwQaYHBAuNwkS9JgVsYx2X0dOEf6kuOKA5k5GrN2WBtCMOdUYz0cSUn1iL4OlG9J&uid=4&ctx=meeting&ctxId=084-767-321');
console.log('Connected!');

socket.emit('chatmessage', {ctx: 'meeting', ctxId: '757-216-473', type: 'text', value: 'Hi There!'});
console.log('Message sent!');