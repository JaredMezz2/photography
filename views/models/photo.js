const mongoose = require('mongoose');
const { Schema } = mongoose;

const photoSchema = new mongoose.Schema({
    photo: [
        {
            url: String,
            filename: String
        }
    ]
})

// assign it to a variable to create instances of the model
const Photo = mongoose.model('Photo', photoSchema);
module.exports = Photo;
