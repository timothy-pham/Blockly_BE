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

router.post("/addStudentToTeacher/:teacher_id", authorize(['admin']), controller.addStudentToTeacher);

router.post("/removeStudentFromTeacher/:teacher_id", authorize(['admin']), controller.removeStudentFromTeacher);

router.post("/addParentToTeacher/:teacher_id", authorize(['admin']), controller.addParentToTeacher);

router.post("/removeParentFromTeacher/:teacher_id", authorize(['admin']), controller.removeParentFromTeacher);

router.post("/addStudentToParent/:parent_id", authorize(['admin', 'teacher']), controller.addStudentToParent);

router.post("/removeStudentFromParent/:parent_id", authorize(['admin', 'teacher']), controller.removeStudentFromParent);

router.patch("/:id", controller.updateUser);

module.exports = router;