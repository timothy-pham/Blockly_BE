const express = require("express");
const router = express.Router();
const controller = require("../controllers/block");

router.get("/", controller.getAllBlocks);

router.get("/export", controller.exportBlocks);

router.get("/:id", controller.getBlockById);

router.post("/check-answer", controller.checkAnswer);

router.post("/", controller.createBlock);

router.post("/import", controller.importBlocks);

router.patch("/:id", controller.updateBlock);

router.delete("/:id", controller.deleteBlock);

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
 *                 type: string
 *               answer:
 *                 type: string
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
 *                 answer:
 *                   type: string
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
 *             $ref: '#/components/schemas/Block'
 *     responses:
 *       201:
 *         description: Block created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Block'
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
