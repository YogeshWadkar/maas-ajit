var app = require("../../server/server");

module.exports = function(io) {
  if (io) {
    io.on("connection", async function(socket) {
      console.log("a user connected");

      //validate access token
      var token = socket.handshake.query.token;
      var accessToken = await app.models.AccessToken.findById(token);
      if (!accessToken) {
          socket.disconnect(true)
          throw 'Invalid access token'
      }

      //validate user id
      var toUserId = socket.handshake.query.uid;
      var toUser = await app.models.TTUser.findById(toUserId);
      if (!toUser) {
          socket.disconnect(true)
          throw 'Invalid user'
      }

      //validate context
      var ctx = socket.handshake.query.ctx;
      var ctxId = socket.handshake.query.ctxId;
      var ctxObj;
      if (ctx == 'meeting') {
          ctxObj = await app.models.Meeting.findOne({
              where: {
                  meetingId: ctxId
              }
          });
      }
      if (ctx == 'task') {
          ctxObj = await app.models.Task.findOne({
              where: {
                  taskId: ctxId
              }
          });
      }

      if (!ctxObj) {
          socket.disconnect(true)
          throw 'Invalid context detail'
      }

      var room = ctx + "-" + ctxId;
      socket.join(room, () => {
        console.log("joined room: " + room);
      });

      socket.on("disconnect", function() {
        console.log("user disconnected");
      });

      socket.on("chatmessage", async function(msg) {
        console.log("message: ", msg);

        //Example data -> msg = {ctx: 'meeting', ctxId: '123-244-121', type: 'text', value: 'Hi!!'}
        msg.fromUserId = accessToken.userId;
        msg.toUserId = toUser.id;
        var chat = await app.models.Chat.create(msg);
        socket.to(room).broadcast.emit("chatmessage", msg);

        
        var id = chat.ctxId;
        if (chat.ctx == 'meeting') {
            var meeting = await app.models.Meeting.findOne({
                where: {
                    meetingId: id
                }
            });
            await meeting.updateAttributes({
                hasChatLog: true
            });
        }

        if (chat.ctx == 'task') {
            var task = await app.models.Task.findOne({
                where: {
                    taskId: id
                }
            });
            await task.updateAttributes({
                hasChatLog: true
            });
        }
      });
    });
  }
};
