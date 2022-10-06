const express = require('express');
const router = express.Router();
const Shoot = require("../views/models/shoot");

// handle uploading images through html forms
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });
const catchAsync = require('../utils/catchAsync');

// Shoots - INDEX ROUTE
// Show all shoots
router.get('/', catchAsync(async(req, res) => {
    // once database gets large enough there will be many photos total, only need to access a single photo + plate name
    // on index page so am just passing over whats necessary
    const allShoots = await Shoot.find();
    // strip out any entries that currently have 0 photos
    let completedShoots = allShoots.flatMap(( shoot ) => shoot.photos.length > 0 ? shoot : []);
    // strip out all unnecessary data to be passed to the client, only need one photo & plate
    let shootsInfo = completedShoots.map(shoot => (
        {
            plate: shoot.plate,
            photo: shoot.photos[0].url
        }
    ))
    res.render('shoots/index', { shootsInfo });
}))

// Shoots - SEARCH ROUTE
// Receiving form submission to search for specific route
router.post('/', catchAsync(async(req, res) => {
    // Extract plate searched on form from request body
    let { enteredPlate } = req.body;
    enteredPlate = enteredPlate.toUpperCase();

    // check to see if plate is found in a past shoot
    const dbShoot = await Shoot.findOne({ plate: enteredPlate });
    if (dbShoot) {
        res.redirect(`/shoots/${ enteredPlate }`);
    } else {
        res.render('shoots/setupShoot');
    }
}))

// Shoots - NEW ROUTE - ADMIN ONLY
// Submit new shoot
router.post('/new', upload.array('photos'), catchAsync(async(req, res, next) => {
    const { plate, name, contact, date } = req.body;

    let photos = req.files.map(f => ({
        // eager cloudinary formatting, auto quality upload + watermark @ bottom
        url: f.path.slice(0, f.path.indexOf('upload/') + 7) + 'f_auto,q_auto/if_h_gt_3000,l_overlay,y_1600/if_h_lte_3000,l_overlay,y_1000/' + f.path.slice(f.path.indexOf('upload/') + 7),
        filename: f.filename
    }));

    // check to see if shoot has been reserved previously
    const foundShoot = await Shoot.findOne({plate});
    if (!foundShoot) {
        const newShoot = await new Shoot({ plate, name, contact, date, photos });
        await newShoot.save();
    } else {
        // update existing shoot with newly submitted information
        name ? foundShoot.name = name : null;
        contact ? foundShoot.contact = contact : null;
        photos ? foundShoot.photos = foundShoot.photos.concat(photos) : null;
        await foundShoot.save();
    }

    req.flash('success', "Shoot successfully uploaded!");
    res.redirect(`/shoots/${ plate }`);
}))

// Shoots - SHOW ROUTE
// Show details of specific shoot
router.get('/:id', catchAsync(async(req, res) => {
    // grab id from URL
    const { id } = req.params;
    // find shoot in db
    const foundShoot = await Shoot.findOne({'plate': id});
    if (foundShoot) {
        // render corresponding page with passed in shoot
        res.render('shoots/details', { foundShoot })
    } else {
        res.render('shoots/setupShoot')
    }
}))

router.post('/reserve', catchAsync(async(req, res) => {
    // pull form data from submission
    const { plate, date } = req.body;

    // check to see if pre-existing page for current plate
    let foundShoot = await Shoot.findOne({plate});
    // if there isn't, we need to create a new shoot entry in our DB so the url triggers
    if (!foundShoot) {
        // create a new shoot with the date shot and plate
        const newShoot = await new Shoot({ plate, date })
        await newShoot.save()
    } // if there is we don't need to do anything, so just send them to the shoot page

    // send to the shoot page
    req.flash('success', "Shoot successfully reserved!");
    res.redirect(`/shoots/${ plate }`);
}))

module.exports = router;
