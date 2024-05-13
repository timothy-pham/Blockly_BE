const express = require("express");
const router = express.Router();
const Block = require("../models/block");
const moment = require('moment');

/**
 * @swagger
 * components:
 *   schemas:
 *     Block:
 *       type: object
 *       required:
 *        - name
 *        - slug
 *        - data
 *        - question
 *        - answer
 *        - level
 *        - meta_data
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the block
 *         name:
 *           type: string
 *           description: The block name
 *         slug:
 *           type: string
 *           description: The block slug
 *         data:
 *           type: object
 *           description: The block data
 *         question:
 *           type: string
 *           description: The block question
 *         answer:
 *           type: string
 *           description: The block answer
 *         level:
 *           type: number
 *           description: The block level
 *         meta_data:
 *           type: object
 *           description: The block meta data
 *       example:
 *         id: d5fE_asz
 *         name: Block 1
 *         slug: block-1
 *         data: {}
 *         question: What is this block about?
 *         answer: This block is about...
 *         level: 1
 *         meta_data: {}
 */

/**
 * @swagger
 * tags:
 *   name: Blocks
 *   description: The blocks managing API
 */

/**
 * @swagger
 * /blocks:
 *   get:
 *     summary: Returns the list of all the blocks
 *     tags: [Blocks]
 *     responses:
 *       200:
 *         description: The list of the blocks
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Block'
 */

router.get("/", async (req, res) => {
    try {
        const blocks = await Block.find();
        res.status(200).json(blocks);
    } catch (error) {
        console.log("BLOCKS_GET_ERROR", error)
        res.status(500).json({ message: error });
    }
});

/**
 * @swagger
 * /blocks:
 *   post:
 *     summary: Create a new block
 *     tags: [Blocks]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               data:
 *                 type: object
 *               question:
 *                 type: string
 *               answer:
 *                 type: string
 *               level:
 *                 type: number
 *               meta_data:
 *                 type: object
 *             example:
 *               name: Block 1
 *               data: {}
 *               question: What is this block about?
 *               answer: This block is about...
 *               level: 1
 *               meta_data: {}
 *     responses:
 *       200:
 *         description: New block created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   description: The auto-generated id of the block
 *                 name:
 *                   type: string
 *                   description: The block name
 *                 data:
 *                   type: object
 *                   description: The block data
 *                 question:
 *                   type: string
 *                   description: The block question
 *                 answer:
 *                   type: string
 *                   description: The block answer
 *                 level:
 *                   type: number
 *                   description: The block level
 *                 meta_data:
 *                   type: object
 *                   description: The block meta data
 *                 created_at:
 *                   type: string
 *                   format: date-time
 *                   description: The timestamp of when the block was created
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
        const { name, data, question, answer, level, meta_data } = req.body;
        const block = new Block({
            name, data, question, answer, level, meta_data,
            // slug: slugify(name, { locale: 'vi', lower: true }),
            created_at: moment().format('MM/DD/YYYY, hh:mm:ss'),
            updated_at: moment().format('MM/DD/YYYY, hh:mm:ss'),
            timestamp: moment().unix()
        });
        const newBlock = await block.save();
        res.status(200).json(newBlock);
    } catch (error) {
        console.log("BLOCKS_POST_ERROR", error)
        res.status(500).json({ message: error });
    }
});

module.exports = router;