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
                is_host: true,
                end_timestamp: moment().unix(),
                end_time: 0,
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
                        is_connected: true,
                        end_timestamp: moment().unix(),
                        end_time: 0,
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
            const blocks = await Block.aggregate([
                {
                    $match: {
                        group_id: room.meta_data?.group_id
                    }
                },
                {
                    $sample: { size: 5 }
                },
                {
                    $project: {
                        created_at: 0,
                        updated_at: 0,
                        __v: 0,
                        _id: 0,
                        timestamp: 0,
                    }
                }
            ]);
            room.meta_data = {
                ...room.meta_data,
                blocks,
                started_at: moment().format(),
                started_timestamp: moment().unix()
            }
            room.status = 'playing';
            await room.save();
            return room;
        }
    } catch (error) {
        console.log("START GAME ERROR", error);
        return false
    }
}

exports.updateRanking = async (room_id, data, io) => {
    try {
        const { block, user_id } = data;
        const room = await Room.findOne({ room_id });
        if (!room) {
            return false;
        } else {
            let has_winner = room.users.find(u => u.score >= 5) || false;
            console.log("HAS WINNER", has_winner)
            const users = room.users.map(u => {
                if (u.user_id === user_id && block.answered === true && !u.blocks.includes(block.block_id)) {
                    u.blocks = [...u.blocks, block.block_id];
                    u.score += 1;
                    u.end_timestamp = moment().unix();
                    u.end_time = moment().diff(moment(room.meta_data.started_at), 'milliseconds');
                    if (!has_winner && u.score >= 5) {
                        has_winner = u;
                    }
                }
                return u;
            });
            room.users = users;
            if (has_winner) {
                room.status = 'finished';
                room.meta_data = {
                    ...room.meta_data,
                    winner: has_winner
                }
                io.to(room_id).emit("game_end", room);
                winner = has_winner;
                io.emit("new_winner", { user: winner, room_id: room_id })
            }
            await room.save();
            return room;
        }
    } catch (error) {
        return false
    }
}

exports.endGame = async (room_id, io) => {
    try {
        // let timer = 10 * 1000 * 60;
        let timer = 60000;
        let room = await Room.findOne({ room_id });
        if (!room) {
            return false;
        }
        const group = await Group.findOne({ group_id: room.meta_data.group_id });
        if (!group) {
            return false;
        }
        timer = group.meta_data?.timer || timer;
        try {
            setTimeout(async () => {
                room = await Room.findOne({ room_id });
                if (room.status === 'finished') {
                    return;
                }
                let winner = await getWinner(room);
                room.status = 'finished';
                room.meta_data = {
                    ...room.meta_data,
                    winner: winner
                }
                room = await saveWithRetry(room);
                io.to(room_id).emit("game_end", room);
                winner = await getWinner(room);
                io.emit("new_winner", { user: winner, room_id: room_id })
            }, timer);
        } catch (error) {
            console.log("🚀 ~ exports.endGame= ~ error:", error)
            return false
        }

    } catch (error) {
        console.log("🚀 ~ exports.endGame= ~ error:", error)
        return false
    }
}

async function getWinner(room) {
    const users = room.users;
    return users.sort((a, b) => {
        if (a.score === b.score) {
            return a.end_timestamp - b.end_timestamp
        }
        return b.score - a.score
    })[0];

}

async function saveWithRetry(doc, retries = 3) {
    while (retries > 0) {
        try {
            await doc.save();
            return doc;
        } catch (error) {
            if (error.name === 'VersionError' && retries > 1) {
                retries--;
                // Refetch the latest document from the database
                const freshDoc = await Room.findById(doc._id);
                if (freshDoc) {
                    doc.users = freshDoc.users;
                    doc.status = 'finished';
                }
            } else {
                throw error;
            }
        }
    }
}