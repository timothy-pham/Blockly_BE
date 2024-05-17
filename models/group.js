const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const groupSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    collection_id: {
        type: Number,
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

groupSchema.plugin(AutoIncrement, { inc_field: 'group_id' });

module.exports = mongoose.model('Group', groupSchema);