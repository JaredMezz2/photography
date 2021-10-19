// Dev mode, include hidden variables
if(process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

const express = require('express');
const app = express();
const bcrypt = require('bcrypt');
const session = require('express-session');
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: false
}));

// handle uploading images through html forms
const multer = require('multer');
const { storage } = require('./cloudinary');
const upload = multer({ storage });

// Database setup
const connectDB = require('./database/connection')
connectDB();

app.use(express.static("public"));
app.set("view engine", "ejs");

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

const methodOverride = require('method-override');
app.use(methodOverride('_method'));

// form submission assigned to using json
app.use(express.urlencoded({ extended: true }));
// pass in body as json on each request
app.use(express.json());

// include bootstrap npm files
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
// const shootRoutes = require('./routes/shoot');
// app.use('/shoot', shootRoutes);

const Shoot = require("./views/models/shoot");

// Shoots - INDEX ROUTE
// Show all shoots
app.get('/shoots', async(req, res) => {
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
app.post('/shoots', async(req, res) => {
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

// Shoots - SHOW ROUTE
// Show details of specific shoot
app.get('/shoots/:id', async(req, res) => {
    // grab id from URL
    const { id } = req.params;

    // find shoot in db
    const foundShoot = await Shoot.findOne({'plate': id});

    // render corresponding page with passed in shoot
    res.render('shoots/details', { foundShoot })
})

// Shoots - NEW ROUTE
// Submit new shoot
app.post('/newShoot', upload.array('photos'), async(req, res) => {
    const { plate, name, contact, date } = req.body;
    let photos = req.files.map(f => ({url: f.path, filename: f.filename}));

    const newShoot = await new Shoot({ plate, name, contact, date, photos });
    await newShoot.save();

    // TODO: Update to path of newly created route
    res.redirect(`/shoots/${ plate }`);
})

// Contact - CREATE ROUTE
// Receive contact form info
app.post("/contact", async(req, res) => {
    console.log(req.body);
    res.redirect("/");
})

// ADMIN PAGE
// authentication page for accessing admin panel, user submits password and passes into post /admin
app.get('/adminLogin', (req, res) => {
    res.render('adminLogin')
})
// handle authentication in backend, if success route to /admin if not send back
app.post('/admin', async(req, res) => {
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
        res.redirect('adminLogin')
    }
})

// admin panel display page, sends over all shoots for displayed info and can submit new shoot from here
app.get("/admin", async (req, res) => {
    if(!req.session.validAdmin) {
        res.redirect('adminLogin')
    } else {
        const allShoots = await Shoot.find();
        res.render('admin', { allShoots })
    }
})

// Start the server
app.listen(3000, function() {
    console.log("Server listening on Port 3000");
})
