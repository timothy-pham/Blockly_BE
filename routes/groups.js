const express = require("express");
const router = express.Router();
const controller = require("../controllers/group");

router.get("/", controller.getAllGroups);

router.get("/:id", controller.getGroupById);

router.post("/", controller.createGroup);

router.patch("/:id", controller.updateGroup);

router.delete("/:id", controller.deleteGroup);

module.exports = router;