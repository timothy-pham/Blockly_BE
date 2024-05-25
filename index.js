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
        },
        servers: [
        ],
    },
    apis: ["./routes/*.js"],
};
const specs = swaggerJsDoc(options);

// General
const app = express();
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(specs));
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
// Cấu hình parser
app.use(cookieParser());
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }))
app.use(bodyParser.json({ limit: '10mb' }))

// Database
// Database - Connect
const db_url = process.env.DATABASE_URL || "mongodb://localhost:27017/blockly";
mongoose.connect(db_url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Kết nối cơ sở dữ liệu thành công');
}).catch((error) => {
    console.error('Lỗi kết nối cơ sở dữ liệu:', error);
});

// Router
app.use("/", require("./routes/index"));
app.use("/collections", require("./routes/collections"));
app.use("/groups", require("./routes/groups"));
app.use("/blocks", require("./routes/blocks"));
app.use("/users", require("./routes/users"));
app.use("/auth", require("./routes/auth"));
app.use("/histories", require("./routes/histories"));
app.use("/rooms", require("./routes/room"));

const PORT = process.env.PORT || 4000;
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
io.on('connection', (socket) => {
    console.log('A user connected', socket.id);

    socket.on("join_room", async (data) => {
        try {
            socket.join(data.room_id);
            socket.room_id = data.room_id;
            socket.user_id = data.user_id;
            const room_data = await roomController.joinRoom(data.room_id, data.user_id);
            // Emit to the room that a user has joined
            if (room_data) {
                io.to(data.room_id).emit("user_joined", room_data);
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

    socket.on('disconnect', () => {
        console.log('User disconnected');
        console.log(`User ID: ${socket.user_id}, Room ID: ${socket.room_id}`);
        roomController.leaveRoom(socket.room_id, socket.user_id);
        io.to(socket.room_id).emit("user_left", socket.user_id);
    });

    socket.on("blockly_data", (data) => {
        console.log("Blockly Data", data);
        io.to(socket.room_id).emit("blockly_data", data);
    });
});