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
    status: {
        type: String,
        required: true,
        enum: ['waiting', 'playing', 'finished']
    },
    users: {
        type: [{
            user_id: {
                type: Number,
                required: true
            },
            user_data: {
                type: Object,
                required: true
            },
            is_ready: {
                type: Boolean,
                default: false
            },
            is_host: {
                type: Boolean,
                default: false
            }
        }],
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

roomSchema.plugin(AutoIncrement, { inc_field: 'room_id' });

module.exports = mongoose.model('Room', roomSchema);