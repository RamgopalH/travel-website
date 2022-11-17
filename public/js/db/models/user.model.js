const { ObjectId } = require('bson');
const Package = require('./package.model').Package;
const mongoose = require('mongoose');
const Transaction = require('./transaction.model');

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        minlength: 1,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        minlength: 8,
        required: true,
    },
    mobile: {
        type: String,
        minlength: 10,
        maxlength: 10,
        required: true,
        trim: true
    },
    packages: [{
        packageId: {
            type: ObjectId
        },
        transactionId: {
            type: ObjectId
        }
    }]
});

UserSchema.statics.getPackages = function (userId) {
    let User = this;
    let packages = [];
    return new Promise((res, rej) => {
        User.findById(userId).then((user) => {
            if (!user) {
                console.log('User Not found');
                rej('user Not Found');
            }
            let transactionIds = [];
            for (let package of user.packages) {
                transactionIds.push(package.transactionId);
            }
            console.log(transactionIds);
            search = new Promise((resolve, reject) => {
                Transaction.find({ _id: { $in: transactionIds } }).then((transactions) => {
                    resolve(transactions);
                });
            });
            search.then((transactions) => {
                res(transactions);
            });
        });
    });
}

const User = mongoose.model('User', UserSchema);

module.exports = User;