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
                    $or: [
                        { status: 'waiting' },
                        { status: 'playing' }
                    ]
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
        const io = req.io;
        io.emit("refresh_rooms");
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
            console.log("NOT HOST")
            return false;
        }
        if (!room) {
            console.log("NO ROOM")
            return false;
        } else {
            // all user is connecting must be ready
            const users = room.users;
            let isAllReady = true;
            users.forEach(u => {
                if (!u.is_ready && u.is_connected) {
                    isAllReady = false;
                }
            });
            if (!isAllReady) {
                console.log("NOT READY")
                return false;
            }
            const group = await Group.findOne({ group_id: room.meta_data?.group_id });
            if (!group) {
                console.log("NO GROUP")
                return false;
            }
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
            room.users = room.users.map(u => {
                return {
                    ...u,
                    status: 'playing',
                }
            }); // set user.status = playing
            room.meta_data = {
                ...room.meta_data,
                blocks,
                started_at: moment().format(),
                started_timestamp: moment().unix(),
                timer: group.meta_data?.timer || 30
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
        let room = await Room.findOne({ room_id });
        if (!room) {
            return false;
        } else {
            if (room.status !== 'playing') {
                return false;
            }
            let totalQuestion = room.meta_data?.count || 5;

            let has_winner = false;
            const users = room.users.map(u => {
                if (u.user_id === user_id && block.answered === true && !u.blocks.includes(block.block_id)) {
                    u.blocks = [...u.blocks, block.block_id];
                    u.score += 1;
                    u.end_timestamp = moment().unix();
                    u.end_time = moment().diff(moment(room.meta_data.started_at), 'milliseconds');
                    if (u.score >= totalQuestion) {
                        has_winner = u;
                    }
                }
                return u;
            });
            room.users = users;
            if (has_winner?.user_id) {

                room.status = 'finished';
                room.meta_data = {
                    ...room.meta_data,
                    winner: has_winner
                }
                await room.save();
                const data = await updatePoints(room);
                io.to(room_id).emit("end_game", data);
                winner = has_winner;
                io.emit("new_winner", { user: winner, room_id: room_id })
                io.emit("refresh_rooms");
            } else {
                await room.save();
                return room;
            }
        }
    } catch (error) {
        return false
    }
}

exports.updateWrong = async (room_id, data, io) => {
    try {
        const { block, user_id } = data;
        let room = await Room.findOne({ room_id });
        if (!room) {
            return false;
        } else {
            if (room.status !== 'playing') {
                return false;
            }
            const userIndex = room.users.findIndex(u => u.user_id === user_id);
            if (userIndex === -1) {
                return false;
            }

            let user = room.users[userIndex];
            let newCount = user.wrong_answers[block.block_id] ? user.wrong_answers[block.block_id] + 1 : 1;
            if (block?.skip) {
                user.wrong_answers[block.block_id] = 3;
            } else {
                user.wrong_answers[block.block_id] = newCount;
            }
            if (newCount === 3 || block?.skip) {
                user.blocks.push(block.block_id);
            }

            room.users[userIndex] = user; // Updating the user in the array

            await Room.updateOne(
                { room_id, 'users.user_id': user_id },
                {
                    '$set': {
                        'users.$': user
                    }
                }
            );

            return room;
        }
    } catch (error) {
        console.log("UPDATE WRONG ERROR", error);
        return false;
    }
}


