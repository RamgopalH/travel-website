const { ObjectId } = require('bson');
const mongoose = require('mongoose');

const PackageSchema = new mongoose.Schema({
    level: {
        type: String,
        required: true,
    },
    destination: {
        type: String,
        required: true
    },
    from: {
        type: Date,
        reuired: true
    },
    to: {
        type: Date,
        required: true
    },
    cost: {
        type: Number,
        required: true,
    },
    discount: {
        type: Number,
        max: 0.7,
        default: 0
    }
});

const Package = mongoose.model('Package', PackageSchema);

module.exports = {
    Package,
    PackageSchema
}