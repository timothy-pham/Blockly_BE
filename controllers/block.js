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
                $unwind: {
                    path: '$group',
                    preserveNullAndEmptyArrays: true
                }
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
                $unwind: {
                    path: '$group.collection',
                    preserveNullAndEmptyArrays: true
                }
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
                $unwind: {
                    path: '$group',
                    preserveNullAndEmptyArrays: true
                }
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
                $unwind: {
                    path: '$group.collection',
                    preserveNullAndEmptyArrays: true
                }
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
        const { name, data, question, answers, level, meta_data, type } = req.body;
        const block = new Block({
            name, data, question, answers, level, meta_data, type,
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
        const { name, type, group_id, data, question, answer, level, meta_data } = req.body;
        const block = await Block.findOne({ block_id: id });
        if (!block) {
            return res.status(404).json({ message: "Block not found" });
        }
        if (group_id) {
            const group = await Group.findOne({ group_id: group_id });
            if (!group) {
                return res.status(404).json({ message: "Group not found" });
            }
            block.group_id = group_id;
        }
        if (type) block.type = type;
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


exports.exportBlocks = async (req, res) => {
    try {
        const blocks = await Block.aggregate([
            {
                $sort: { block_id: 1 }
            },
            {
                $project: {
                    created_at: 0,
                    updated_at: 0,
                    __v: 0,
                    _id: 0,
                    timestamp: 0,
                    block_id: 0,
                }
            }
        ]);
        res.set('Content-Type', 'application/json');
        res.set('Content-Disposition', 'attachment; filename=data.json');
        res.send(Buffer.from(JSON.stringify(blocks, null, 2)));
    } catch (error) {
        console.log("BLOCKS_GET_ERROR", error)
        res.status(500).json({ message: error });
    }
};

exports.importBlocks = async (req, res) => {
    try {
        const blocks = req.body;
        await Block.create(blocks);
        res.status(201).json({ message: "Blocks imported successfully" });
    } catch (error) {
        console.log("BLOCKS_IMPORT_ERROR", error)
        res.status(500).json({ message: error });
    }
};

exports.checkAnswer = async (req, res) => {
    try {
        const { id, answers } = req.body;
        const block = await Block.findOne({ block_id: id });
        if (!block) {
            return res.status(404).json({ message: "Block not found" });
        }

        let correctCount = 0;
        let isCorrect = false;
        for (let i = 0;i < answers.length;i++) {
            let answer = answers[i].toLowerCase().replace(/\s/g, '');
            let correctAnswer = block.answers[i].toLowerCase().replace(/\s/g, '');
            if (answer === correctAnswer) {
                correctCount += 1;
            }
        }
        if (block.type === 'include') {
            if (correctCount > 0) {
                isCorrect = true;
            }
        } else {
            if (correctCount === block.answers.length) {
                isCorrect = true;
            }
        }

        if (isCorrect) {
            res.status(200).json({ correct: true, answers, message: "Correct Answer" });
        } else {
            res.status(200).json({ correct: false, answers, message: "Incorrect Answer" });

        }
    } catch (error) {
        console.log("BLOCKS_CHECK_ANSWER_ERROR", error)
        res.status(500).json({ message: error });
    }
};