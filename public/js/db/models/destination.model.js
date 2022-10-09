const { ObjectId } = require('bson');
const mongoose = require('mongoose');

const DestinationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String, 
        required: true
    },  
    image: {
        type: String
    }, 
    location: {
        latitude: {
            type: Number
        },
        longitude: {
            type: Number
        }
    },
    popularity: {
        type: Number
    }
});

const Destination = mongoose.model('Destination', DestinationSchema);

module.exports = Destination;