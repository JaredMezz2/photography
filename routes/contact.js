const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const axios = require('axios').default;

// Contact - CREATE ROUTE
const nodemailer = require('nodemailer');
let transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    auth: {
        user: 'mezzshotsemail@gmail.com',
        pass: process.env.GMAIL_PASS
    }
});
// Receive contact form info
router.post("/", catchAsync(async(req, res) => {
    // Test recaptcha key to ensure verification
    // const recaptchaUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECPATHCA_SECRET_KEY}&response=${req.body.token}`;
    console.log(process.env.RECPATHCA_SECRET_KEY);
    console.log(process.env.GMAIL_PASS);
    const recaptchaUrl = 'https://www.google.com/recaptcha/api/siteverify?secret=' + process.env.RECPATHCA_SECRET_KEY + '&response=' + req.body.token;

    axios.post(recaptchaUrl, {
        // secret: process.env.RECAPTCHA_SECRET_KEY,
    })
        .then(function (response) {
            console.log('success');
            console.log(response.success);

        })
        .catch(function (err) {
            // console.log('err');
            // console.log(err )
            req.flash('error', "There was an error sending your email.");
            res.redirect("/");
            return false;
        })
    // axios.post(`https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECPATHCA_SECRET_KEY}&response=${req.body.token}`, function(req, res, next) {
    //     console.log('in inner post');
    //     console.log(res);
    //     next();
    // });

    // fetch(recaptchaUrl, {method: 'POST'})
    //     .then(response => console.log(response.json()))
    //     .then(google_response => console.log(res.json({ google_response })))
    //     .catch(error => console.log(res.json({ error })));

    // set mail options for multer upon contact request, pull details from body
    let mailOptions = {
        from: req.body.email,
        replyTo: req.body.email,
        to: 'mezzshotsemail@gmail.com',
        subject: 'Shoot Inquiry - ' + req.body.name,
        text: "Email: " + req.body.email + ' \n' + 'Message: ' + req.body.message
    };
    // send mail
    await transporter.sendMail(mailOptions, function(err, info) {
        if (err) {
            res.send(err)
        } else {
            req.flash('success', "Message successfully sent!");
            res.redirect("/");
        }
    })
}))

module.exports = router;
