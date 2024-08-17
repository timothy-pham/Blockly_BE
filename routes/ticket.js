const express = require("express");
const router = express.Router();
const { authorize } = require("../middlewares/auth.js");
const controller = require("../controllers/ticket.js");

router.get("/", authorize(['admin']), controller.getTickets);

router.get("/:id", authorize(['admin']), controller.getTicketById);

router.get("/user/:id", controller.getUserTickets);

router.post("/", controller.createTicket);

router.post("/request/:id", controller.sendRequest);

router.post("/response/:id", authorize(['admin']), controller.sendResponse);

router.patch("/:id", authorize(['admin']), controller.updateTicket);

router.delete("/:id", authorize(['admin']), controller.deleteTicket);

module.exports = router;