const express = require("express");
const cors = require("cors");
const mongoose = require('mongoose');
const morgan = require("morgan");
const swaggerUI = require("swagger-ui-express");
const swaggerJsDoc = require("swagger-jsdoc");
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const http = require('http');

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
app.use(express.json());
app.use(morgan("dev"));
// Cấu hình parser
app.use(cookieParser());
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }))
app.use(bodyParser.json({ limit: '10mb' }))

// Database
// Database - Connect
const Room = require('./models/room');
const db_url = process.env.DATABASE_URL || "mongodb://root:timothydatonsthanhson@localhost:27018/blockly?authSource=admin";
console.log('Connecting to database:', db_url);
mongoose.connect(db_url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Kết nối cơ sở dữ liệu thành công');
    deleteWaitingRooms();
}).catch((error) => {
    console.error('Lỗi kết nối cơ sở dữ liệu:', error);
});

const deleteWaitingRooms = async () => {
    try {
        const result = await Room.deleteMany({ status: 'waiting' });
        console.log(`Deleted ${result.deletedCount} rooms with status 'waiting'`);
    } catch (error) {
        console.error('Error deleting rooms with status waiting', error);
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

const roomController = require("./controllers/room");
const messageController = require("./controllers/message");
io.on('connection', (socket) => {
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
                console.log("NEW USER", JSON.stringify(data.user))
                io.to(data.room_id).emit("receive_messages", [
                    { user_id: data?.user_id, message: `${data.user?.name} vừa tham gia vào phòng!` }
                ]);
                io.to(data.room_id).emit("new_user", { user_id: data.user_id })
            }
        } catch (error) {
            console.error("Error joining room:", error);
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
            await roomController.endGame(socket.room_id, io);
        }
    });

    socket.on("ranking_update", async (data) => {
        const room_data = await roomController.updateRanking(socket.room_id, { user_id: socket.user_id, block: data }, io);
        if (room_data) {
            io.to(socket.room_id).emit("ranking_update", room_data);
        }
    });

    socket.on("user_finish", async (data) => {
        console.log("ON FINISH", socket.room_id, socket.user_id, data)
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
                console.log("END GAME NOW", socket.user_id, socket.room_id)
                await roomController.endGameNow(socket.room_id, io);
            }
        }
    });

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
        console.log('User disconnected');
        console.log(`User ID: ${socket.user_id}, Room ID: ${socket.room_id}`);
        roomController.leaveRoom(socket.room_id, socket.user_id);
        io.to(socket.room_id).emit("user_left", socket.user_id);
    });
});

// Router
const attachIO = (req, res, next) => {
    req.io = io;
    next();
};

app.use(attachIO);
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