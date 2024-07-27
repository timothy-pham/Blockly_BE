const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);
const { Schema } = mongoose;

const roomSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
    },
    status: {
        type: String,
        required: true,
        enum: ['waiting', 'playing', 'finished']
    },
    users: {
        type: [{
            user_id: {
                type: Schema.Types.Mixed,
                required: true
            },
            user_data: {
                type: Object,
            },
            blocks: {
                type: Array,
                default: []
            },
            score: {
                type: Number,
                default: 0
            },
            wrong_answers: {
                type: Object,
                default: {}
            },
            end_timestamp: {
                type: Number,
            },
            end_time: {
                type: String,
            },
            is_ready: {
                type: Boolean,
                default: false
            },
            is_host: {
                type: Boolean,
                default: false
            },
            is_connected: {
                type: Boolean,
                default: false
            },
            status: {
                type: String,
                enum: ['waiting', 'playing', 'finished'],
                default: 'waiting'
            },
            is_bot: {
                type: Boolean,
                default: false
            },
            level: {
                type: String,
                enum: ['easy', 'medium', 'hard', 'hell'],
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