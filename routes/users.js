const express = require("express");
const router = express.Router();
const controller = require("../controllers/user");
const { authorize } = require("../middlewares/auth.js");

router.get("/", authorize(['admin', 'teacher']), controller.getAllUsers);

router.get("/class/:teacher_id", controller.getClassMembers);

router.get("/teachers", authorize(['admin']), controller.getAllTeachers);

router.get("/parents", authorize(['admin', 'teacher']), controller.getAllParents);

router.get("/students", authorize(['admin', 'teacher', 'parent']), controller.getAllStudents);

router.get("/:id", controller.getUserById);

router.post("/request-admin", controller.requestAdmin);

router.post("/addStudentToTeacher/:teacher_id", authorize(['admin']), controller.addStudentToTeacher);

router.post("/removeStudentFromTeacher/:teacher_id", authorize(['admin']), controller.removeStudentFromTeacher);

router.post("/addParentToTeacher/:teacher_id", authorize(['admin']), controller.addParentToTeacher);

router.post("/removeParentFromTeacher/:teacher_id", authorize(['admin']), controller.removeParentFromTeacher);

router.post("/addStudentToParent/:parent_id", authorize(['admin', 'teacher']), controller.addStudentToParent);

router.post("/removeStudentFromParent/:parent_id", authorize(['admin', 'teacher']), controller.removeStudentFromParent);

router.patch("/:id", controller.updateUser);

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management and operations
 * paths:
 *   /:
 *     get:
 *       tags: [Users]
 *       summary: Get all users
 *       description: Retrieve a list of all users. Requires admin or teacher role.
 *       security:
 *         - bearerAuth: []
 *       responses:
 *         '200':
*           description: A list of users.
*           content:
*             application/json:
*               schema:
*                 type: array
*                 items:
*                   $ref: '#/components/schemas/User'
* 
*   /class/{teacher_id}:
*     get:
*       tags: [Users]
*       summary: Get class members by teacher ID
*       description: Retrieve a list of all class members for a given teacher. No specific role required.
*       parameters:
*         - in: path
*           name: teacher_id
*           required: true
*           schema:
*             type: string
*           description: The teacher's ID to fetch class members for
*       responses:
*         '200':
*           description: A list of class members.
*           content:
*             application/json:
*               schema:
*                 type: array
*                 items:
*                   $ref: '#/components/schemas/User'
*   /teachers:
*     get:
*       tags: [Users]
*       summary: Get all teachers
*       description: Retrieve a list of all teachers. Requires admin role.
*       security:
*         - bearerAuth: []
*       responses:
*         '200':
*           description: A list of teachers.
*           content:
*             application/json:
*               schema:
*                 type: array
*                 items:
*                   $ref: '#/components/schemas/User'
*   /parents:
 *     get:
 *       tags: [Users]
 *       summary: Get all parents
 *       description: Retrieve a list of all parents. Requires admin or teacher role.
 *       security:
 *         - bearerAuth: []
 *       responses:
 *         '200':
 *           description: A list of parents.
 *           content:
 *             application/json:
 *               schema:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/User'
 *   /students:
 *     get:
 *       tags: [Users]
 *       summary: Get all students
 *       description: Retrieve a list of all students. Requires admin, teacher, or parent role.
 *       security:
 *         - bearerAuth: []
 *       responses:
 *         '200':
 *           description: A list of students.
 *           content:
 *             application/json:
 *               schema:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/User'
 *   /{id}:
 *     get:
 *       tags: [Users]
 *       summary: Get a user by ID
 *       description: Retrieve a single user by their ID.
 *       parameters:
 *         - in: path
 *           name: id
 *           required: true
 *           schema:
 *             type: string
 *           description: The user's ID
 *       responses:
 *         '200':
 *           description: A single user.
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/User'
 *     patch:
 *       tags: [Users]
 *       summary: Update a user
 *       description: Update a user's information by their ID.
 *       parameters:
 *         - in: path
 *           name: id
 *           required: true
 *           schema:
 *             type: string
 *           description: The user's ID
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       responses:
 *         '200':
 *           description: User updated successfully.
 *   /addStudentToTeacher/{teacher_id}:
 *     post:
 *       tags: [Users]
 *       summary: Add a student to a teacher
 *       description: Assign a student to a teacher. Requires admin role.
 *       parameters:
 *         - in: path
 *           name: teacher_id
 *           required: true
 *           schema:
 *             type: string
 *           description: The teacher's ID
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 student_id:
 *                   type: string
 *                   description: The student's ID to be added
 *       responses:
 *         '200':
 *           description: Student added to teacher successfully.
 *   /removeStudentFromTeacher/{teacher_id}:
 *     post:
 *       tags: [Users]
 *       summary: Remove a student from a teacher
 *       description: Remove a student's assignment to a teacher. Requires admin role.
 *       parameters:
 *         - in: path
 *           name: teacher_id
 *           required: true
 *           schema:
 *             type: string
 *           description: The teacher's ID
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 student_id:
 *                   type: string
 *                   description: The student's ID to be removed
 *       responses:
 *         '200':
 *           description: Student removed from teacher successfully.
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         user_id:
 *           type: integer
 *           description: The user's unique identifier, auto-incremented.
 *         username:
 *           type: string
 *           description: The user's unique username.
 *           unique: true
 *           required: true
 *         name:
 *           type: string
 *           description: The user's full name.
 *           required: true
 *         role:
 *           type: string
 *           description: The user's role in the system.
 *           enum: [admin, student, teacher, parent]
 *           default: student
 *         email:
 *           type: string
 *           description: The user's email address.
 *         password:
 *           type: string
 *           description: The user's password for authentication.
 *           required: true
 *         refresh_token:
 *           type: string
 *           description: Token for refreshing authentication.
 *         meta_data:
 *           type: object
 *           description: Additional metadata associated with the user.
 *           default: {}
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: The date and time when the user was created.
 *           default: "The current date and time"
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: The date and time when the user was last updated.
 *           default: "The current date and time"
 *         timestamp:
 *           type: number
 *           description: A timestamp value associated with the user.
 *       required:
 *         - username
 *         - name
 *         - password
 * 
 * securitySchemes:
 *   bearerAuth:
 *     type: http
 *     scheme: bearer
 *     bearerFormat: JWT
 */