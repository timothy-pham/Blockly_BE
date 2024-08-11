const History = require("../models/histories");
const Room = require("../models/room");
const User = require("../models/user");
const Collection = require("../models/collection");
const Group = require("../models/group");
const Block = require("../models/block");
const moment = require('moment');
const { botConfig } = require("../utils/bot_config");

exports.getAllRooms = async (req, res) => {
    try {
        const { all } = req.query;
        const userRequestRole = req.user.role;
        const match = all && userRequestRole == 'admin' ? {} : {
            $or: [
                { status: 'waiting' },
                { status: 'playing' }
            ]
        }
        const rooms = await Room.aggregate([
            {
                $match: match
            },
            {
                $sort: {
                    room_id: -1
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

exports.getBotConfig = async (req, res) => {
    try {
        const levels = Object.keys(botConfig.levels);
        let data = []
        for (const level of levels) {
            data.push({
                name: botConfig.levels[level].name,
                level: level
            });
        }
        res.status(200).json(data);
    } catch (error) {
        console.log("GET BOT CONFIG ERROR", error);
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
exports.markRoomFinished = async (req, res) => {
    try {
        const { ids } = req.body;
        const io = req.io;
        const result = await Room.updateMany({ room_id: { $in: ids } }, { status: 'finished' });
        if (result?.modifiedCount > 0) {
            io.emit("refresh_rooms");
            res.status(200).json({ message: result?.modifiedCount + "rooms marked as finished" });
        }
        else {
            res.status(404).json({ message: "Rooms not found" });
        }
    } catch (error) {
        console.log("MARK ROOM FINISHED ERROR", error);
        res.status(500).json({ message: "Internal server error" });
    }
}
exports.getUsersOnline = async (req, res) => {
    try {
        const io = req.io;
        // parse onject to array
        const onlineUsers = Object.values(io.onlineUsers);
        res.status(200).json(onlineUsers);
    } catch (error) {
        console.log("GET USERS ONLINE ERROR", error);
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
        let room = await Room.findOne({ room_id })
        if (!room) {
            return false;
        } else {
            const users = room.users;
            let is_host = false;
            users.forEach(u => {
                if (u.user_id === user_id) {
                    u.is_connected = false;
                    if (u.is_host) {
                        is_host = true;
                    }
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
            if (isAllDisconnected || is_host) {
                room.status = 'finished';
            }
            await room.save();
            return room;
        }
    } catch (error) {
        console.log("LEAVE ROOM ERROR", error);
        return false
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
            // console.log("Room meta data", room.meta_data)
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
            const size = room?.meta_data?.count || 5;
            const blocks = await Block.aggregate([
                {
                    $match: {
                        group_id: room.meta_data?.group_id
                    }
                },
                {
                    $sample: { size: size }
                },
                {
                    $project: {
                        answers: 0,
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
            let totalQuestion = room.meta_data?.count || room.meta_data.blocks?.length;

            let has_winner = false;
            const users = room.users.map(u => {
                if (u.user_id === user_id && !u.blocks.includes(block.block_id)) {
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
            if (user.is_bot) {
                continue;
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

const userFinishhandle = async (room_id, user_id, data) => {
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
exports.userFinish = async (room_id, user_id, data) => {
    userFinishhandle(room_id, user_id, data);
}

exports.addBot = async (room_id, data) => {
    try {
        let room = await Room.findOne({ room_id });
        if (!room) {
            return false;
        }
        const name = botConfig.names[Math.floor(Math.random() * botConfig.names.length)] + " " + botConfig.levels[data.bot_level].name.split(" - ")[0];
        const count = room.users.find(u => u.user_id.toString().includes("bot_")) ? room.users.filter(u => u.user_id.toString().includes("bot_")).length : 0;
        // get random 1 - 5
        const random = Math.floor(Math.random() * 5) + 1;
        const avatar = "/bot_avatar/" + `${data.bot_level}_${random}.jpg`;
        const user = {
            user_id: "bot_" + count,
            user_data: {
                name,
                user_id: "bot_" + count,
                role: "student",
                meta_data: {
                    avatar: avatar,
                    points: 0,
                    matches: 0,
                }
            },
            is_ready: true,
            is_host: false,
            is_connected: true,
            is_bot: true,
            level: data.bot_level,
            status: 'waiting',
            blocks: [],
            score: 0,
            end_timestamp: moment().unix(),
            end_time: '0',
        }
        room.users.push(user);
        await room.save();
        return room;
    } catch (error) {
        console.log("ADD BOT ERROR", error);
        return false
    }
}

exports.handleBot = async (room_id, io) => {
    try {
        const room = await Room.findOne({ room_id });
        if (!room) {
            return false;
        }
        const bots = room.users.filter(u => u.is_bot);
        if (bots.length === 0) {
            return false;
        }
        console.log("HANDLE BOT", bots.length)
        for (const bot of bots) {
            const bot_level = bot.level;
            const bot_id = bot.user_id;
            const bot_config = botConfig.levels[bot_level];
            const bot_data = {
                room_id,
                bot_id,
                bot_level,
                bot_config,
                io
            }
            // Run botAction concurrently
            botAction(bot_data);
        }
        return true;
    } catch (error) {
        console.log("HANDLE BOT ERROR", error);
        return false;
    }
}

const botAction = async (bot_data) => {
    try {
        const time = Math.floor(Math.random() * (bot_data.bot_config.maxTime - bot_data.bot_config.minTime + 1) + bot_data.bot_config.minTime);
        // console.log("BOT ACTION time", time)
        const room = await Room.findOne({ room_id: bot_data.room_id });
        const blocks = room.meta_data.blocks;
        const bot_config = bot_data.bot_config;
        // console.log("BOT ACTION config", bot_config)

        // Wait 5 seconds
        await new Promise((resolve) => {
            setTimeout(() => {
                resolve();
            }, 5000);
        });

        // Process each block
        for (const block of blocks) {
            const percentAnswer = bot_config.percentAnswer * 100;
            const randomNum = Math.random() * 100;
            const is_True = randomNum <= percentAnswer;

            const data = {
                block,
                user_id: bot_data.bot_id,
                wrong: !is_True
            }

            // console.log("BOT DATA UPDATE", block.block_id, is_True, bot_data.bot_id)

            await new Promise((resolve) => {
                setTimeout(async () => {
                    await updateRankingBot(bot_data.room_id, data, bot_data.io);
                    resolve();
                }, time * 1000);
            });
        }

        const finishData = await userFinishhandle(bot_data.room_id, bot_data.bot_id, {});
        if (finishData) {
            bot_data.io.to(bot_data.room_id).emit("user_finish", finishData);
            let isAllFinished = true;
            finishData.users.forEach(user => {
                if (user.status !== 'finished') {
                    isAllFinished = false;
                }
            });
            if (isAllFinished) {
                await endGameNow(bot_data.room_id, bot_data.io);
            }
        }
    } catch (error) {
        console.log("BOT ACTION ERROR", error);
        return false;
    }
}

const updateRankingBot = async (room_id, data, io) => {
    try {
        const retryLimit = 3;
        let retryCount = 0;
        let success = false;

        while (!success && retryCount < retryLimit) {
            try {
                const { block, user_id, wrong } = data;
                let room = await Room.findOne({ room_id });
                if (!room) {
                    return false;
                } else {
                    if (room.status !== 'playing') {
                        return false;
                    }
                    let totalQuestion = room.meta_data?.count || room.meta_data.blocks?.length;
                    if (!wrong) {
                        let has_winner = false;
                        const users = room.users.map(u => {
                            if (u.user_id === user_id && !u.blocks.includes(block.block_id)) {
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
                        }
                    } else {
                        const userIndex = room.users.findIndex(u => u.user_id === user_id);
                        if (userIndex === -1) {
                            return false;
                        }
                        let user = room.users[userIndex];
                        user.wrong_answers[block.block_id] = 3;
                        user.blocks.push(block.block_id);
                        room.users[userIndex] = user;

                        await Room.updateOne(
                            { room_id, 'users.user_id': user_id },
                            {
                                '$set': {
                                    'users.$': user
                                }
                            }
                        );
                    }
                    io.to(room_id).emit("ranking_update", room);
                    success = true;
                }
            } catch (error) {
                if (error.name === 'VersionError') {
                    retryCount++;
                    console.log(`Retry ${retryCount} for updateRankingBot due to version conflict`);
                } else {
                    console.log("UPDATE RANKING BOT ERROR", error);
                    return false;
                }
            }
        }

        if (!success) {
            console.log("Failed to update ranking after multiple retries");
            return false;
        }
    } catch (error) {
        console.log("UPDATE RANKING BOT ERROR", error);
        return false
    }
}