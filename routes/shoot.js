const express = require('express');
const router = express.Router();
const path = require('path');

// default path
// 
router.get("/", (req, res) => {
    res.render("shoots/index");
})

module.exports = router;