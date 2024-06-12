const express = require("express");
const router = express.Router();
const controller = require("../controllers/user");
const { authorize } = require("../middlewares/auth.js");

router.get("/", authorize(['admin']), controller.getAllUsers);

router.get("/:id", authorize(['admin']), controller.getUserById);

module.exports = router;