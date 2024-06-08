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

/**
 * @swagger
 * components:
 *   schemas:
 *     Room:
 *       type: object
 *       properties:
 *         room_id:
 *           type: integer
 *           description: The ID of the room.
 *         name:
 *           type: string
 *           description: The name of the room.
 *         description:
 *           type: string
 *           description: The description of the room.
 *         status:
 *           type: string
 *           description: The status of the room.
 *           enum: [waiting, playing, finished]
 *         users:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               user_id:
 *                 type: integer
 *                 description: The ID of the user.
 *               user_data:
 *                 type: object
 *                 description: Data associated with the user.
 *               blocks:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: List of blocks associated with the user.
 *               score:
 *                 type: integer
 *                 description: The score of the user.
 *               end_timestamp:
 *                 type: integer
 *                 description: The Unix timestamp of when the user ended the game.
 *               end_time:
 *                 type: string
 *                 format: date-time
 *                 description: The time when the user ended the game.
 *               is_ready:
 *                 type: boolean
 *                 description: Whether the user is ready.
 *               is_host:
 *                 type: boolean
 *                 description: Whether the user is the host.
 *               is_connected:
 *                 type: boolean
 *                 description: Whether the user is connected.
 *         meta_data:
 *           type: object
 *           description: Additional metadata for the room.
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: The timestamp of when the room was created.
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: The timestamp of when the room was last updated.
 *         timestamp:
 *           type: integer
 *           description: The Unix timestamp of when the room was created.
 */

/**
 * @swagger
 * tags:
 *   name: Room
 *   description: API endpoints for managing rooms
 */

/**
 * @swagger
 * /rooms:
 *   get:
 *     summary: Get all rooms
 *     tags: [Room]
 *     responses:
 *       200:
 *         description: List of all rooms
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Room'
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /rooms/histories:
 *   get:
 *     summary: Get room histories
 *     tags: [Room]
 *     responses:
 *       200:
 *         description: List of all room histories
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Room'
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /rooms/histories/{user_id}:
 *   get:
 *     summary: Get user histories by user ID
 *     tags: [Room]
 *     parameters:
 *       - in: path
 *         name: user_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the user
 *     responses:
 *       200:
 *         description: List of user histories
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Room'
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /rooms/{room_id}:
 *   get:
 *     summary: Get a single room by ID
 *     tags: [Room]
 *     parameters:
 *       - in: path
 *         name: room_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the room
 *     responses:
 *       200:
 *         description: A single room
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Room'
 *       404:
 *         description: Room not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /rooms:
 *   post:
 *     summary: Create a new room
 *     tags: [Room]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name of the room.
 *               description:
 *                 type: string
 *                 description: The description of the room.
 *               status:
 *                 type: string
 *                 description: The status of the room.
 *                 enum: [waiting, playing, finished]
 *               users:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     user_id:
 *                       type: integer
 *                       description: The ID of the user.
 *                     user_data:
 *                       type: object
 *                       description: Data associated with the user.
 *                     blocks:
 *                       type: array
 *                       items:
 *                         type: string
 *                       description: List of blocks associated with the user.
 *                     score:
 *                       type: integer
 *                       description: The score of the user.
 *                     end_timestamp:
 *                       type: integer
 *                       description: The Unix timestamp of when the user ended the game.
 *                     end_time:
 *                       type: string
 *                       format: date-time
 *                       description: The time when the user ended the game.
 *                     is_ready:
 *                       type: boolean
 *                       description: Whether the user is ready.
 *                     is_host:
 *                       type: boolean
 *                       description: Whether the user is the host.
 *                     is_connected:
 *                       type: boolean
 *                       description: Whether the user is connected.
 *               meta_data:
 *                 type: object
 *                 description: Additional metadata for the room.
 *     responses:
 *       201:
 *         description: The room was successfully created.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Room'
 *       500:
 *         description: Internal server error
 */
