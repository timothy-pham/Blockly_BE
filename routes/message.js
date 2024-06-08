const express = require("express");
const router = express.Router();
const controller = require("../controllers/message.js");

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
 */

/**
 * @swagger
 * tags:
 *   name: Message
 *   description: API endpoints for managing messages
 */

/**
 * @swagger
 * /messages:
 *   post:
 *     summary: Create a new message
 *     tags: [Message]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               room_id:
 *                 type: integer
 *                 description: The ID of the room.
 *               user_id:
 *                 type: integer
 *                 description: The ID of the user creating the message.
 *               name:
 *                 type: string
 *                 description: The name of the message room.
 *               meta_data:
 *                 type: object
 *                 description: Additional metadata for the message.
 *     responses:
 *       201:
 *         description: The message was successfully created.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Message'
 *       500:
 *         description: Internal server error
 */
