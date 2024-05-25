const User = require("../models/user");
const Message = require("../models/message");
const moment = require('moment');

exports.createMessage = async (req, res) => {
    try {
        const { room_id, user_id, name, meta_data } = req.body;
        const message_data = new Message({
            room_id,
            name,
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


exports.getMessages = async (room_id) => {
    try {
        const messages = await Message.findOne({
            room_id
        })
        if (!messages) {
            return []
        }
        return messages.messages;
    } catch (error) {
        return []
    }
}

exports.addMessage = async (room_id, user_id, message) => {
    try {
        const message_data = await Message.findOne({
            room_id
        })
        if (!message_data) {
            return false
        }
        const data = {
            user_id,
            message,
            send_at: moment().format(),
            timestamp: moment().unix()
        }
        message_data.messages = [...message_data.messages, data];
        message_data.updated_at = moment().format();
        await message_data.save();
        return data;
    } catch (error) {
        return false
    }
}