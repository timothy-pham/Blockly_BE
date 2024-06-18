const express = require("express");
const router = express.Router();
const controller = require("../controllers/message.js");

router.get("/", controller.getMessages);

router.post("/send/:id", controller.sendMessage);

router.post("/", controller.createMessage);

module.exports = router;
/**
 * @swagger
 * components:
 *   schemas:
 *     Message:
 *       type: object
 *       properties:
 *         message_id:
 *           type: integer
 *           description: The ID of the message.
 *         name:
 *           type: string
 *           description: The name of the message room.
 *         room_id:
 *           type: integer
 *           description: The ID of the room.
 *         messages:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               user_id:
 *                 type: integer
 *                 description: The ID of the user who sent the message.
 *               message:
 *                 type: string
 *                 description: The content of the message.
 *               send_at:
 *                 type: string
 *                 format: date-time
 *                 description: The timestamp of when the message was sent.
 *               timestamp:
 *                 type: integer
 *                 description: The Unix timestamp of when the message was sent.
 *         meta_data:
 *           type: object
 *           description: Additional metadata for the message.
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: The timestamp of when the message was created.
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: The timestamp of when the message was last updated.
 *         timestamp:
 *           type: integer
 *           description: The Unix timestamp of when the message was created.
 * tags:
 *   - name: Message
 *     description: API endpoints for managing messages
 * paths:
 *   /messages:
 *     get:
 *       summary: Get all messages
 *       tags: [Message]
 *       responses:
 *         200:
 *           description: A list of messages.
 *           content:
 *             application/json:
 *               schema:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/Message'
 *         500:
 *           description: Internal server error
 *     post:
 *       summary: Create a new message
 *       tags: [Message]
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users:
 *                   type: array
 *                   items:
 *                     type: integer
 *                   description: An array of user IDs in the message room.
 *                 type:
 *                   type: string
 *                   description: The type of message room.
 *                 meta_data:
 *                   type: object
 *                   description: Additional metadata for the message.
 *       responses:
 *         201:
 *           description: The message was successfully created.
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/Message'
 *         500:
 *           description: Internal server error
 *   /messages/send/{id}:
 *     post:
 *       summary: Send a message to a specific conversation
 *       tags: [Message]
 *       parameters:
 *         - in: path
 *           name: id
 *           required: true
 *           schema:
 *             type: integer
 *           description: message_id to which the message is being sent.
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user_id:
 *                   type: integer
 *                   description: The ID of the user sending the message.
 *                 message:
 *                   type: string
 *                   description: The content of the message.
 *       responses:
 *         200:
 *           description: The message was successfully sent.
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/Message'
 *         400:
 *           description: Bad request
 *         500:
 *           description: Internal server error
 */