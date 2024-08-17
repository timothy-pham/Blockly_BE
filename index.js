const express = require("express");
const cors = require("cors");
const mongoose = require('mongoose');
const morgan = require("morgan");
const swaggerUI = require("swagger-ui-express");
const swaggerJsDoc = require("swagger-jsdoc");
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const http = require('http');
const { encryptJSON, decrypt } = require('./utils/encryption');
require('dotenv').config()

// Swagger
const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "BLockly API",
            version: "1.0.0",
            description: "BLockly API - 👋🌎🌍🌏",
            contact: {
                name: "DATONS Team",
                email: "phamtiendat.dev@gmail.com",
            }
        },


        servers: [
            {
                "url": "https://api.timothypham.io.vn",
                "description": "Production server"
            }
        ],
    },
    apis: ["./routes/*.js"],
};
const specs = swaggerJsDoc(options);

// General
const app = express();
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(specs, {
    customSiteTitle: 'Blockly API Docs - DATONS',
}));
app.use(cors());
app.use(morgan("dev"));
// Cấu hình parser
app.use(cookieParser());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
// Database
// Database - Connect
const Room = require('./models/room');
const db_url = process.env.DATABASE_URL || "mongodb://root:timothydatonsthanhson@localhost:27018/blockly?authSource=admin";
const maxRetries = 5;
const retryDelay = 5000;

function connectToDatabase(attempt = 1) {
    console.log(`Connecting to database (Attempt ${attempt}/${maxRetries}):`, db_url);

    mongoose.connect(db_url, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }).then(() => {
        console.log('Kết nối cơ sở dữ liệu thành công');
        deleteWaitingRooms();
    }).catch((error) => {
        console.error('Lỗi kết nối cơ sở dữ liệu:', error);
        if (attempt < maxRetries) {
            console.log(`Retrying connection in ${retryDelay / 1000} seconds...`);
            setTimeout(() => connectToDatabase(attempt + 1), retryDelay);
        } else {
            console.error('Exceeded maximum retry attempts. Could not connect to the database.');
        }
    });
}

connectToDatabase();
const deleteWaitingRooms = async () => {
    try {
        const result = await Room.deleteMany({ status: 'waiting' });
        console.log(`Deleted ${result.deletedCount} rooms with status 'waiting'`);
        // set all rooms playing to finished
        const result2 = await Room.updateMany({ status: 'playing' }, { status: 'finished' });
        console.log(`Updated ${result2.modifiedCount} rooms with status 'playing' to 'finished'`);
    } catch (error) {
        console.error('Error deleting rooms with status waiting', error);
    }
}

const deleteAllRoomsInterval = async (io) => {
    try {
        const job = async () => {
            const result = await Room.deleteMany({ status: 'waiting', created_at: { $lt: new Date(Date.now() - 15 * 60000) } });
            console.log(`JOB: Deleted ${result.deletedCount} rooms with status 'waiting'`);
            io.emit("refresh_rooms");
        }
        setInterval(job, 15 * 60000);
    } catch (error) {
        console.error('Error deleting rooms with status finished', error);
    }
}

const PORT = process.env.PORT || 8000;
const server = http.createServer(app); // Create the server using the HTTP module

server.listen(PORT, () => console.log(`The server is running on http://localhost:${PORT}`));

// SOCKET.IO
const socketIO = require("socket.io");
const io = socketIO(server, {
    cors: {
        origin: "*", // Adjust this to restrict the allowed origins
        methods: ["GET", "POST"]
    }
});

