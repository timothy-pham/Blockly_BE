const User = require('../models/user');
const moment = require('moment');
const bcrypt = require('bcrypt');
const SALT_ROUNDS = require('../configs/auth').SALT_ROUNDS;
const generateToken = require('../middleware/auth').generateToken;
const { nanoid } = require('nanoid');
const { decodeToken } = require('../middleware/auth');

exports.register = async (req, res) => {
    try {
        let { name, username, password } = req.body;
        username = username.toLowerCase();
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(409).json({ message: "Username already exists" });
        }
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
        const user = new User({
            name,
            username,
            password: hashedPassword,
            created_at: moment().format('MM/DD/YYYY, hh:mm:ss'),
            updated_at: moment().format('MM/DD/YYYY, hh:mm:ss'),
            timestamp: moment().unix()
        });
        const newUser = await user.save();
        delete newUser.password;
        res.status(201).json(newUser);
    } catch (error) {
        console.log("USERS_POST_ERROR", error)
        res.status(500).json({ message: error });
    }
};

exports.login = async (req, res) => {
    try {
        let { username, password } = req.body;
        username = username.toLowerCase();

        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const token = generateToken(user);
        let refresh_token = null;
        if (user.refresh_token) {
            refresh_token = user.refresh_token;
        } else {
            refresh_token = nanoid(32);
            user.refresh_token = refresh_token;
            await user.save();
        }

        res.status(200).json({ token, refresh_token, user: { name: user.name, username: user.username, user_id: user.user_id, role: user.role } });
    } catch (error) {
        console.log("USERS_LOGIN_ERROR", error)
        res.status(500).json({ message: error });
    }
};

exports.refreshToken = async (req, res) => {
    try {
        const { refresh_token } = req.body;
        const current_token = req.headers.authorization.split(" ")[1];

        if (!current_token) {
            return res.status(401).json({ message: "Missing authorization header" });
        }
        if (!refresh_token) {
            return res.status(400).json({ message: "Refresh token is required" });
        }
        const decodeData = decodeToken(current_token);

        if (!decodeData || decodeData === null) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const user = await User.findOne({ username: decodeData.username });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        if (user.refresh_token !== refresh_token) {
            return res.status(401).json({ message: "Invalid refresh token" });
        }
        const token = generateToken(user);
        res.status(200).json({ token });
    } catch (error) {
        console.log("USERS_REFRESH_TOKEN_ERROR", error)
        res.status(500).json({ message: error });
    }
};