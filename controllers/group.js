const Group = require("../models/group");
const Collection = require("../models/collection");
const Block = require("../models/block");
const moment = require('moment');
const { encryptJSON, decrypt } = require('../utils/encryption');
require('dotenv').config()
const encryptKey = process.env.ENCRYPT_KEY;

exports.getAllGroups = async (req, res) => {
    try {
        const groups = await Group.aggregate([
            {
                $lookup: {
                    from: 'collections',
                    localField: 'collection_id',
                    foreignField: 'collection_id',
                    as: 'collection'
                }
            },
            {
                $unwind: {
                    path: '$collection',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    collection_id: 0
                }
            },
            {
                $sort: { group_id: 1 }
            }
        ]);
        res.status(200).json(groups);
    } catch (error) {
        console.log("GROUPS_GET_ERROR", error)
        res.status(500).json({ message: error });
    }
};

exports.getGroupById = async (req, res) => {
    try {
        const { id } = req.params;
        const group = await Group.aggregate([
            {
                $match: { group_id: parseInt(id) }
            },
            {
                $lookup: {
                    from: 'collections',
                    localField: 'collection_id',
                    foreignField: 'collection_id',
                    as: 'collection'
                }
            },
            {
                $unwind: {
                    path: '$collection',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    collection_id: 0
                }
            },
        ]);
        if (group.length === 0) {
            return res.status(404).json({ message: "Group not found" });
        }
        res.status(200).json(group[0]);
    } catch (error) {
        console.log("GROUPS_GET_ERROR", error)
        res.status(500).json({ message: error });
    }
};

exports.createGroup = async (req, res) => {
    const { name, meta_data, collection_id } = req.body;
    const group = new Group({
        name,
        meta_data,
        collection_id,
        timestamp: moment().unix()
    });
    try {
        const savedGroup = await group.save();
        res.json(savedGroup).status(201);
    } catch (error) {
        console.log("GROUPS_POST_ERROR", error)
        res.status(500).json({ message: error });
    }
}

exports.updateGroup = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, collection_id, meta_data } = req.body;
        const group = await Group.findOne({ group_id: id });
        if (!group) {
            return res.status(404).json({ message: "Group not found" });
        }
        const collection = await Collection.findOne({ collection_id: collection_id });
        if (!collection) {
            return res.status(404).json({ message: "Collection not found" });
        }
        group.collection_id = collection_id;
        if (name) group.name = name;
        if (meta_data) {
            group.meta_data = {
                ...group.meta_data,
                ...meta_data
            }
        }
        group.updated_at = moment().format();
        group.timestamp = moment().unix();

        const updatedGroup = await group.save();
        res.json(updatedGroup).status(200);
    } catch (error) {
        console.log("GROUPS_PATCH_ERROR", error)
        res.status(500).json({ message: error });
    }
}

exports.deleteGroup = async (req, res) => {
    const { id } = req.params;
    try {
        const group = await Group.findOneAndDelete({ group_id: id });
        res.status(200).json({ message: "Group deleted successfully" });
    } catch (error) {
        console.log("GROUPS_DELETE_ERROR", error)
        res.status(500).json({ message: error });
    }
}

exports.searchGroups = async (req, res) => {
    try {
        const { name, collection_id } = req.query;
        const groups = await Group.aggregate([
            {
                $match: {
                    $and: [
                        name ? { name: { $regex: name, $options: 'i' } } : {},
                        collection_id ? { collection_id: parseInt(collection_id) } : {},
                    ]
                }
            },
            {
                $lookup: {
                    from: 'collections',
                    localField: 'collection_id',
                    foreignField: 'collection_id',
                    as: 'collection'
                }
            },
            {
                $unwind: {
                    path: '$collection',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    collection_id: 0
                }
            },
            {
                $sort: { group_id: 1 }
            }
        ]);
        res.status(200).json(groups);
    } catch (error) {
        console.log("GROUPS_SEARCH_ERROR", error)
        res.status(500).json({ message: error });
    }
}

exports.exportGroups = async (req, res) => {
    try {
        const { ids, raw_data } = req.body;
        // Fetch all groups
        let groups = await Group.find(
            ids && ids.length > 0 ? { group_id: { $in: ids } } : {}
        );

        if (!raw_data) {
            for (let i = 0;i < groups.length;i++) {
                let blocks = await Block.find({ group_id: groups[i].group_id });
                groups[i] = groups[i].toObject(); // Convert to plain object if it's a Mongoose document
                groups[i].blocks = blocks;
            }
        }
        const key = encryptKey + "group";
        const encryptData = encryptJSON(groups, key);
        res.status(200).send(encryptData);
    } catch (error) {
        console.error("GROUPS_GET_ERROR", error);
        res.status(500).json({ message: error.message });
    }
}

exports.importGroups = async (req, res) => {
    try {
        const data = req.body.data;
        const key = encryptKey + "group";
        const decryptedData = decrypt(data, key);
        const groups = JSON.parse(decryptedData);

        for (let i = 0;i < groups.length;i++) {
            let group = groups[i];
            let blocks = group.blocks;
            delete group.blocks;
            delete group.group_id;
            delete group.created_at;
            delete group.updated_at;
            delete group.timestamp;
            delete group.__v;
            delete group._id;
            group = new Group({
                ...group,
                created_at: moment().format(),
                updated_at: moment().format(),
                timestamp: moment().unix()
            });
            await group.save();

            for (let j = 0;j < blocks.length;j++) {
                let block = blocks[j];
                delete block.block_id;
                delete block.created_at;
                delete block.updated_at;
                delete block.timestamp;
                delete block.__v;
                delete block._id;
                block = new Block({
                    ...block,
                    group_id: group.group_id,
                    created_at: moment().format(),
                    updated_at: moment().format(),
                    timestamp: moment().unix()
                });
                await block.save();
            }
        }

        res.status(201).json({ message: "Groups imported successfully" });
    } catch (error) {
        console.error("GROUPS_IMPORT_ERROR", error);
        res.status(500).json({ message: error.message });
    }
}