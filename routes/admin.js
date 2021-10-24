const express = require('express');
const bcrypt = require("bcrypt");
const Shoot = require("../views/models/shoot");
const router = express.Router();

// INDEX ROUTE - Display main admin page
// admin panel display page, sends over all shoots for displayed info and can submit new shoot from here
router.get("/", async (req, res) => {
    if(!req.session.validAdmin) {
        res.redirect('admin/login')
    } else {
        const allShoots = await Shoot.find();
        res.render('admin', { allShoots })
    }
})
// INDEX ROUTE - Display admin login page
// authentication page for accessing admin panel, user submits password and passes into post /admin
router.get('/login', (req, res) => {
    res.render('adminLogin')
})
// handle authentication in backend, if success route to /admin if not send back
router.post('/', async(req, res) => {
    // pull password from submitted form
    const { password } = req.body;
    // compare hashed password to env variable password
    const validPassword = await bcrypt.compare(password, process.env.ADMIN_PASS);
    // if success, redirect to /admin page
    if(validPassword) {
        req.session.validAdmin = true;
        res.redirect("admin");
    } else {
        // if failed, redirect to /adminLogin
        res.redirect('admin/login')
    }
})

module.exports = router;
