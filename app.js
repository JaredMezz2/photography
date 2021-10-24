// Dev mode, include hidden variables
if(process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

// Instantiate Express & Setup current session for admin login
const express = require('express');
const app = express();
const session = require('express-session');
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: false
}));

// Instantiate Database
const connectDB = require('./database/connection')
connectDB();

// Deliver public folder to connections & set EJS as in-text js
app.use(express.static("public"));
app.set("view engine", "ejs");

// Instantiate bodyParser for pulling data from submitted forms
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

// Instantiate methodOverride for proper REST methods
const methodOverride = require('method-override');
app.use(methodOverride('_method'));

// form submission assigned to using json
app.use(express.urlencoded({ extended: true }));
// pass in body as json on each request
app.use(express.json());

// include 3rd party styling libraries (bootstrap, jquery, fontawesome)
app.use('/js', express.static(__dirname + '/node_modules/bootstrap/dist/js'));
app.use('/js', express.static(__dirname + '/node_modules/jquery/dist'));
app.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css'));
app.use('/scss', express.static(__dirname + '/node_modules/bootstrap/scss'));
app.use('/js', express.static(__dirname + '/node_modules/@fortawesome/fontawesome-free/js'));

// Home - INDEX ROUTE
// Display the home page
app.get("/", (req, res) => {
    res.render('home');
})

// shoot report routing
const shootRoutes = require('./routes/shoot');
app.use('/shoots', shootRoutes);

const adminRoutes = require('./routes/admin');
app.use('/admin', adminRoutes);

const contactRoutes = require('./routes/contact');
app.use('/contact', contactRoutes);

// Start the server
app.listen(3000, function() {
    console.log("Server listening on Port 3000");
})
