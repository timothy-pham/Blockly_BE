const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const roomSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    users: {
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
    update_at: {
        type: Date,
        default: Date.now
    },
    timestamp: {
        type: Number
    }
});

roomSchema.plugin(AutoIncrement, { inc_field: 'room_id' });

module.exports = mongoose.model('Room', roomSchema);