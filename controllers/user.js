const User = require('../models/user');
const moment = require('moment');

exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json(users);
    } catch (error) {
        console.log("USERS_GET_ERROR", error)
        res.status(500).json({ message: error });
    }
};

exports.getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.find({
            user_id: id
        })
        res.status(200).json(user);
    } catch (error) {
        console.log("USERS_GET_ERROR", error)
        res.status(500).json({ message: error });
    }
};

exports.updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { role, name, email, meta_data } = req.body;
        const user = await User.findOne({ user_id: id });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        if (role) user.role = role;
        if (name) user.name = name;
        if (email) user.email = email;
        if (meta_data) user.meta_data = {
            ...user.meta_data,
            ...meta_data
        }
        user.updated_at = moment().format();
        user.timestamp = moment().unix();
        await user.save();
        res.status(200).json(user);
    } catch (error) {
        console.log("USERS_PATCH_ERROR", error)
        res.status(500).json({ message: error });
    }
}

const getUserByRole = async (role) => {
    try {
        const users = await User.find({
            role: role
        })
        return users;
    } catch (error) {
        console.log("USERS_GET_ERROR", error)
        return [];
    }
}

exports.getAllTeachers = async (req, res) => {
    try {
        const teachers = await getUserByRole('teacher');
        res.status(200).json(teachers);
    } catch (error) {

    }
}

exports.getAllParents = async (req, res) => {
    try {
        // if admin get all parents, if teacher get parents of teacher
        const parents = await getUserByRole('parent');
        const userRequestRole = req.user.role;
        if (userRequestRole === 'teacher') {
            const teacher = await User.findOne({ user_id: req.user.user_id });
            if (!teacher) {
                return res.status(404).json({ message: "Teacher not found" });
            }
            if (teacher.role !== 'teacher') {
                return res.status(400).json({ message: "User is not a teacher" });
            }
            const teacherParents = teacher.meta_data.parents;
            const teacherParentsData = parents.filter(parent => teacherParents.includes(parent.user_id));
            return res.status(200).json(teacherParentsData);
        } else {
            res.status(200).json(parents);
        }
    } catch (error) {
        console.log("USERS_GET_ERROR", error)
        res.status(500).json({ message: error });
    }
}

exports.getAllStudents = async (req, res) => {
    try {
        // if admin get all students, if teacher get students of teacher, if parent get students of parent
        const students = await getUserByRole('student');
        const userRequestRole = req.user.role;
        if (userRequestRole === 'teacher') {
            const teacher = await User.findOne({ user_id: req.user.user_id });
            if (!teacher) {
                return res.status(404).json({ message: "Teacher not found" });
            }
            if (teacher.role !== 'teacher') {
                return res.status(400).json({ message: "User is not a teacher" });
            }
            const teacherStudents = teacher.meta_data.students;
            const teacherStudentsData = students.filter(student => teacherStudents.includes(student.user_id));
            return res.status(200).json(teacherStudentsData);
        } else if (userRequestRole === 'parent') {
            const parent = await User.findOne({ user_id: req.user.user_id });
            if (!parent) {
                return res.status(404).json({ message: "Parent not found" });
            }
            if (parent.role !== 'parent') {
                return res.status(400).json({ message: "User is not a parent" });
            }
            const parentStudents = parent.meta_data.students;
            const parentStudentsData = students.filter(student => parentStudents.includes(student.user_id));
            return res.status(200).json(parentStudentsData);
        } else {
            res.status(200).json(students);
        }
    } catch (error) {
        console.log("USERS_GET_ERROR", error)
        res.status(500).json({ message: error });
    }
}

