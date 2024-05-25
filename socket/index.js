const { server } = require('../index.js');
const socket = require("socket.io");
const io = socket(server);

io.on('connection', (socket) => {
    console.log('A user connected', socket.id);

    socket.on("join_room", (data) => {
        socket.join(data);
        console.log("User Joined Room: " + data);
    });

    socket.on("send_message", (data) => {
        console.log(data);
        socket.to(data.room).emit("receive_message", data.content);
    });
    socket.on('disconnect', () => {
        console.log('User disconnected', socket.id);
    });
});