const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);
const blockSchema = new mongoose.Schema({
    // using id instead of slug
    // slug: {
    //     type: String,
    //     required: true,
    //     unique: true
    // },
    name: {
        type: String,
        required: true
    },
    data: {
        type: Object,
        required: true
    },
    question: {
        type: String,
        required: true
    },
    answer: {
        type: String,
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
    update_at: {
        type: Date,
        default: Date.now
    },
    timestamp: {
        type: Number
    }
});

blockSchema.plugin(AutoIncrement, { inc_field: 'block_id' });

module.exports = mongoose.model('Block', blockSchema);