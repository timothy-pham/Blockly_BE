const express = require("express");
const router = express.Router();
const controller = require("../controllers/collection");

/**
 * @swagger
 * components:
 *   schemas:
 *     Collection:
 *       type: object
 *       required:
 *         - name
 *         - blocks
 *         - type
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the collection
 *         name:
 *           type: string
 *           description: The collection name
 *         meta_data:
 *           type: object
 *           description: Additional metadata for the collection
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: The timestamp of when the collection was created
 *         update_at:
 *           type: string
 *           format: date-time
 *           description: The timestamp of when the collection was last updated
 *         timestamp:
 *           type: number
 *           description: The Unix timestamp of when the collection was created
 *       example:
 *         id: d5fE_asz
 *         name: Collection 1
 *         meta_data: {}
 *         created_at: '2024-05-20T10:00:00.000Z'
 *         update_at: '2024-05-20T10:00:00.000Z'
 *         timestamp: 1621486800
 */

/**
 * @swagger
 * tags:
 *   name: Collections
 *   description: The collections managing API
 */

/**
 * @swagger
 * /collections:
 *   get:
 *     summary: Returns the list of all the collections
 *     tags: [Collections]
 *     responses:
 *       200:
 *         description: The list of the collections
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Collection'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message
 */


router.get("/", controller.getAllCollections);

router.get("/:id", controller.getCollectionById);


/**
 * @swagger
 * /collections:
 *   post:
 *     summary: Create a new collection
 *     tags: [Collections]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [practice, competition, quiz]
 *               meta_data:
 *                 type: object
 *             example:
 *               name: Collection 1
 *               meta_data: {"description": "This is a collection"}
 *     responses:
 *       201:
 *         description: New collection created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Collection'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message
 */

router.post("/", controller.createCollection);

router.patch("/:id", controller.updateCollection);

router.delete("/:id", controller.deleteCollection);

module.exports = router;