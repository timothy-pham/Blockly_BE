const User = require("../models/user");
const Message = require("../models/message");
const moment = require('moment');

exports.createMessage = async (req, res) => {
    try {
        const { type, name, meta_data, users } = req.body;
        const usersList = users.push(req.user.user_id);
        if (type === 'private' && users.length !== 2) {
            return res.status(400).json({ message: "Private messages must have 2 users" });
        }
        if (type === 'private') {
            // check if message already exists
            const message = await Message.findOne({ type, users: { $all: usersList } });
            if (message) {
                return res.status(400).json({ message: "Private message already exists" });
            }
        }
        const message_data = new Message({
            type,
            name,
            users: usersList,
            messages: [{
                user_id,
                message: "Welcome to the chat",
                send_at: moment().format(),
                timestamp: moment().unix()
            }],
            meta_data,
            timestamp: moment().unix(),
            created_at: moment().format(),
            updated_at: moment().format()
        });
        await message_data.save();
        res.status(201).json(message_data);
    } catch (error) {
        console.log("CREATE MESSAGE ERROR", error);
        res.status(500).json({ message: "Internal server error" });
    }

}

exports.getMessages = async (req, res) => {
    try {
        const user_id = req.user.user_id;
        const messages = await Message.aggregate([
            {
                $match: {
                    users: user_id
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "users",
                    foreignField: "user_id",
                    as: "users"
                }
            },
            {
                $unwind: {
                    path: "$users",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    _id: 0,
                    name: 1,
                    type: 1,
                    users: 1,
                    messages: 1,
                    meta_data: 1,
                    created_at: 1,
                    updated_at: 1,
                    timestamp: 1,
                    users: {
                        user_id: 1,
                        name: 1,
                        last_name: 1,
                        role: 1,
                        email: 1,
                        meta_data: 1,
                    }
                }
            },
            {
                $sort: {
                    timestamp: -1
                }
            }
        ])
        return messages.messages;
    } catch (error) {
        return []
    }
}

exports.getMessageById = async (req, res) => {
    try {
        const { id } = req.params;
        const user_id = req.user.user_id;
        const message = await Message.aggregate([
            {
                $match: {
                    message_id: parseInt(id),
                    users: user_id
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "users",
                    foreignField: "user_id",
                    as: "users"
                }
            },
            {
                $unwind: {
                    path: "$users",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    _id: 0,
                    name: 1,
                    type: 1,
                    users: 1,
                    messages: 1,
                    meta_data: 1,
                    created_at: 1,
                    updated_at: 1,
                    timestamp: 1,
                    users: {
                        user_id: 1,
                        name: 1,
                        last_name: 1,
                        role: 1,
                        email: 1,
                        meta_data: 1,
                    }
                }
            },
        ]);
        if (message.length === 0) {
            return res.status(404).json({ message: "Message not found" });
        }
        return res.status(200).json(message[0]);
    } catch (error) {
        console.log("GET MESSAGE ERROR", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

exports.sendMessage = async (req, res) => {
    try {
        const { id } = req.params;
        const { message } = req.body;
        const user_id = req.user.user_id;
        const message_data = await Message.findOne({ message_id: parseInt(id) });
        if (!message_data) {
            return res.status(404).json({ message: "Message not found" });
        }
        if (!message) {
            return res.status(400).json({ message: "Message is required" });
        }
        const new_message = {
            user_id,
            message,
            send_at: moment().format(),
            timestamp: moment().unix()
        }
        message_data.messages.push(new_message);
        await message_data.save();
        return res.status(200).json(message_data);
    } catch (error) {
        console.log("SEND MESSAGE ERROR", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}