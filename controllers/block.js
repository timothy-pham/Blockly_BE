const Block = require("../models/block");
const Group = require("../models/group");
const moment = require('moment');

exports.getAllBlocks = async (req, res) => {
    try {
        const blocks = await Block.aggregate([
            {
                $lookup: {
                    from: 'groups',
                    localField: 'group_id',
                    foreignField: 'group_id',
                    as: 'group'
                }
            },
            {
                $unwind: '$group'
            },
            {
                $lookup: {
                    from: 'collections',
                    localField: 'group.collection_id',
                    foreignField: 'collection_id',
                    as: 'group.collection'
                }
            },
            {
                $unwind: '$group.collection'
            },
            {
                $project: {
                    group_id: 0,
                    'group.collection_id': 0
                }
            },
            {
                $sort: { block_id: 1 }
            }
        ]);
        res.status(200).json(blocks);
    } catch (error) {
        console.log("BLOCKS_GET_ERROR", error)
        res.status(500).json({ message: error });
    }
};

exports.getBlockById = async (req, res) => {
    try {
        const { id } = req.params;
        const block = await Block.aggregate([
            {
                $match: { block_id: parseInt(id) }
            },
            {
                $lookup: {
                    from: 'groups',
                    localField: 'group_id',
                    foreignField: 'group_id',
                    as: 'group'
                }
            },
            {
                $unwind: '$group'
            },
            {
                $lookup: {
                    from: 'collections',
                    localField: 'group.collection_id',
                    foreignField: 'collection_id',
                    as: 'group.collection'
                }
            },
            {
                $unwind: '$group.collection'
            },
            {
                $project: {
                    group_id: 0,
                    'group.collection_id': 0
                }
            },
        ]);
        const data = block[0];
        res.status(200).json(data);
    } catch (error) {
        console.log("BLOCKS_GET_ERROR", error)
        res.status(500).json({ message: error });
    }
};

exports.createBlock = async (req, res) => {
    try {
        const { name, data, question, answers, level, meta_data } = req.body;
        const block = new Block({
            name, data, question, answers, level, meta_data,
            created_at: moment().format('MM/DD/YYYY, hh:mm:ss'),
            updated_at: moment().format('MM/DD/YYYY, hh:mm:ss'),
            timestamp: moment().unix()
        });
        const newBlock = await block.save();
        res.status(201).json(newBlock);
    } catch (error) {
        console.log("BLOCKS_POST_ERROR", error)
        res.status(500).json({ message: error });
    }
}

exports.updateBlock = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, group_id, data, question, answer, level, meta_data } = req.body;
        const block = await Block.findOne({ block_id: id });
        if (!block) {
            return res.status(404).json({ message: "Block not found" });
        }
        const group = await Group.findOne({ group_id: group_id });
        if (!group) {
            return res.status(404).json({ message: "Group not found" });
        }
        block.group_id = group_id;
        if (name) block.name = name;
        if (data) block.data = data;
        if (question) block.question = question;
        if (answer) block.answer = answer;
        if (level) block.level = level;
        if (meta_data) {
            block.meta_data = {
                ...block.meta_data,
                ...meta_data
            }
        }
        block.updated_at = moment().format('MM/DD/YYYY, hh:mm:ss');
        await block.save();
        res.status(200).json(block);
    } catch (error) {
        console.log("BLOCKS_PATCH_ERROR", error)
        res.status(500).json({ message: error });
    }
}

exports.deleteBlock = async (req, res) => {
    try {
        const { id } = req.params;
        await Block.findOneAndDelete({ block_id: id });
        res.status(200).json({ message: "Block deleted successfully" });
    } catch (error) {
        console.log("BLOCKS_DELETE_ERROR", error)
        res.status(500).json({ message: error });
    }
}