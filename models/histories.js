const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const historiesSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true,
        enum: ['normal', 'solo', 'multiplayer']
    },
    user_id: {
        type: Number,
    },
    room_id: {
        type: Number,
    },
    collection_id: {
        type: Number,
        required: true
    },
    group_id: {
        type: Number,
        required: true
    },
    result: {
        type: Array,
        required: true
    },
    meta_data: {
        type: Object,
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
        default: Date.now
    },
    timestamp: {
        type: Number
    }
});

historiesSchema.plugin(AutoIncrement, { inc_field: 'histories_id' });

module.exports = mongoose.model('History', historiesSchema);