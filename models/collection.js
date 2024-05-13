const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const collectionSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    blocks: {
        type: Array,
        required: true
    },
    type: {
        type: String,
        enum: ['practice', 'competition', 'quiz'],
    },
    meta_data: {
        type: Object,
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    update_at: {
        type: Date,
        default: Date.now
    },
    timestamp: {
        type: Number
    }
});

collectionSchema.plugin(AutoIncrement, { inc_field: 'collection_id' });

module.exports = mongoose.model('Collection', collectionSchema);