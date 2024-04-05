const mongoose = require('mongoose');
const { Schema } = mongoose;
const Photo = require("./photo");
const photoSchema = mongoose.model("Photo").schema;

const eventSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    date: {
        type: String
    },
    photos: [
        {
            url: String,
            filename: String
        }
    ]
})

// assign it to a variable to create instances of the model
const Event = mongoose.model('Event', eventSchema);
module.exports = Event;
