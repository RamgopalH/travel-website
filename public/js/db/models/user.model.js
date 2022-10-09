const { ObjectId } = require('bson');
const Package = require('./package.model').Package;
const mongoose = require('mongoose');

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
            let packageIds = [];
            for (let package of user.packages) {
                packageIds.push(package.packageId);
            }
            search = new Promise((resolve, reject) => {
                Package.find({ _id: { $in: packageIds } }).then((packages) => {
                    resolve(packages);
                });
            });
            search.then((packages) => {
                for(let i=0;i<packages.length;i+=1) {
                    packages[i].transactionId = user.packages[i].transactionId;
                    console.log(packages[i].transactionId);
                    console.log(packages[i]);
                }
                res(packages);
            });
        });
    });
}

const User = mongoose.model('User', UserSchema);

module.exports = User;