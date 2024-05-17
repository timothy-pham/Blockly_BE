const Group = require("../models/group");
const Collection = require("../models/collection");
const moment = require('moment');

exports.getAllGroups = async (req, res) => {
    try {
        const groups = await Group.find();
        res.status(200).json(groups);
    } catch (error) {
        console.log("GROUPS_GET_ERROR", error)
        res.status(500).json({ message: error });
    }
};

exports.getGroupById = async (req, res) => {
    try {
        const { id } = req.params;
        const group = await Group.find({ group_id: id })
        res.json(group).status(200);
    } catch (error) {
        console.log("GROUPS_GET_ERROR", error)
        res.status(500).json({ message: error });
    }
};

exports.createGroup = async (req, res) => {
    const { name, meta_data } = req.body;
    const group = new Group({
        name,
        meta_data,
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
        group.update_at = moment().format();
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