const onlineUsers = {};
io.on('connection', (socket) => {
    socket.on('user_connected', (data) => {
        onlineUsers[socket.id] = {
            user_id: data?.user_id,
            user: data
        };
        io.onlineUsers = onlineUsers;
        socket.join(`user_${data?.user_id}`);
    });
    // COMPETITION 
    socket.on("join_room", async (data) => {
        try {
            socket.join(data.room_id);
            socket.room_id = data.room_id;
            socket.user_id = data.user_id;
            socket.user = data.user;
            const room_data = await roomController.joinRoom(data.room_id, data.user_id);
            // const messages = await messageController.getMessages(data.room_id);

            // Emit to the room that a user has joined
            if (room_data) {
                io.to(data.room_id).emit("user_joined", room_data);
                io.to(data.room_id).emit("receive_messages", [
                    { user_id: data?.user_id, message: `${data.user?.name} vừa tham gia vào phòng!` }
                ]);
                io.to(data.room_id).emit("new_user", { user_id: data.user_id })
            }
        } catch (error) {
            console.error("Error joining room:", error);
        }
    });

    socket.on("leave_room", async (data) => {
        try {
            const roomData = await roomController.leaveRoom(socket.room_id, socket.user_id);
            if (roomData && roomData.status == 'waiting') {
                io.to(socket.room_id).emit("user_left", socket.user_id);
                io.to(socket.room_id).emit("receive_messages", [
                    { user_id: data?.user_id, message: `${data.user?.name} đã rời khỏi phòng!` }
                ]);
            } else {
                io.emit("refresh_rooms");
            }
        } catch (error) {

        }
    });

    socket.on("user_ready", async (data) => {
        console.log("ON READY", socket.room_id, socket.user_id, data)
        const room_data = await roomController.userReady(socket.room_id, socket.user_id, data);
        if (room_data) {
            io.to(socket.room_id).emit("user_ready", room_data);
        }
    });

    socket.on("kick_user", async (data) => {
        const { room_data, userKicked } = await roomController.kickUser(socket.room_id, data, socket.user_id);
        if (room_data && userKicked) {
            io.to(socket.room_id).emit("kick_user", { room_data, userKicked });
        }
    });

    socket.on("start_game", async () => {
        const room_data = await roomController.startGame(socket.room_id, socket.user_id);
        if (room_data) {
            console.log("START GAME", socket.room_id)
            io.to(socket.room_id).emit("start_game", room_data);
            await roomController.handleBot(socket.room_id, io);
            await roomController.endGame(socket.room_id, io);
            io.emit("refresh_rooms");
        }
    });

    socket.on("ranking_update", async (data) => {
        if (data?.wrong) {
            const room_data = await roomController.updateWrong(socket.room_id, { user_id: socket.user_id, block: data }, io);
            if (room_data) {
                io.to(socket.room_id).emit("ranking_update", room_data);
            }
        } else {
            const room_data = await roomController.updateRanking(socket.room_id, { user_id: socket.user_id, block: data }, io);
            if (room_data) {
                io.to(socket.room_id).emit("ranking_update", room_data);
            }
        }

    });

    // THEO DÕI thi đấu
    socket.on("follow_user", (data) => {
        const { user_to, room_id } = data;
        socket.join(`follow_${user_to}_${room_id}`);
        // console.log("Follow", `follow_${user_to}_${room_id}`);
    });

    socket.on('cursorPosition', (data) => {
        const { position, userId } = data;
        // console.log("CURSOR POSITION", data, `follow_${userId}_${socket.room_id}`);
        io.to(`follow_${userId}_${socket.room_id}`).emit('cursorPosition', position);
    });

    socket.on("unfollow_user", (data) => {
        const { user_to, room_id } = data;
        socket.leave(`follow_${user_to}_${room_id}`);
        // console.log("Unfollow", `follow_${user_to}_${room_id}`);
    });
    // END THEO DÕI

    // Mời người chơi
    socket.on("invite_user", async (data) => {
        const { room, user_id } = data;
        io.to(`user_${user_id}`).emit("invite_user", { room: room, user_from: socket.user });
    });

    socket.on("user_finish", async (data) => {
        const room_data = await roomController.userFinish(socket.room_id, socket.user_id, data);
        if (room_data) {
            io.to(socket.room_id).emit("user_finish", room_data);
            let isAllFinished = true;
            room_data.users.forEach(user => {
                if (user.status !== 'finished') {
                    isAllFinished = false;
                }
            });
            if (isAllFinished) {
                await roomController.endGameNow(socket.room_id, io);
            }
        }
    });
    // ADD BOT
    socket.on("add_bot", async (data) => {
        const room_data = await roomController.addBot(socket.room_id, data);
        if (room_data) {
            io.to(data.room_id).emit("user_joined", room_data);
            io.to(data.room_id).emit("new_user", { user_id: data.user_id })
        }
    });

    // END COMPETITION

    // CHAT
    socket.on("send_message", async (data) => {
        const { room_id, user_id, message } = data;
        io.to(room_id).emit("receive_messages", { user_id, user: socket.user, message: message });
    });
    socket.on("send_message_to_all", async (data) => {
        try {
            console.log("SEND MESSAGE TO ALL", data)
            io.emit("receive_messages_to_all", { user_id: data.user_id, user: data.user, message: data.message, time: data.time });
        } catch (error) {
            console.error("Error sending message to all:", error);
        }
    });
    socket.on("join_chat", async (data) => {
        socket.join(`message_${data.message_id}`);
        socket.message_id = data.message_id;
        socket.user_id = data.user_id;
        socket.user = data.user;
    });

    // DISCONNECT
    socket.on('disconnect', () => {
        console.log("DISCONNECT", socket.id);
        delete onlineUsers[socket.id];
        io.onlineUsers = onlineUsers;
        // console.log(`User Disconect - UserID: ${socket.user_id}, Room ID: ${socket.room_id}`);
        // roomController.leaveRoom(socket.room_id, socket.user_id);
        // io.to(socket.room_id).emit("user_left", socket.user_id);
    });
});

// Router
const attachIO = (req, res, next) => {
    req.io = io;
    next();
};

app.use(attachIO);
const roomController = require("./controllers/room");
const messageController = require("./controllers/message");
const { authenticate } = require("./middlewares/auth.js");
app.use("/", require("./routes/index"));
app.use("/collections", authenticate, require("./routes/collections"));
app.use("/groups", authenticate, require("./routes/groups"));
app.use("/blocks", authenticate, require("./routes/blocks"));
app.use("/users", authenticate, require("./routes/users"));
app.use("/auth", require("./routes/auth"));
app.use("/histories", authenticate, require("./routes/histories"));
app.use("/rooms", authenticate, require("./routes/room"));
app.use("/notifications", authenticate, require("./routes/notifications"));
app.use("/messages", authenticate, require("./routes/message"));
app.use("/tickets", authenticate, require("./routes/ticket"));

deleteAllRoomsInterval(io);