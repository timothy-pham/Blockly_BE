const express = require("express");
const router = express.Router();
const controller = require("../controllers/user");

router.get("/", controller.getAllUsers);

router.get("/:id", controller.getUserById);

module.exports = router;