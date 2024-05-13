const express = require("express");
const cors = require("cors");
const mongoose = require('mongoose');
const morgan = require("morgan");
const swaggerUI = require("swagger-ui-express");
const swaggerJsDoc = require("swagger-jsdoc");
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

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
// Database - Model
require("./models/block");
require("./models/collection");
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
app.use("/blocks", require("./routes/blocks"));
app.use("/collections", require("./routes/collections"));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`The server is running on http://localhost:${PORT}`));