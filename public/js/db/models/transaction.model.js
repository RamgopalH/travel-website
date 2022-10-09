const { ObjectId } = require('bson');
const mongoose = require('mongoose');
const PackageSchema = require('./package.model').PackageSchema;

const TransactionSchema = new mongoose.Schema({
    cost: {
        type: Number,
        required: true
    },
    userId: {
        type: ObjectId,
        required: true
    },
    package: PackageSchema,
}, {timestamps: true,});

const Transaction = mongoose.model('Transaction', TransactionSchema);

module.exports = Transaction;