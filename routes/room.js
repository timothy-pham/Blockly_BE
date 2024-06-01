const express = require("express");
const router = express.Router();
const controller = require("../controllers/room.js");
const { authorize } = require("../middlewares/auth.js");
router.get("/", controller.getAllRooms);

router.get("/histories", controller.getRoomHistories);

router.get("/histories/:user_id", controller.getUserHistories);

router.get("/:room_id", controller.getRoom);

router.post("/", controller.createRoom);
module.exports = router;