const express = require("express");
const router = express.Router();
const controller = require("../controllers/group");

router.get("/", controller.getAllGroups);

router.get('/search', controller.searchGroups);

router.get("/export", controller.exportGroups);

router.get("/:id", controller.getGroupById);

router.post("/", controller.createGroup);

router.post("/import", controller.importGroups);

router.patch("/:id", controller.updateGroup);

router.delete("/:id", controller.deleteGroup);

module.exports = router;

/**
 * @swagger
 * components:
 *   schemas:
 *     Group:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: The name of the group.
 *           example: My Group
 *         collection_id:
 *           type: number
 *           description: The ID of the collection this group belongs to.
 *         meta_data:
 *           type: object
 *           description: Additional metadata for the group.
 *           example: {}
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: The timestamp of when the group was created.
 *           example: '2024-05-17T12:30:45.000Z'
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: The timestamp of when the group was last updated.
 *           example: '2024-05-17T12:30:45.000Z'
 *         timestamp:
 *           type: number
 *           description: The Unix timestamp of when the group was created.
 *           example: 1621260645
 */

/**
 * @swagger
 * tags:
 *   name: Group
 *   description: API endpoints for managing groups
 */

/**
 * @swagger
 * /groups:
 *   get:
 *     summary: Retrieve all groups
 *     tags: [Group]
 *     responses:
 *       200:
 *         description: A list of groups
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Group'
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /groups/search:
 *   get:
 *     summary: Search for groups based on query parameters
 *     tags: [Group]
 *     parameters:
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: The name of the group to search for (supports partial matches).
 *       - in: query
 *         name: collection_id
 *         schema:
 *           type: number
 *         description: The ID of the collection the group belongs to.
 *     responses:
 *       200:
 *         description: A list of groups matching the search criteria
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Group'
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /groups/{id}:
 *   get:
 *     summary: Retrieve a single group by ID
 *     tags: [Group]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Group ID
 *     responses:
 *       200:
 *         description: A single group object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Group'
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /groups:
 *   post:
 *     summary: Create a new group
 *     tags: [Group]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Group'
 *     responses:
 *       201:
 *         description: The created group object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Group'
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /groups/{id}:
 *   patch:
 *     summary: Update a group by ID
 *     tags: [Group]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Group ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Group'
 *     responses:
 *       200:
 *         description: The updated group object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Group'
 *       404:
 *         description: Group not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /groups/{id}:
 *   delete:
 *     summary: Delete a group by ID
 *     tags: [Group]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Group ID
 *     responses:
 *       200:
 *         description: Group deleted successfully
 *       404:
 *         description: Group not found
 *       500:
 *         description: Internal server error
 */
