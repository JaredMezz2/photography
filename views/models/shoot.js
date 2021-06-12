const mongoose = require('mongoose');
const { Schema } = mongoose;
const Photo = require("./photo");
const photoSchema = mongoose.model("Photo").schema;

const shootSchema = new mongoose.Schema({
    plate: {
        type: String,
        required: true
    },
    date: {
        type: Date
    },
    photos: [photoSchema]
})

// assign it to a variable to create instances of the model
const Shoot = mongoose.model('Shoot', shootSchema);
module.exports = Shoot;