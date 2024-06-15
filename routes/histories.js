const express = require("express");
const router = express.Router();
const controller = require("../controllers/histories");
const { authorize } = require("../middlewares/auth.js");


router.get("/", controller.getAllHistory);
router.get("/statistics", controller.getStatistic);
router.get("/statistics/students", controller.getStatisticStudent);
router.get("/ranking", controller.getRanking);
router.get("/:id", controller.getHistoryById);
router.patch("/add-result/:id", controller.addResultToHistory);
router.post("/", controller.createHistory);
router.patch("/:id", authorize(['admin']), controller.updateHistory);
router.delete("/:id", authorize(['admin']), controller.deleteHistory);

module.exports = router;

/**
 * @swagger
 * components:
 *   schemas:
 *     History:
 *       type: object
 *       properties:
 *         histories_id:
 *           type: integer
 *           description: The ID of the history.
 *         type:
 *           type: string
 *           description: The type of history.
 *           enum: [normal, solo, multiplayer]
 *         user_id:
 *           type: integer
 *           description: The ID of the user associated with the history.
 *         room_id:
 *           type: integer
 *           description: The ID of the room associated with the history.
 *         collection_id:
 *           type: integer
 *           description: The ID of the collection associated with the history.
 *         group_id:
 *           type: integer
 *           description: The ID of the group associated with the history.
 *         result:
 *           type: array
 *           items:
 *             type: object
 *           description: The results of the history.
 *         meta_data:
 *           type: object
 *           description: Additional metadata for the history.
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: The timestamp of when the history was created.
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: The timestamp of when the history was last updated.
 *         timestamp:
 *           type: number
 *           description: The Unix timestamp of when the history was created.
 */

/**
 * @swagger
 * tags:
 *   name: History
 *   description: API endpoints for managing histories
 */

/**
 * @swagger
 * /histories:
 *   get:
 *     summary: Get all histories
 *     tags: [History]
 *     responses:
 *       200:
 *         description: List of all histories
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/History'
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /histories/ranking:
 *   get:
 *     summary: Get history rankings
 *     tags: [History]
 *     responses:
 *       200:
 *         description: List of history rankings
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/History'
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /histories/{id}:
 *   get:
 *     summary: Get history by ID
 *     tags: [History]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: History ID
 *     responses:
 *       200:
 *         description: History found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/History'
 *       404:
 *         description: History not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /histories:
 *   post:
 *     summary: Create a new history
 *     tags: [History]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_id:
 *                 type: integer
 *               room_id:
 *                 type: integer
 *               type:
 *                 type: string
 *                 enum: [normal, solo, multiplayer]
 *               collection_id:
 *                 type: integer
 *                 required: true
 *               group_id:
 *                 type: integer
 *                 required: true
 *               result:
 *                 type: array
 *                 items:
 *                   type: object
 *                 required: true
 *               meta_data:
 *                 type: object
 *     responses:
 *       201:
 *         description: History created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/History'
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /histories/{id}:
 *   patch:
 *     summary: Update a history by ID
 *     tags: [History]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: History ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_id:
 *                 type: integer
 *               room_id:
 *                 type: integer
 *               type:
 *                 type: string
 *                 enum: [normal, solo, multiplayer]
 *               collection_id:
 *                 type: integer
 *               group_id:
 *                 type: integer
 *               result:
 *                 type: array
 *                 items:
 *                   type: object
 *               meta_data:
 *                 type: object
 *     responses:
 *       200:
 *         description: History updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/History'
 *       404:
 *         description: History not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /histories/add-result/{id}:
 *   patch:
 *     summary: Add a result to a history
 *     tags: [History]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: History ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               result:
 *                 type: object
 *                 required: true
 *     responses:
 *       200:
 *         description: Result added to history successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/History'
 *       400:
 *         description: Block not found
 *       404:
 *         description: History not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /histories/{id}:
 *   delete:
 *     summary: Delete a history by ID
 *     tags: [History]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: History ID
 *     responses:
 *       200:
 *         description: History deleted successfully
 *       404:
 *         description: History not found
 *       500:
 *         description: Internal server error
 */
