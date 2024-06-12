const express = require("express");
const router = express.Router();
const controller = require("../controllers/user");
const { authorize } = require("../middlewares/auth.js");

router.get("/", authorize(['admin']), controller.getAllUsers);

router.get("/teachers", authorize(['admin']), controller.getAllTeachers);

router.get("/parents", authorize(['admin', 'teacher']), controller.getAllParents);

router.get("/students", authorize(['admin', 'teacher', 'parent']), controller.getAllStudents);

router.get("/:id", authorize(['admin']), controller.getUserById);

router.patch("/addStudentToTeacher/:teacher_id", authorize(['admin']), controller.addStudentToTeacher);

router.patch("/removeStudentFromTeacher/:teacher_id", authorize(['admin']), controller.removeStudentFromTeacher);

router.patch("/addParentToTeacher/:teacher_id", authorize(['admin']), controller.addParentToTeacher);

router.patch("/removeParentFromTeacher/:teacher_id", authorize(['admin']), controller.removeParentFromTeacher);

router.patch("/addStudentToParent/:parent_id", authorize(['admin', 'teacher']), controller.addStudentToParent);

router.patch("/removeStudentFromParent/:parent_id", authorize(['admin', 'teacher']), controller.removeStudentFromParent);

router.patch("/:id", authorize(['admin']), controller.updateUser);

module.exports = router;