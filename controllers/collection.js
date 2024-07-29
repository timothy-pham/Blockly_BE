const Collection = require("../models/collection");
const Group = require("../models/group");
const Block = require("../models/block");
const moment = require('moment');
const { encryptJSON, decrypt } = require('../utils/encryption');
require('dotenv').config()
const encryptKey = process.env.ENCRYPT_KEY;

exports.getAllCollections = async (req, res) => {
    try {
        const collections = await Collection.find();
        res.status(200).json(collections);
    } catch (error) {
        console.log("BLOCKS_GET_ERROR", error)
        res.status(500).json({ message: error });
    }
};

exports.getCollectionById = async (req, res) => {
    try {
        const { id } = req.params;
        const collection = await Collection.find({
            collection_id: id
        })
        if (!collection) {
            return res.status(404).json({ message: "Collection not found" });
        }
        res.status(200).json(collection);
    } catch (error) {
        console.log("BLOCKS_GET_ERROR", error)
        res.status(500).json({ message: error });
    }
};

exports.createCollection = async (req, res) => {

    try {
        const { name, blocks, type, meta_data } = req.body;
        const collection = new Collection({
            name,
            blocks,
            type,
            meta_data,
            created_at: moment().format(),
            updated_at: moment().format(),
            timestamp: moment().unix()
        });
        await collection.save();
        res.status(201).json(collection);
    } catch (error) {
        console.log("BLOCKS_POST_ERROR", error)
        res.status(500).json({ message: error });
    }

};

exports.updateCollection = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, blocks, type, meta_data } = req.body;

        // Tìm tài liệu hiện tại
        const collection = await Collection.findOne({ collection_id: id });
        if (!collection) {
            return res.status(404).json({ message: "Collection not found" });
        }

        // Cập nhật các trường cơ bản
        if (name) collection.name = name;
        if (blocks) collection.blocks = blocks;
        if (type) collection.type = type;
        // Cập nhật trường meta_data
        if (meta_data) {
            // Kết hợp các trường mới với các trường cũ
            collection.meta_data = {
                ...collection.meta_data, // giữ lại các trường cũ
                ...meta_data // ghi đè các trường mới
            };
        }

        // Cập nhật các trường hệ thống
        collection.updated_at = moment().format();
        collection.timestamp = moment().unix();

        // Lưu tài liệu đã cập nhật
        await collection.save();

        // Trả về tài liệu đã cập nhật
        res.status(200).json(collection);
    } catch (error) {
        console.log("BLOCKS_PATCH_ERROR", error)
        res.status(500).json({ message: error });
    }
}

exports.deleteCollection = async (req, res) => {
    try {
        const { id } = req.params;
        await Collection.findOneAndDelete({
            collection_id: id
        })
        res.status(200).json({ message: "Collection deleted successfully" });
    } catch (error) {
        console.log("BLOCKS_DELETE_ERROR", error)
        res.status(500).json({ message: error });
    }
};

exports.exportCollection = async (req, res) => {
    try {
        const { ids, raw_data } = req.body;
        // Fetch all collections
        let collections = await Collection.find(
            ids && ids.length > 0 ? { collection_id: { $in: ids } } : {}
        );
        if (!raw_data) {
            for (let i = 0;i < collections.length;i++) {
                let groups = await Group.find({ collection_id: collections[i].collection_id });
                for (let j = 0;j < groups.length;j++) {
                    let blocks = await Block.find({ group_id: groups[j].group_id });
                    groups[j] = groups[j].toObject(); // Convert to plain object if it's a Mongoose document
                    groups[j].blocks = blocks;
                }

                collections[i] = collections[i].toObject(); // Convert to plain object if it's a Mongoose document
                collections[i].groups = groups;
            }
        }
        const key = encryptKey + "collection";
        const encryptData = encryptJSON(collections, key);
        res.status(200).send(encryptData);
    } catch (error) {
        console.error("BLOCKS_GET_ERROR", error);
        res.status(500).json({ message: error.message });
    }
};

exports.importCollection = async (req, res) => {
    try {
        const data = req.body.data;
        const key = encryptKey + "collection";
        const decryptedData = decrypt(data, key);
        const collections = JSON.parse(decryptedData);
        for (let i = 0;i < collections.length;i++) {
            let collection = collections[i];
            let groups = collection.groups;
            delete collection.groups;
            delete collection.collection_id;
            delete collection.created_at;
            delete collection.updated_at;
            delete collection.timestamp;
            delete collection.__v;
            delete collection._id;
            collection = new Collection({
                ...collection,
                created_at: moment().format(),
                updated_at: moment().format(),
                timestamp: moment().unix()
            });
            await collection.save();

            for (let j = 0;j < groups.length;j++) {
                let blocks = groups[j].blocks;
                delete groups[j].blocks;
                delete groups[j].group_id;
                delete groups[j].created_at;
                delete groups[j].updated_at;
                delete groups[j].timestamp;
                delete groups[j].__v;
                delete groups[j]._id;

                let group = new Group({
                    ...groups[j],
                    collection_id: collection.collection_id,
                    created_at: moment().format(),
                    updated_at: moment().format(),
                    timestamp: moment().unix()
                });

                await group.save();

                for (let k = 0;k < blocks.length;k++) {
                    let block = blocks[k];
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
        }

        res.status(201).json({ message: "Collections imported successfully" });
    } catch (error) {
        console.error("BLOCKS_POST_ERROR", error);
        res.status(500).json({ message: error.message });
    }
}