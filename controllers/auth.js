const User = require('../models/user');
const moment = require('moment');
const bcrypt = require('bcrypt');
const SALT_ROUNDS = require('../configs/auth').SALT_ROUNDS;
const generateToken = require('../middlewares/auth').generateToken;
const { nanoid } = require('nanoid');
const { decodeToken } = require('../middlewares/auth');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
    try {
        let { name, username, password } = req.body;
        username = username.toLowerCase();
        if (username.length < 6 || username.length > 20) {
            return res.status(400).json({ message: "Username must be at least 6 characters and less than 20 characters" });
        } else if (name.length < 3 || name.length > 20) {
            return res.status(400).json({ message: "Name must be at least 3 characters and less than 20 characters" });
        } else if (password.length < 6 || password.length > 20) {
            return res.status(400).json({ message: "Password must be at least 6 characters and less than 20 characters" });
        }
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(409).json({ message: "Username already exists" });
        }
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
        const user = new User({
            name,
            username,
            password: hashedPassword,
            meta_data: {
                points: 0,
                matches: 0
            },
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
        if (!username || !password) {
            return res.status(400).json({ message: "Sai tài khoản hoặc mật khẩu" });
        }
        if (username.length < 6) {
            return res.status(400).json({ message: "Sai tài khoản hoặc mật khẩu" });
        }
        if (password.length < 6) {
            return res.status(400).json({ message: "Sai tài khoản hoặc mật khẩu" });
        }
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ message: "Sai tài khoản hoặc mật khẩu" });
        }

        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(401).json({ message: "Sai tài khoản hoặc mật khẩu" });
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

        res.status(200).json({ token, refresh_token, user: { name: user.name, username: user.username, user_id: user.user_id, role: user.role, meta_data: user.meta_data } });
    } catch (error) {
        console.log("USERS_LOGIN_ERROR", error)
        res.status(500).json({ message: error });
    }
};

exports.guestToken = async (req, res) => {
    try {
        const { user_id } = req.body;
        const user = await User.findOne({ user_id });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
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
        res.status(200).json({ token, refresh_token, user: { name: user.name, username: user.username, user_id: user.user_id, role: user.role, meta_data: user.meta_data } });
    } catch (error) {
        console.log("USERS_GUEST_TOKEN_ERROR", error)
        res.status(500).json({ message: error });
    }
}

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

exports.resetPassword = async (req, res) => {
    try {
        const userRequestRole = req.user.role;
        const { username, password } = req.body;
        if (password?.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters" });
        } else if (password?.length > 20) {
            return res.status(400).json({ message: "Password must be less than 20 characters" });
        }
        const user = await User.findOne({ username });
        if (userRequestRole != 'admin' && user.user_id != req.user.user_id) {
            return res.status(403).json({ message: "Forbidden" });
        }
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
        user.password = hashedPassword;
        await user.save();
        res.status(200).json({ message: "Password updated" });
    } catch (error) {
        console.log("USERS_RESET_PASSWORD_ERROR", error)
        res.status(500).json({ message: error });
    }
}

exports.loginGoogle = async (req, res) => {
    try {
        const credentialData = req.body;
        const data = jwt.decode(credentialData?.credential);
        if (!data) {
            return res.status(400).json({ message: "Invalid credential" });
        }
        const { email, name, picture } = data;
        if (!email || !name) {
            return res.status(400).json({ message: "Invalid credential" });
        }
        const user = await User.findOne({
            username: email
        })

        if (!user) {
            const newUser = new User({
                name,
                username: email,
                meta_data: {
                    login_google: true,
                    points: 0,
                    matches: 0,
                    avatar: picture || null
                },
                created_at: moment().format('MM/DD/YYYY, hh:mm:ss'),
                updated_at: moment().format('MM/DD/YYYY, hh:mm:ss'),
                timestamp: moment().unix()
            });
            await newUser.save();
            const token = generateToken(newUser);
            let refresh_token = null;
            if (newUser.refresh_token) {
                refresh_token = newUser.refresh_token;
            } else {
                refresh_token = nanoid(32);
                newUser.refresh_token = refresh_token;
                await newUser.save();
            }
            res.status(201).json({ token, refresh_token, user: { name: newUser.name, username: newUser.username, user_id: newUser.user_id, role: newUser.role, meta_data: newUser.meta_data } });
        } else {
            const token = generateToken(user);
            let refresh_token = null;
            if (user.refresh_token) {
                refresh_token = user.refresh_token;
            } else {
                refresh_token = nanoid(32);
                user.refresh_token = refresh_token;
                await user.save();
            }
            res.status(200).json({ token, refresh_token, user: { name: user.name, username: user.username, user_id: user.user_id, role: user.role, meta_data: user.meta_data } });
        }
    } catch (error) {
        console.log("USERS_LOGIN_GOOGLE_ERROR", error)
        res.status(500).json({ message: error });
    }
}