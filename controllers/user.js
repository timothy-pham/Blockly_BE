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