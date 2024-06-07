const express = require("express");
const router = express.Router();
const controller = require("../controllers/collection");


router.get("/", controller.getAllCollections);

router.get("/export", controller.exportCollection);

router.get("/:id", controller.getCollectionById);

router.post("/", controller.createCollection);

router.post("/import", controller.importCollection);

router.patch("/:id", controller.updateCollection);

router.delete("/:id", controller.deleteCollection);

module.exports = router;

/**
 * @swagger
 * components:
 *   schemas:
 *     Collection:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: The name of the collection.
 *           example: My Collection
 *         meta_data:
 *           type: object
 *           description: Additional metadata for the collection.
 *           example: {}
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: The timestamp of when the collection was created.
 *           example: '2024-05-17T12:30:45.000Z'
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: The timestamp of when the collection was last updated.
 *           example: '2024-05-17T12:30:45.000Z'
 *         timestamp:
 *           type: number
 *           description: The Unix timestamp of when the collection was created.
 *           example: 1621260645
 */

/**
 * @swagger
 * tags:
 *   name: Collection
 *   description: API endpoints for managing collections
 */

/**
 * @swagger
 * /collections:
 *   get:
 *     summary: Retrieve all collections
 *     tags: [Collection]
 *     responses:
 *       200:
 *         description: A list of collections
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Collection'
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /collections/{id}:
 *   get:
 *     summary: Retrieve a single collection by ID
 *     tags: [Collection]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Collection ID
 *     responses:
 *       200:
 *         description: A single collection object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Collection'
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /collections:
 *   post:
 *     summary: Create a new collection
 *     tags: [Collection]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Collection'
 *     responses:
 *       201:
 *         description: The created collection object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Collection'
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /collections/{id}:
 *   patch:
 *     summary: Update a collection by ID
 *     tags: [Collection]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Collection ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Collection'
 *     responses:
 *       200:
 *         description: The updated collection object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Collection'
 *       404:
 *         description: Collection not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /collections/{id}:
 *   delete:
 *     summary: Delete a collection by ID
 *     tags: [Collection]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Collection ID
 *     responses:
 *       200:
 *         description: Collection deleted successfully
 *       404:
 *         description: Collection not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Collection:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: The name of the collection.
 *         meta_data:
 *           type: object
 *           description: Additional metadata for the collection.
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: The timestamp of when the collection was created.
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: The timestamp of when the collection was last updated.
 *         timestamp:
 *           type: number
 *           description: The Unix timestamp of when the collection was created.
 */
