const express = require("express");
const router = express.Router();
const controller = require("../controllers/block");

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

router.get("/", controller.getAllBlocks);

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

router.get("/export", controller.exportBlocks);

router.get("/:id", controller.getBlockById);

router.post("/", controller.createBlock);

router.post("/import", controller.importBlocks);

router.patch("/:id", controller.updateBlock);

router.delete("/:id", controller.deleteBlock);

module.exports = router;