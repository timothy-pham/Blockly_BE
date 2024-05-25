const express = require("express");
const router = express.Router();
const controller = require("../controllers/room.js");
const { authenticate } = require("../middleware/auth.js");
router.get("/", authenticate, controller.getAllRooms);

router.post("/", authenticate, controller.createRoom);
module.exports = router;