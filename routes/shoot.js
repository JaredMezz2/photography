const express = require('express');
const router = express.Router();
const path = require('path');

// Search shoot route
router.post("/", async(req, res) => {
    const { enteredPlate } = req.body ;
    res.redirect(`/shoot/${ enteredPlate }`);
})

// specific route for showing custom page
router.get("/:userKey", async(req, res) => {
    const { userKey } = req.params;
    res.render("shoots/customPage", { userKey });
})

module.exports = router;