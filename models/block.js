const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);
const blockSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    group_id: {
        type: Number,
    },
    data: {
        type: Object,
        required: true
    },
    type: {
        type: String,
        enum: ['include', 'all'],
        required: true
    },
    question: {
        type: String,
        required: true
    },
    answers: {
        type: Array,
        required: true
    },
    level: {
        type: Number,
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

blockSchema.plugin(AutoIncrement, { inc_field: 'block_id' });

module.exports = mongoose.model('Block', blockSchema);