const express = require("express");
const router = express.Router();
const controller = require("../controllers/notification.js");
const { authorize } = require("../middlewares/auth.js");

router.get("/", controller.getAllNotifications);

router.get("/:notification_id", controller.getNotification);

router.post("/send", authorize(['admin']), controller.sendNotification);

router.post("/", controller.createNotification);

router.patch("/:notification_id", controller.updateNotification);

router.delete("/:notification_id", controller.deleteNotification);

module.exports = router;

/**
 * @swagger
 * components:
 *   schemas:
 *     Notification:
 *       type: object
 *       properties:
 *         notification_id:
 *           type: integer
 *           description: The ID of the notification.
 *         user_id:
 *           type: integer
 *           description: The ID of the user associated with the notification.
 *         title:
 *           type: string
 *           description: The title of the notification.
 *         message:
 *           type: string
 *           description: The content of the notification.
 *         meta_data:
 *           type: object
 *           description: Additional metadata for the notification.
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: The timestamp of when the notification was created.
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: The timestamp of when the notification was last updated.
 *         timestamp:
 *           type: integer
 *           description: The Unix timestamp of when the notification was created.
 */

/**
 * @swagger
 * tags:
 *   name: Notification
 *   description: API endpoints for managing notifications
 */

/**
 * @swagger
 * /notifications:
 *   get:
 *     summary: Get all notifications
 *     tags: [Notification]
 *     responses:
 *       200:
 *         description: List of all notifications
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Notification'
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /notifications/{notification_id}:
 *   get:
 *     summary: Get a single notification by ID
 *     tags: [Notification]
 *     parameters:
 *       - in: path
 *         name: notification_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the notification
 *     responses:
 *       200:
 *         description: A single notification
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Notification'
 *       404:
 *         description: Notification not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /notifications:
 *   post:
 *     summary: Create a new notification
 *     tags: [Notification]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_id:
 *                 type: integer
 *                 description: The ID of the user creating the notification.
 *               title:
 *                 type: string
 *                 description: The title of the notification.
 *               message:
 *                 type: string
 *                 description: The content of the notification.
 *               meta_data:
 *                 type: object
 *                 description: Additional metadata for the notification.
 *     responses:
 *       201:
 *         description: The notification was successfully created.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Notification'
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /notifications/{notification_id}:
 *   patch:
 *     summary: Update a notification by ID
 *     tags: [Notification]
 *     parameters:
 *       - in: path
 *         name: notification_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the notification
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: The title of the notification.
 *               message:
 *                 type: string
 *                 description: The content of the notification.
 *               meta_data:
 *                 type: object
 *                 description: Additional metadata for the notification.
 *     responses:
 *       200:
 *         description: The notification was successfully updated.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Notification'
 *       404:
 *         description: Notification not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /notifications/{notification_id}:
 *   delete:
 *     summary: Delete a notification by ID
 *     tags: [Notification]
 *     parameters:
 *       - in: path
 *         name: notification_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the notification
 *     responses:
 *       200:
 *         description: Notification deleted successfully
 *       404:
 *         description: Notification not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /notifications/send:
 *   post:
 *     summary: Send a notification (admin only)
 *     tags: [Notification]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_id:
 *                 type: integer
 *                 description: The ID of the user to send the notification to.
 *               title:
 *                 type: string
 *                 description: The title of the notification.
 *               message:
 *                 type: string
 *                 description: The content of the notification.
 *               meta_data:
 *                 type: object
 *                 description: Additional metadata for the notification.
 *     responses:
 *       201:
 *         description: The notification was successfully sent.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Notification'
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 */
