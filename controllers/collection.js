const Collection = require("../models/collection");
const moment = require('moment');
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
        const { name, blocks, meta_data } = req.body;

        // Tìm tài liệu hiện tại
        const collection = await Collection.findOne({ collection_id: id });
        if (!collection) {
            return res.status(404).json({ message: "Collection not found" });
        }

        // Cập nhật các trường cơ bản
        if (name) collection.name = name;
        if (blocks) collection.blocks = blocks;

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