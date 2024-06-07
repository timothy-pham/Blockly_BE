const History = require("../models/histories");
const Room = require("../models/room");
const User = require("../models/user");
const Collection = require("../models/collection");
const Group = require("../models/group");
const Block = require("../models/block");
const moment = require('moment');

exports.getAllHistory = async (req, res) => {
    try {
        const histories = await History.aggregate([
            {
                $lookup: {
                    from: "rooms",
                    localField: "room_id",
                    foreignField: "room_id",
                    as: "room"
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "user_id",
                    foreignField: "user_id",
                    as: "user"
                }
            },
            {
                $lookup: {
                    from: "collections",
                    localField: "collection_id",
                    foreignField: "collection_id",
                    as: "collection"
                }
            },
            {
                $lookup: {
                    from: "groups",
                    localField: "group_id",
                    foreignField: "group_id",
                    as: "group"
                }
            },

            {
                $unwind: {
                    path: "$user",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $unwind: {
                    path: "$room",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $unwind: {
                    path: "$collection",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $unwind: {
                    path: "$group",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    user_id: 0,
                    room_id: 0,
                    collection_id: 0,
                    group_id: 0,
                    user: {
                        password: 0
                    }
                }
            }
        ]);

        res.status(200).json(histories);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getHistoryById = async (req, res) => {
    try {
        const histories = await History.aggregate([
            {
                $match: {
                    histories_id: parseInt(req.params.id)
                }
            },
            {
                $lookup: {
                    from: "rooms",
                    localField: "room_id",
                    foreignField: "room_id",
                    as: "room"
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "user_id",
                    foreignField: "user_id",
                    as: "user"
                }
            },
            {
                $unwind: {
                    path: "$room",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $unwind: {
                    path: "$user",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    histories_id: 1,
                    type: 1,
                    user_id: 0,
                    room_id: 0,
                    collection_id: 1,
                    group_id: 1,
                    result: 1,
                    meta_data: 1,
                    created_at: 1,
                    updated_at: 1,
                    timestamp: 1,
                    room: {
                        room_id: 1,
                        name: 1
                    },
                    user: {
                        user_id: 1,
                        username: 1
                    }
                }
            }
        ]);
        if (histories.length === 0) {
            return res.status(404).json({ message: "History not found" });
        }
        res.status(200).json(histories[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.createHistory = async (req, res) => {
    try {
        const { user_id, room_id, type, collection_id, group_id, result, meta_data, start_time } = req.body;
        const blocks = await Block.find({ group_id: group_id })
        const histories = new History({
            user_id,
            room_id,
            type,
            collection_id,
            group_id,
            result,
            meta_data: {
                ...meta_data,
                score: 0,
                total: blocks.length,
                start_time,
                end_time: start_time
            },
            created_at: moment().format(),
            updated_at: moment().format(),
            timestamp: moment().unix()
        });
        await histories.save();
        res.status(201).json(histories);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateHistory = async (req, res) => {
    try {
        const { id } = req.params;
        const { user_id, room_id, type, collection_id, group_id, result, meta_data } = req.body;
        const histories = await History.findOne({ histories_id: id });
        if (!histories) {
            return res.status(404).json({ message: "History not found" });
        }
        if (user_id) {
            const user = await User.findOne({ user_id });
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }
            histories.user_id = user_id;
        }
        if (room_id) {
            const room = await Room.findOne({ room_id });
            if (!room) {
                return res.status(404).json({ message: "Room not found" });
            }
            histories.room_id = room_id;
        }
        if (type) histories.type = type;
        if (collection_id) histories.collection_id = collection_id;
        if (group_id) histories.group_id = group_id;
        if (result) histories.result = result;
        if (meta_data) {
            histories.meta_data = {
                ...histories.meta_data,
                ...meta_data
            }
        }
        histories.updated_at = moment().format();
        await histories.save();
        res.status(200).json(histories);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteHistory = async (req, res) => {
    try {
        const { id } = req.params;
        await History.findOneAndDelete({ histories_id: id });
        res.status(200).json({ message: "History deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.addResultToHistory = async (req, res) => {
    try {
        const { id } = req.params;
        const { block_id, block_state, start_time, end_time, correct } = req.body;
        const histories = await History.findOne({ histories_id: id });
        if (!histories) {
            return res.status(404).json({ message: "History not found" });
        }
        const blocks = await Block.find({ group_id: histories.group_id });
        let isExist = blocks.some(block => block.block_id === block_id);

        if (!isExist) {
            return res.status(400).json({ message: "Block not found" });
        }
        const data = {
            block_id,
            block_state,
            start_time,
            end_time,
            correct
        }
        const isAnswerBefore = histories.result.find(history => block_id === history.block_id);
        if (isAnswerBefore) {
            histories.result = histories.result.map(history => {
                if (history.block_id === block_id) {
                    return {
                        ...history,
                        ...data
                    }
                }
                return history;
            });
        } else {
            histories.result.push({
                ...data
            });
        }


        let total = histories.meta_data?.total || blocks.length;
        let score = 0
        histories.result.forEach(history => {
            if (history.correct) {
                score++;
            }
        });

        let new_meta_data = {
            ...histories.meta_data,
            total,
            score,
            start_time: start_time,
            end_time: end_time
        }
        histories.meta_data = new_meta_data;
        histories.updated_at = moment().format();

        await histories.save();
        res.status(200).json(histories);
    } catch (error) {
        console.log("ADD_RESULT_TO_HISTORY_ERROR", error)
        res.status(500).json({ message: error.message });
    }
}

exports.getRanking = async (req, res) => {
    try {
        // get User have meta_data.points > 0
        const users = await User.aggregate([
            {
                $match: {
                    "meta_data.points": { $gt: 0 }
                }
            },
            {
                $project: {
                    user_id: 1,
                    username: 1,
                    points: "$meta_data.points",
                    matches: "$meta_data.matches",
                }
            },
            {
                $sort: {
                    points: -1
                }
            }
        ]);

        res.status(200).json(users);
    } catch (error) {
        console.log("🚀 ~ exports.getRanking= ~ error:", error)
        res.status(500).json({ message: error.message });
    }
}