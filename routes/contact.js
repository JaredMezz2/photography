const express = require('express');
const router = express.Router();

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
router.post("/", async(req, res) => {
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
            console.log('email sent!')
            res.redirect("back");
        }
    })
})

module.exports = router;
