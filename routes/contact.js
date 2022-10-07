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
    const recaptchaUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${req.body.token}`;

    axios.post(recaptchaUrl, {
    })
        .then(function (response) {
            if (response.success === false) {
                req.flash('error', 'There was an error sending your email.');
                res.redirect('/');
                return false;
            }

        })
        .catch(function (err) {
            req.flash('error', "There was an error sending your email.");
            res.redirect("/");
            return false;
        })

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
