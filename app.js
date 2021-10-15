// Dev mode, include hidden variables
if(process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

const express = require('express');
const app = express();

// Database setup
const connectDB = require('./Database/Connection')
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

// Home - INDEX ROUTE
// Display the home page
app.get("/", (req, res) => {
    res.render('home');
})

// shoot report routing
// const shootRoutes = require('./routes/shoot');
// app.use('/shoot', shootRoutes);

const Shoot = require("./views/models/shoot");
const Photo = require("./views/models/photo");

const tempShoots = [
    {
        plate: "CEVE715",
        date: "2021-02-02",
        photos: [
            {
                url: "https://res.cloudinary.com/drwy1imlr/image/upload/q_auto/v1623205735/DSC_0009_zuerd1.png",
                filename: "backQuarter"
            },
            {
                url: "https://res.cloudinary.com/drwy1imlr/image/upload/q_auto/v1623205735/DSC_0132_uriqwf.png",
                filename: "frontShot"
            }
        ]
    },
    {
        plate: "CLVZ594",
        date: "2021-05-16",
        photos: [
            {
                url: "https://res.cloudinary.com/drwy1imlr/image/upload/q_auto/v1625421684/CLVZ594/oq9y3vts1sojwuhzb9dc.png",
                filename: "test1"
            },
            {
                url: "https://res.cloudinary.com/drwy1imlr/image/upload/q_auto/v1625421683/CLVZ594/nafmnceldj031kebrg12.png",
                filename: "test2",
            },
            {
                url: "https://res.cloudinary.com/drwy1imlr/image/upload/q_auto/v1625421670/CLVZ594/emut7h8vvx3cexqgg4mi.png",
                filename: "test3"
            }
        ]
    },
    {
        plate: "CRDB744",
        date: "2021-09-27",
        photos: [
            {
                url: "https://res.cloudinary.com/drwy1imlr/image/upload/v1633401777/CRDB744/t5hbmmlpcjklekstqve6.jpg",
                filename: "test1"
            },
            {
                url: "https://res.cloudinary.com/drwy1imlr/image/upload/v1633401777/CRDB744/gtk9d9babgw4kzktco8i.jpg",
                filename: "test2",
            },
            {
                url: "https://res.cloudinary.com/drwy1imlr/image/upload/v1633401777/CRDB744/n6dlev0xj2yb8as0vpro.jpg",
                filename: "test3"
            },
            {
                url: "https://res.cloudinary.com/drwy1imlr/image/upload/v1633401777/CRDB744/imniqb28dfaawjetm33y.jpg",
                filename: "test3"
            },
            {
                url: "https://res.cloudinary.com/drwy1imlr/image/upload/v1633401771/CRDB744/w6zyvn5wb2p43by8nzoe.jpg",
                filename: "test3"
            },
            {
                url: "https://res.cloudinary.com/drwy1imlr/image/upload/v1633401771/CRDB744/ftivrgxnkyuy0cvmypk2.jpg",
                filename: "test3"
            },
            {
                url: "https://res.cloudinary.com/drwy1imlr/image/upload/v1633401771/CRDB744/njoycorgs4ekrgr3owky.jpg",
                filename: "test3"
            },
            {
                url: "https://res.cloudinary.com/drwy1imlr/image/upload/v1633401771/CRDB744/blilovnghkucnugxupgg.jpg",
                filename: "test3"
            },
            {
                url: "https://res.cloudinary.com/drwy1imlr/image/upload/v1633401771/CRDB744/cthuwytwyvamqqmdepsi.jpg",
                filename: "test3"
            },
            {
                url: "https://res.cloudinary.com/drwy1imlr/image/upload/v1633401772/CRDB744/pmh3q8granscxqs39tmz.jpg",
                filename: "test3"
            },

        ]
    },
    {
        plate: "BPPD724",
        date: "2021-05-16",
        photos: [
            {
                url: "https://res.cloudinary.com/drwy1imlr/image/upload/q_auto/v1634320545/BPPD724/y5dnrgeowupfjgwzkis0.png",
                filename: "datsun-side"
            },
            {
                url: "https://res.cloudinary.com/drwy1imlr/image/upload/q_auto/v1634320664/BPPD724/zkelodaink39008u0gmy.png",
                filename: "datsun-frontq"
            },
            {
                url: "https://res.cloudinary.com/drwy1imlr/image/upload/q_auto/v1634320714/BPPD724/faxxyore8uuc8eqwk62s.png",
                filename: "datsun-back"
            }
        ]
    }
]

// Shoots - INDEX ROUTE
// Show all shoots
app.get('/shoots', async(req, res) => {
    // once database gets large enough there will be many photos total, only need to access a single photo + plate name
    // on index page so am just passing over whats necessary
    let shootsInfo = tempShoots.map(shoot => (
        {
            plate: shoot.plate,
            photo: shoot.photos[0].url
        }
    ))
    console.log(shootsInfo);
    res.render('shoots/index', { shootsInfo });
})

// Shoots - SEARCH ROUTE
// Receiving form submission to search for specific route
app.post('/shoots', async(req, res) => {
    // Extract plate searched on form from request body
    let { enteredPlate } = req.body;
    enteredPlate = enteredPlate.toUpperCase();

    // check to see if plate is found in a past shoot
    let foundShootIndex = tempShoots.findIndex(x => x.plate === enteredPlate);

    // if the plate is found in a shoot (returns value other than -1)
    if (foundShootIndex !== -1) {
        console.log("found shoot @ ", foundShootIndex);
        res.redirect(`/shoots/${ enteredPlate }`);
    } else {
        console.log('no shoots found');
        res.render('shoots/setupShoot')
    }
})

// Shoots - SHOW ROUTE
// Show details of specific shoot
app.get('/shoots/:id', async(req, res) => {
    // grab id from URL
    const { id } = req.params;

    // find shoot in db
    // const foundShoot = await Shoot.findOne({'plate': id}); // passing in creator field from

    const foundShoot = tempShoots[tempShoots.findIndex(x => x.plate === id)];

    // render corresponding page with passed in shoot
    res.render('shoots/details', { foundShoot })
})

// Contact - CREATE ROUTE
// Receive contact form info
app.post("/contact", async(req, res) => {
    console.log(req.body);
    res.redirect("/");
})

// path to handle password submission for admin page
app.post('/admin', async(req, res) => {

})
app.get("/admin", (req, res) => {
    res.render('admin')
})

// Start the server
app.listen(3000, function() {
    console.log("Server listening on Port 3000");
})
