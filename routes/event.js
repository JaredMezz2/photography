const express = require('express');
const router = express.Router();
const Event = require("../views/models/event");

// handle uploading images through html forms
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });
const catchAsync = require('../utils/catchAsync');

// Events - INDEX ROUTE
// Show all shoots
router.get('/', catchAsync(async(req, res) => {
    // once database gets large enough there will be many photos total, only need to access a single photo + event name
    // on index page so am just passing over whats necessary
    const allEvents = await Event.find();
    // strip out any entries that currently have 0 photos
    let completedEvents = allEvents.flatMap(( event ) => event.photos.length > 0 ? event : []);
    // strip out all unnecessary data to be passed to the client, only need one photo & plate
    let eventsInfo = completedEvents.map(event => (
        {
            name: event.name,
            photo: event.photos[0].url
        }
    ))
    res.render('events/index', { eventsInfo });
}))

// Events - SEARCH ROUTE
// Receiving form submission to search for specific route
router.post('/', catchAsync(async(req, res) => {
    // Extract plate searched on form from request body
    let { enteredName } = req.body;
    enteredName = enteredName.toUpperCase();

    // check to see if plate is found in a past shoot
    const dbEvent = await Event.findOne({ name: enteredName });
    if (dbEvent) {
        res.redirect(`/events/${ enteredName }`);
    } else {
        res.render('events/reserveEvent');
    }
}))

// Events - NEW ROUTE - ADMIN ONLY
// Submit new event
router.post('/new', upload.array('photos'), catchAsync(async(req, res, next) => {
    const { name, date } = req.body;

    let photos = req.files.map(f => ({
        // eager cloudinary formatting, auto quality upload + watermark @ bottom
        url: f.path.slice(0, f.path.indexOf('upload/') + 7) + 'f_auto,q_auto/if_h_gt_3000,l_overlay,y_1600/if_h_lte_3000,l_overlay,y_1000/' + f.path.slice(f.path.indexOf('upload/') + 7),
        filename: f.filename
    }));

    // check to see if event has been reserved previously
    const foundEvent = await Event.findOne({name});
    if (!foundEvent) {
        const newEvent = await new Event({ name, date, photos });
        await newEvent.save();
    } else {
        // update existing shoot with newly submitted information
        photos ? foundEvent.photos = foundEvent.photos.concat(photos) : null;
        await foundEvent.save();
    }

    req.flash('success', "Event successfully uploaded!");
    res.redirect(`/events/${ name }`);
}))

// Events - SHOW ROUTE
// Show details of specific event
router.get('/:id', catchAsync(async(req, res) => {
    // grab id from URL
    const { id } = req.params;
    // find event in db
    const foundEvent = await Event.findOne({'name': id});
    if (foundEvent) {
        // render corresponding page with passed in event
        res.render('events/details', { foundEvent })
    } else {
        res.render('events/reserveEvent')
    }
}))

router.post('/reserve', catchAsync(async(req, res) => {
    // pull form data from submission
    const { name, date } = req.body;

    // check to see if pre-existing page for current plate
    let foundEvent = await Event.findOne({name});
    // if there isn't, we need to create a new event entry in our DB so the url triggers
    if (!foundEvent) {
        // create a new shoot with the date shot and plate
        const newEvent = await new Event({ name, date })
        await newEvent.save()
    } // if there is we don't need to do anything, so just send them to the event page

    // send to the event page
    req.flash('success', "Event Information Submitted, I will be in touch shortly!");
    res.redirect(`/events/${ name }`);
}))

module.exports = router;
