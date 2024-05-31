const History = require("../models/histories");
const Room = require("../models/room");
const User = require("../models/user");
const Collection = require("../models/collection");
const Group = require("../models/group");
const Block = require("../models/block");
const moment = require('moment');

exports.getAllRooms = async (req, res) => {
    try {
        const rooms = await Room.aggregate([
            {
                $match: {
                    status: 'waiting'
                }
            }
        ]);

        res.status(200).json(rooms);
    } catch (error) {
        console.log("GET ROOM ERROR", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

exports.getRoom = async (req, res) => {
    try {
        const room_id = req.params.room_id;
        const room = await Room.findOne({ room_id });
        if (!room) {
            res.status(404).json({ message: "Room not found" });
        } else {
            res.status(200).json(room);
        }
    } catch (error) {
        console.log("GET ROOM ERROR", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

exports.createRoom = async (req, res) => {
    try {
        const { name, description, meta_data } = req.body;
        const user = req.user;
        const room = new Room({
            name,
            description,
            status: 'waiting',
            users: [{
                user_id: user.user_id,
                user_data: user,
                is_ready: false,
                is_host: true
            }],
            meta_data: {
                ...meta_data,
                total_users: 1,
            }
        });
        await room.save();
        res.status(201).json(room);
    } catch (error) {
        console.log("CREATE ROOM ERROR", error);
        res.status(500).json({ message: "Internal server error" });
    }
}



// SOCKET PART
exports.joinRoom = async (room_id, user_id) => {
    try {
        const room = await Room.findOne({ room_id })
        if (!room) {
            return false;
        } else {
            const user = await User.findOne({ user_id });
            if (!user) {
                return false
            } else {
                const users = room.users;
                let isJoined = false;
                users.some(u => {
                    if (u.user_id === user_id) {
                        isJoined = true;
                        return true;
                    }
                });
                if (!isJoined) {
                    users.push({
                        user_id: user_id,
                        user_data: user,
                        is_ready: false,
                        is_host: false,
                        is_connected: true
                    });
                    room.meta_data = {
                        ...room.meta_data,
                        total_users: room.meta_data.total_users + 1
                    }
                } else {
                    users.forEach(u => {
                        if (u.user_id === user_id) {
                            u.is_connected = true;
                        }
                    });
                }
                room.users = users;
                await room.save();
                return room;
            }
        }
    } catch (error) {
        console.log("JOIN ROOM ERROR", error);
        return false
    }
}

exports.leaveRoom = async (room_id, user_id) => {
    try {
        const room = await Room.findOne({ room_id })
        if (!room) {
            return;
        } else {
            const users = room.users;
            users.forEach(u => {
                if (u.user_id === user_id) {
                    u.is_connected = false;
                    const is_ready = u.is_ready;
                    room.meta_data = {
                        ...room.meta_data,
                        total_users: room.meta_data.total_users - 1

                    }
                }
            });
            room.users = users;
            let isAllDisconnected = true;
            users.forEach(u => {
                if (u.is_connected) {
                    isAllDisconnected = false;
                }
            });
            if (isAllDisconnected) {
                room.status = 'finished';
            }
            await room.save();
        }
    } catch (error) {
        console.log("LEAVE ROOM ERROR", error);
    }
}

exports.userReady = async (room_id, user_id, is_ready) => {
    try {
        console.log("USER READY", room_id, user_id, is_ready)
        const room = await Room.findOne({ room_id })
        if (!room) {
            return false;
        } else {
            const users = room.users;
            users.forEach(u => {
                if (u.user_id === user_id) {
                    u.is_ready = is_ready;
                }
            });
            console.log("Room meta data", room.meta_data)
            room.users = users;
            await room.save();
            return room;
        }
    } catch (error) {
        console.log("USER READY ERROR", error);
        return false
    }
}

exports.startGame = async (room_id, user_id) => {
    try {
        const room = await Room.findOne({ room_id })
        const isHost = room.users.find(u => u.user_id === user_id && u.is_host);
        if (!isHost) {
            return false;
        }
        if (!room) {
            return false;
        } else {
            room.status = 'playing';
            room.started_at = moment().format();
            await room.save();
            return room;
        }
    } catch (error) {
        console.log("START GAME ERROR", error);
        return false
    }
}