exports.addStudentToTeacher = async (req, res) => {
    try {
        const { teacher_id } = req.params;
        const { student_id } = req.body;
        const teacher = await User.findOne({ user_id: teacher_id });
        if (!teacher) {
            return res.status(404).json({ message: "Teacher not found" });
        }
        if (teacher.role !== 'teacher') {
            return res.status(400).json({ message: "User is not a teacher" });
        }
        const student = await User.findOne({ user_id: student_id });
        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }
        if (student.role !== 'student') {
            return res.status(400).json({ message: "User is not a student" });
        }
        if (student.meta_data.teacher) {
            return res.status(400).json({ message: "Student already has a teacher" });
        }
        teacher.meta_data = {
            ...teacher.meta_data,
            students: [
                ...teacher.meta_data.students,
                student_id
            ]
        }
        teacher.updated_at = moment().format();
        teacher.timestamp = moment().unix();
        await teacher.save();
        student.meta_data = {
            ...student.meta_data,
            teacher: teacher_id
        }
        student.updated_at = moment().format();
        student.timestamp = moment().unix();
        await student.save();
        res.status(200).json({ teacher, student });
    } catch (error) {
        console.log("USERS_PATCH_ERROR", error)
        res.status(500).json({ message: error });
    }
}

exports.removeStudentFromTeacher = async (req, res) => {
    try {
        const { teacher_id } = req.params;
        const { student_id } = req.body;
        const teacher = await User.findOne({ user_id: teacher_id });
        if (!teacher) {
            return res.status(404).json({ message: "Teacher not found" });
        }
        if (teacher.role !== 'teacher') {
            return res.status(400).json({ message: "User is not a teacher" });
        }
        const student = await User.findOne({ user_id: student_id });
        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }
        if (student.role !== 'student') {
            return res.status(400).json({ message: "User is not a student" });
        }
        if (!student.meta_data.teacher) {
            return res.status(400).json({ message: "Student does not have a teacher" });
        }
        teacher.meta_data = {
            ...teacher.meta_data,
            students: teacher.meta_data.students.filter(item => item !== student_id)
        }
        teacher.updated_at = moment().format();
        teacher.timestamp = moment().unix();
        await teacher.save();
        student.meta_data = {
            ...student.meta_data,
            teacher: null
        }
        student.updated_at = moment().format();
        student.timestamp = moment().unix();
        await student.save();
        res.status(200).json({ teacher, student });
    } catch (error) {
        console.log("USERS_PATCH_ERROR", error)
        res.status(500).json({ message: error });
    }
}

exports.addParentToTeacher = async (req, res) => {
    try {
        const { teacher_id } = req.params;
        const { parent_id } = req.body;
        const teacher = await User.findOne({ user_id: teacher_id });
        if (!teacher) {
            return res.status(404).json({ message: "Teacher not found" });
        }
        if (teacher.role !== 'teacher') {
            return res.status(400).json({ message: "User is not a teacher" });
        }
        const parent = await User.findOne({ user_id: parent_id });
        if (!parent) {
            return res.status(404).json({ message: "Parent not found" });
        }
        if (parent.role !== 'parent') {
            return res.status(400).json({ message: "User is not a parent" });
        }
        if (parent.meta_data.teacher) {
            return res.status(400).json({ message: "Parent already has a teacher" });
        }
        teacher.meta_data = {
            ...teacher.meta_data,
            parents: [
                ...teacher.meta_data.parents,
                parent_id
            ]
        }
        teacher.updated_at = moment().format();
        teacher.timestamp = moment().unix();
        await teacher.save();
        parent.meta_data = {
            ...parent.meta_data,
            teacher: teacher_id
        }
        parent.updated_at = moment().format();
        parent.timestamp = moment().unix();
        await parent.save();
        res.status(200).json({ teacher, parent });
    } catch (error) {
        console.log("USERS_PATCH_ERROR", error)
        res.status(500).json({ message: error });
    }
}