exports.endGame = async (room_id, io) => {
    try {

        let room = await Room.findOne({ room_id });
        if (!room) {
            return false;
        }
        let timer = room.meta_data?.timer * 1000 * 60 || 30;
        timer = timer + 5000;
        try {
            setTimeout(async () => {
                await endGameHandle(room_id, io);
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

exports.endGameNow = async (room_id, io) => {
    try {
        let room = await Room.findOne({ room_id });
        if (!room) {
            return false;
        }
        await endGameHandle(room_id, io);
    } catch (error) {
        console.log("🚀 ~ exports.endGameNow ~ error:", error)
        return false
    }
}

async function endGameHandle(
    room_id,
    io
) {
    let room = await Room.findOne({ room_id });
    if (room.status !== 'playing') {
        return;
    }
    let winner = getWinner(room);
    room.status = 'finished';
    room.meta_data = {
        ...room.meta_data,
        winner: winner
    }
    room = await saveWithRetry(room);
    await updatePoints(room);
    io.to(room_id).emit("end_game", room);
    winner = await getWinner(room);
    if (winner?.score > 0) {
        io.emit("new_winner", { user: winner, room_id: room_id })
    }
    io.emit("refresh_rooms");
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

exports.getRoomHistories = async (req, res) => {
    try {
        // room is finished and have winner
        const rooms = await Room.aggregate([
            {
                $match: {
                    status: 'finished',
                    'meta_data.winner': { $exists: true }
                }
            },
            {
                $sort: { 'meta_data.started_timestamp': -1 }
            }
        ]);
        res.status(200).json(rooms);
    } catch (error) {
        console.log("GET ROOM HISTORY ERROR", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

exports.getRoomHistoriesStudents = async (req, res) => {
    try {
        const userRequestData = User.findOne({ user_id: req.user.user_id });
        const listStudents = userRequestData.meta_data.students;
        const rooms = await Room.aggregate([
            {
                $match: {
                    status: 'finished',
                    'meta_data.winner': { $exists: true },
                    'users.user_id': { $in: listStudents }
                }
            },
            {
                $sort: { 'meta_data.started_timestamp': -1 }
            }
        ]);
        res.status(200).json(rooms);
    } catch (error) {
        console.log("GET ROOM HISTORY ERROR", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

exports.getUserHistories = async (req, res) => {
    try {
        const user_id = req.params.user_id;
        // room is finished and have winner and room.users have user_id
        console.log("GET USER HISTORY", user_id)
        const rooms = await Room.aggregate([
            {
                $match: {
                    status: 'finished',
                    'meta_data.winner': { $exists: true },
                    'users.user_id': parseInt(user_id)
                }
            },
            {
                $sort: { 'meta_data.started_timestamp': -1 }
            }
        ]);
        res.status(200).json(rooms);
    } catch (error) {
        console.log("GET USER HISTORY ERROR", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

const updatePoints = async (room_input) => {
    try {
        console.log("UPDATE POINTS", room_input.room_id)
        let room = await Room.findOne({ room_id: room_input.room_id });
        if (room.status == 'waiting' || room.status == 'playing') {
            return;
        }
        const users_played = room.users.filter(u => u.score > 0);
        const user_list = users_played.sort((a, b) => {
            if (a.score === b.score) {
                return a.end_timestamp - b.end_timestamp;
            }
            return b.score - a.score;
        });

        // 1st place 100 points, 2nd place 75 points, 3rd place 50 points, > 3rd place 5 points if score > 0
        for (const [index, user] of user_list.entries()) {
            let points = 0;
            if (index === 0) {
                points = 100;
            } else if (index === 1) {
                points = 75;
            } else if (index === 2) {
                points = 50;
            } else {
                points = 5;
            }

            const user_data = await User.findOne({ user_id: user.user_id });
            const new_points = user_data.meta_data?.points ? user_data.meta_data.points + points : points;
            let points_history = user_data.meta_data?.points_history || [];
            let matches = user_data.meta_data?.matches || 0;

            points_history.push({
                room_id: room.room_id,
                points,
                created_at: moment().format()
            });

            user_data.meta_data = {
                ...user_data.meta_data,
                points: new_points,
                matches: matches + 1,
                points_history
            };

            await user_data.save();
            const oldUser = room.users.find(u => u.user_id === user.user_id)
            oldUser.user_data = {
                ...oldUser.user_data,
                meta_data: user_data.meta_data
            }
        }
        return await room.save();
    } catch (error) {
        console.log("🚀 ~ updatePoints ~ error:", error);
    }
};

exports.kickUser = async (room_id, data, host_id) => {
    try {
        // check is host
        const room = await Room.findOne({ room_id });
        if (!room) {
            return false;
        }
        const isHost = room.users.find(u => u.user_id === host_id && u.is_host);
        if (!isHost) {
            return false;
        }
        const user_id = data.user_id;
        const users = room.users;
        const user = users.find(u => u.user_id === user_id);
        if (!user) {
            return false;
        }
        const index = users.findIndex(u => u.user_id === user_id);
        const userKicked = users[index];
        console.log("KICK USER", userKicked?.user_data?.name)
        users.splice(index, 1);
        room.meta_data = {
            ...room.meta_data,
            total_users: room.meta_data.total_users - 1
        }
        room.users = users;
        await room.save();
        return { room_data: room, userKicked }
    } catch (error) {
        console.log("KICK USER ERROR", error);
    }
}

exports.userFinish = async (room_id, user_id, data) => {
    try {
        const room = await Room.findOne({ room_id })
        if (!room) {
            return false;
        }
        const user = room.users.find(u => u.user_id === user_id);
        if (!user) {
            return false;
        }
        user.status = 'finished';
        await room.save();
        return room;
    } catch (error) {
        console.log("USER FINISH ERROR", error);
        return false
    }
}