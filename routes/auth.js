const express = require("express");
const router = express.Router();
const controller = require("../controllers/auth");
const { authenticate } = require("../middlewares/auth");
router.post("/login", controller.login);

router.post("/reset-password", authenticate, controller.resetPassword);

router.post("/register", controller.register);

router.post("/refresh", controller.refreshToken);

module.exports = router;

/**
 * @swagger
 * tags:
 *   - name: Auth
 *     description: Authentication routes
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: User login
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       200:
 *         description: Successful login
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: JWT token
 *                 refresh_token:
 *                   type: string
 *                   description: Refresh token
 *       401:
 *         description: Invalid credentials
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: User registration
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *               username:
 *                 type: string
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 name:
 *                   type: string
 *                 username:
 *                   type: string
 *                 created_at:
 *                   type: string
 *                 updated_at:
 *                   type: string
 *                 timestamp:
 *                   type: integer
 *       409:
 *         description: Username already exists
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Refresh JWT token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refresh_token:
 *                 type: string
 *                 example: abc123refresh
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         required: true
 *         schema:
 *           type: string
 *           example: Bearer your.jwt.token
 *         description: Current JWT token.
 *     responses:
 *       200:
 *         description: New JWT token generated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: New JWT token
 *       400:
 *         description: Refresh token is required
 *       401:
 *         description: Unauthorized or invalid refresh token
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */

/**
    * @swagger
    * /auth/reset-password:
    *   post:
    *     summary: Reset user password
    *     tags: [Auth]
    *     requestBody:
    *       required: true
    *       content:
    *         application/json:
    *           schema:
    *             type: object
    *             properties:
    *               old_password:
    *                 type: string
    *                 example: password123
    *               new_password:
    *                 type: string
    *                 example: newpassword123
    *     parameters:
    *       - in: header
    *         name: Authorization
    *         required: true
    *         schema:
    *           type: string
    *           example: Bearer your.jwt.token
    *         description: Current JWT token.
    *     responses:
    *       200:
    *         description: Password updated successfully
    *       400:
    *         description: Old and new password are required
    *       401:
    *         description: Unauthorized or invalid password
    *       404:
    *         description: User not found
    *       500:
    *         description: Server error
    */