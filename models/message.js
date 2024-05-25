const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const messageSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    room_id: {
        type: Number,
        required: true
    },
    messages: {
        type: [{
            user_id: {
                type: Number,
                required: true
            },
            message: {
                type: String,
                required: true
            },
            send_at: {
                type: Date,
                default: Date.now
            },
            timestamp: {
                type: Number,
                required: true
            }

        }],
        required: true
    },
    meta_data: {
        type: Object
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

messageSchema.plugin(AutoIncrement, { inc_field: 'message_id' });
module.exports = mongoose.model('Message', messageSchema);