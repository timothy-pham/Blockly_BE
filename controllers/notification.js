const User = require("../models/user");
const Notification = require("../models/notification");
exports.getAllNotifications = async (req, res) => {
    try {
        const notifications = await Notification.aggregate([
            {
                $match: {
                    status: 'waiting'
                }
            }
        ]);

        res.status(200).json(notifications);
    } catch (error) {
        console.log("GET NOTIFICATION ERROR", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

exports.getNotification = async (req, res) => {
    try {
        const notification_id = req.params.notification_id;
        const notification = await Notification.findOne({
            notification_id
        });
        if (!notification) {
            res.status(404).json({ message: "Notification not found" });
        } else {
            res.status(200).json(notification);
        }
    } catch (error) {
        console.log("GET NOTIFICATION ERROR", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

exports.createNotification = async (req, res) => {
    try {
        const { title, message, meta_data } = req.body;
        const user = req.user;
        const notification = new Notification({
            title,
            message,
            user_id: user.user_id,
            meta_data
        });
        await notification.save();
        res.status(201).json(notification);
    } catch (error) {
        console.log("CREATE NOTIFICATION ERROR", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

exports.updateNotification = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, message, meta_data } = req.body;
        const notification = await Notification.findOne({ notification_id: id });
        if (!notification) {
            return res.status(404).json({ message: "Notification not found" });
        }
        if (title) notification.title = title;
        if (message) notification.message = message;
        if (meta_data) {
            notification.meta_data = {
                ...notification.meta_data,
                ...meta_data
            }
        }
        notification.updated_at = moment().format();
        await notification.save();
        res.status(200).json(notification);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

exports.deleteNotification = async (req, res) => {
    try {
        const { id } = req.params;
        await Notification.findOneAndDelete({ notification_id: id });
        res.status(200).json({ message: "Notification deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}

exports.sendNotification = async (req, res) => {
    try {
        const io = req.io
        const { type, message } = req.body;
        io.emit("receive_notification", { type, message });
        res.status(200).json({ message: "Notification sent successfully" });
    } catch (error) {
        console.log("SEND NOTIFICATION ERROR", error)
        res.status(500).json({ message: error.message });
    }
}