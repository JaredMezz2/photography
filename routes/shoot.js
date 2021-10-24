const express = require('express');
const router = express.Router();
const Shoot = require("../views/models/shoot");

// handle uploading images through html forms
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });

// Shoots - INDEX ROUTE
// Show all shoots
router.get('/', async(req, res) => {
    // once database gets large enough there will be many photos total, only need to access a single photo + plate name
    // on index page so am just passing over whats necessary
    const allShoots = await Shoot.find();
    let shootsInfo = allShoots.map(shoot => (
        {
            plate: shoot.plate,
            photo: shoot.photos[0].url
        }
    ))
    res.render('shoots/index', { shootsInfo });
})

// Shoots - SEARCH ROUTE
// Receiving form submission to search for specific route
router.post('/', async(req, res) => {
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
})

// Shoots - NEW ROUTE
// Submit new shoot
router.post('/new', upload.array('photos'), async(req, res) => {
    const { plate, name, contact, date } = req.body;
    let photos = req.files.map(f => ({
        // eager cloudinary formatting, auto quality upload + watermark @ bottom
        url: f.path.slice(0, f.path.indexOf('upload/') + 7) + 'f_auto,q_auto/if_h_gt_2000,l_overlay,y_1250/if_h_lte_2000,l_overlay,y_800/' + f.path.slice(f.path.indexOf('upload/') + 7),
        filename: f.filename
    }));

    const newShoot = await new Shoot({ plate, name, contact, date, photos });
    await newShoot.save();

    res.redirect(`/shoots/${ plate }`);
})

// Shoots - SHOW ROUTE
// Show details of specific shoot
router.get('/:id', async(req, res) => {
    // grab id from URL
    const { id } = req.params;

    // find shoot in db
    const foundShoot = await Shoot.findOne({'plate': id});

    // render corresponding page with passed in shoot
    res.render('shoots/details', { foundShoot })
})

module.exports = router;
