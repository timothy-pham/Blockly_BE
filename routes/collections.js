const express = require("express");
const router = express.Router();
const Collection = require("../models/collection");
const moment = require('moment');
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
 *         blocks:
 *           type: array
 *           description: The blocks included in the collection
 *           items:
 *             $ref: '#/components/schemas/Block'
 *         type:
 *           type: string
 *           enum: [practice, competition, quiz]
 *           description: The type of the collection
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
 *         blocks: []
 *         type: practice
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


router.get("/", async (req, res) => {
    try {
        const collections = await Collection.find();
        res.status(200).json(collections);
    } catch (error) {
        console.log("BLOCKS_GET_ERROR", error)
        res.status(500).json({ message: error });
    }
});


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
 *               blocks:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/Block'
 *               type:
 *                 type: string
 *                 enum: [practice, competition, quiz]
 *               meta_data:
 *                 type: object
 *             example:
 *               name: Collection 1
 *               blocks: []
 *               type: practice
 *               meta_data: {}
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

router.post("/", async (req, res) => {
    try {
        const { name, blocks, type, meta_data } = req.body;
        const collection = new Collection({
            name,
            blocks,
            type,
            meta_data,
            created_at: moment().format(),
            update_at: moment().format(),
            timestamp: moment().unix()
        });
        await collection.save();
        res.status(201).json(collection);
    } catch (error) {
        console.log("BLOCKS_POST_ERROR", error)
        res.status(500).json({ message: error });
    }
});

module.exports = router;