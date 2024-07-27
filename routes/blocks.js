const express = require("express");
const router = express.Router();
const controller = require("../controllers/block");
const { authorize } = require("../middlewares/auth.js");

router.get("/", controller.getAllBlocks);

router.get("/search", controller.searchBlocks);

router.get("/random", controller.getRandomBlocks);

router.get("/:id", controller.getBlockById);

router.post("/check-answer", controller.checkAnswer);

router.post("/", authorize(['admin']), controller.createBlock);

router.post("/export", authorize(['admin']), controller.exportBlocks);

router.post("/import", authorize(['admin']), controller.importBlocks);

router.patch("/:id", authorize(['admin']), controller.updateBlock);

router.delete("/:id", authorize(['admin']), controller.deleteBlock);

module.exports = router;

/**
 * @swagger
 * tags:
 *   - name: Block
 *     description: Block management routes
 */

/**
 * @swagger
 * /blocks:
 *   get:
 *     summary: Get all blocks
 *     tags: [Block]
 *     responses:
 *       200:
 *         description: Blocks data
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Block'
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /blocks/search:
 *   get:
 *     summary: Search for blocks based on query parameters
 *     tags: [Block]
 *     parameters:
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: The name of the block to search for (supports partial matches).
 *       - in: query
 *         name: group_id
 *         schema:
 *           type: number
 *         description: The ID of the group the block belongs to.
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         description: The type of the block to search for.
 *       - in: query
 *         name: level
 *         schema:
 *           type: number
 *         description: The difficulty level of the block.
 *     responses:
 *       200:
 *         description: A list of blocks matching the search criteria
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Block'
 *       500:
 *         description: Internal server error
 */


/**
 * @swagger
 * /blocks/export:
 *   get:
 *     summary: Export all blocks
 *     tags: [Block]
 *     responses:
 *       200:
 *         description: JSON file containing all blocks
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Block'
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /blocks/{id}:
 *   get:
 *     summary: Get block by ID
 *     tags: [Block]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Block ID
 *     responses:
 *       200:
 *         description: Block data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Block'
 *       404:
 *         description: Block not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /blocks/check-answer:
 *   post:
 *     summary: Check answer for a block
 *     tags: [Block]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: number
 *               answers:
 *                 type: array
 *                 items:
 *                  type: string
 *     responses:
 *       200:
 *         description: Answer correctness
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 correct:
 *                   type: boolean
 *                 id:
 *                   type: string
 *                 answers:
 *                   type: array
 *                   items:
 *                      type: string
 *       404:
 *         description: Block not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /blocks:
 *   post:
 *     summary: Create a new block
 *     tags: [Block]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BlockRequest'
 *     responses:
 *       201:
 *         description: Block created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BlockResponse' 
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /blocks/import:
 *   post:
 *     summary: Import multiple blocks
 *     tags: [Block]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               $ref: '#/components/schemas/Block'
 *     responses:
 *       201:
 *         description: Blocks imported successfully
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /blocks/{id}:
 *   patch:
 *     summary: Update a block
 *     tags: [Block]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Block ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Block'
 *     responses:
 *       200:
 *         description: Block updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Block'
 *       404:
 *         description: Block not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /blocks/{id}:
 *   delete:
 *     summary: Delete a block
 *     tags: [Block]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Block ID
 *     responses:
 *       200:
 *         description: Block deleted successfully
 *       404:
 *         description: Block not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Block:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: The name of the block.
 *         group_id:
 *           type: number
 *           description: The ID of the group this block belongs to.
 *         data:
 *           type: object
 *           description: Additional data related to the block.
 *         type:
 *           type: string
 *           enum: [include, all]
 *           description: The type of block.
 *         question:
 *           type: string
 *           description: The question associated with the block.
 *         answers:
 *           type: array
 *           description: Array of possible answers for the question.
 *           items:
 *             type: string
 *         level:
 *           type: number
 *           description: The difficulty level of the block.
 *         meta_data:
 *           type: object
 *           description: Additional metadata for the block.
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: The timestamp of when the block was created.
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: The timestamp of when the block was last updated.
 *         timestamp:
 *           type: number
 *           description: The Unix timestamp of when the block was created.
 */


/**
 * @swagger
 * components:
 *   schemas:
 *     BlockRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: The name of the block.
 *         group_id:
 *           type: number
 *           description: The ID of the group this block belongs to.
 *         data:
 *           type: object
 *           description: Additional data related to the block.
 *         type:
 *           type: string
 *           enum: [include, all]
 *           description: The type of block.
 *         question:
 *           type: string
 *           description: The question associated with the block.
 *         answers:
 *           type: array
 *           description: Array of possible answers for the question.
 *           items:
 *             type: string
 *         level:
 *           type: number
 *           description: The difficulty level of the block.
 *         meta_data:
 *           type: object
 *           description: Additional metadata for the block.
 * 
 *     BlockResponse:
 *       type: object
 *       properties:
 *         block_id:
 *           type: number
 *           description: The unique ID of the block.
 *         name:
 *           type: string
 *           description: The name of the block.
 *         group_id:
 *           type: number
 *           description: The ID of the group this block belongs to.
 *         data:
 *           type: object
 *           description: Additional data related to the block.
 *         type:
 *           type: string
 *           enum: [include, all]
 *           description: The type of block.
 *         question:
 *           type: string
 *           description: The question associated with the block.
 *         answers:
 *           type: array
 *           description: Array of possible answers for the question.
 *           items:
 *             type: string
 *         level:
 *           type: number
 *           description: The difficulty level of the block.
 *         meta_data:
 *           type: object
 *           description: Additional metadata for the block.
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: The timestamp of when the block was created.
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: The timestamp of when the block was last updated.
 *         timestamp:
 *           type: number
 *           description: The Unix timestamp of when the block was created.
 */