const express = require('express');
const app = express();

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

app.get("/", (req, res) => {
    res.render('home');
})

// shoot report routing
const shootRoutes = require('./routes/shoot');
app.use('/shoot', shootRoutes);

app.get('/gallery', async(req, res) => {
    res.render('gallery')
})

app.post("/contact", async(req, res) => {
    console.log(req.body);
    res.redirect("/");
})


app.listen(3000, function() {
    console.log("Server listening on Port 3000");
})