exports.removeParentFromTeacher = async (req, res) => {
    try {
        const { teacher_id } = req.params;
        const { parent_id } = req.body;
        const teacher = await User.findOne({ user_id: teacher_id });
        if (!teacher) {
            return res.status(404).json({ message: "Teacher not found" });
        }
        if (teacher.role !== 'teacher') {
            return res.status(400).json({ message: "User is not a teacher" });
        }
        const parent = await User.findOne({ user_id: parent_id });
        if (!parent) {
            return res.status(404).json({ message: "Parent not found" });
        }
        if (parent.role !== 'parent') {
            return res.status(400).json({ message: "User is not a parent" });
        }
        if (!parent.meta_data.teacher) {
            return res.status(400).json({ message: "Parent does not have a teacher" });
        }
        teacher.meta_data = {
            ...teacher.meta_data,
            parents: teacher.meta_data.parents.filter(item => item !== parent_id)
        }
        teacher.updated_at = moment().format();
        teacher.timestamp = moment().unix();
        await teacher.save();
        parent.meta_data = {
            ...parent.meta_data,
            teacher: null
        }
        parent.updated_at = moment().format();
        parent.timestamp = moment().unix();
        await parent.save();
        res.status(200).json({ teacher, parent });
    } catch (error) {
        console.log("USERS_PATCH_ERROR", error)
        res.status(500).json({ message: error });
    }
}

exports.addStudentToParent = async (req, res) => {
    try {
        const { parent_id } = req.params;
        const { student_id } = req.body;
        const parent = await User.findOne({ user_id: parent_id });
        if (!parent) {
            return res.status(404).json({ message: "Parent not found" });
        }
        if (parent.role !== 'parent') {
            return res.status(400).json({ message: "User is not a parent" });
        }
        const student = await User.findOne({ user_id: student_id });
        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }
        if (student.role !== 'student') {
            return res.status(400).json({ message: "User is not a student" });
        }
        if (student.meta_data.parents) {
            return res.status(400).json({ message: "Student already has a parent" });
        }
        const userRequestRole = req.user.role;
        if (userRequestRole === 'teacher') {
            const teacher = await User.findOne({ user_id: req.user.user_id });
            if (!teacher) {
                return res.status(404).json({ message: "Teacher not found" });
            }
            if (teacher.role !== 'teacher') {
                return res.status(400).json({ message: "User is not a teacher" });
            }
            const teacherStudents = teacher.meta_data.students;
            if (!teacherStudents.includes(student_id)) {
                return res.status(400).json({ message: "Student is not in teacher's class" });
            }
        }
        parent.meta_data = {
            ...parent.meta_data,
            students: [
                ...parent.meta_data.students,
                student_id
            ]
        }
        parent.updated_at = moment().format();
        parent.timestamp = moment().unix();
        await parent.save();
        student.meta_data = {
            ...student.meta_data,
            parent: parent_id
        }
        student.updated_at = moment().format();
        student.timestamp = moment().unix();
        await student.save();
        res.status(200).json({ parent, student });
    } catch (error) {
        console.log("USERS_PATCH_ERROR", error)
        res.status(500).json({ message: error });
    }
}

exports.removeStudentFromParent = async (req, res) => {
    try {
        const { parent_id } = req.params;
        const { student_id } = req.body;
        const parent = await User.findOne({ user_id: parent_id });
        if (!parent) {
            return res.status(404).json({ message: "Parent not found" });
        }
        if (parent.role !== 'parent') {
            return res.status(400).json({ message: "User is not a parent" });
        }
        const student = await User.findOne({ user_id: student_id });
        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }
        if (student.role !== 'student') {
            return res.status(400).json({ message: "User is not a student" });
        }
        if (!student.meta_data.parent) {
            return res.status(400).json({ message: "Student does not have a parent" });
        }
        parent.meta_data = {
            ...parent.meta_data,
            students: parent.meta_data.students.filter(item => item !== student_id)
        }
        parent.updated_at = moment().format();
        parent.timestamp = moment().unix();
        await parent.save();
        student.meta_data = {
            ...student.meta_data,
            parent: null
        }
        student.updated_at = moment().format();
        student.timestamp = moment().unix();
        await student.save();
        res.status(200).json({ parent, student });
    } catch (error) {
        console.log("USERS_PATCH_ERROR", error)
        res.status(500).json({ message: error });
    }
}