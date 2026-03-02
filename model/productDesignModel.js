const mongoose = require('mongoose');

const productDesignSchema = new mongoose.Schema({
    imageURL: {
        type: String,
        required: true,
    },
    order: {
        type: Number,
        default: 0,
    }
}, { timestamps: true });

module.exports = mongoose.model('ProductDesign', productDesignSchema);
