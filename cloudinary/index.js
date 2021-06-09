// CLOUDINARY CONFIG
// Not necessary yet, incase I look into uploading photos from the go through the website.

const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// associate cloudinary account with current instance
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        allowedFormats: ['jpeg', 'jpg', 'png']
    }
});

module.exports = {
    cloudinary,
    storage
}