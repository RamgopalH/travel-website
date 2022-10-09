const User = require('./user.model');
const Package = require('./package.model').Package;
const Transaction = require('./transaction.model'); 
const Destination = require('./destination.model');

module.exports = {
    User,
    Package,
    Transaction,
    Destination
}