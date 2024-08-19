const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRATION = require('../configs/auth').JWT_EXPIRATION;
const User = require('../models/user');
exports.generateToken = (user) => {
    try {
        return jwt.sign({
            name: user.name,
            username: user.username,
            user_id: user.user_id,
            role: user.role,
            meta_data: user.meta_data
        }, JWT_SECRET, { expiresIn: JWT_EXPIRATION });
    } catch (error) {
        console.log("JWT_ERROR", error);
        return null;
    }
};
const verifyToken = (token) => {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        console.log("JWT_ERROR", error);
        return null;
    }
};

exports.decodeToken = (token) => {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        console.log("JWT_ERROR[decode]", error);
        return null;
    }
};

exports.authenticate = async (req, res, next) => {
    try {
        const token = req.headers.authorization;
        if (!token) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const userTokenData = verifyToken(token.split(" ")[1]);
        const user = await User.aggregate([
            { $match: { user_id: parseInt(userTokenData.user_id) } },
            { $project: { password: 0 } }
        ])
        if (!user) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        req.user = user[0];
        next();
    } catch (error) {
        console.log("JWT_ERROR", error);
        return res.status(401).json({ message: "Unauthorized" });
    }
};

exports.authorize = (roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: "Forbidden" });
        }
        next();
    };
};