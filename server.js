const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const isSignedIn = require("./middleware/is-signed-in.js");
const methodOverride = require("method-override");
const mongoose = require("mongoose");
const morgan = require("morgan");
const path = require("path");
const passUserToView = require("./middleware/pass-user-to-view.js");
const session = require("express-session");

const authController = require("./controllers/auth.js");
const foodsController = require("./controllers/foods.js");

const app = express();

// Set the port from environment variable or default to 3000 -ternary statement
const port = process.env.PORT ? process.env.PORT : "3000";

//---View engines-------------------------------------------------------------------------//
app.set("view engine", "ejs"); // set view engine to ejs
app.set("views", path.join(__dirname, "views"));


//---MongoDB connection - folder name explicitly stated-----------------------------------//
const db_url = process.env.MONGODB_URI;

mongoose
  .connect(db_url, { dbName: "cookbook-relating-data-lab" })
  .then(() => {
    console.log("Connected to MongoDB cookbook-relating-data-lab folder");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

mongoose.connection.on("connected", () => {
  console.log(`Connected to MongoDB ${mongoose.connection.name}.`);
});

//---Core Middleware - to serve static files from the directory---------------------------//
app.use(express.urlencoded({ extended: false }));
app.use(methodOverride("_method"));
app.use(express.static('public'));
// app.use(morgan('dev'));

// Session middleware before routers
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);
app.use(passUserToView);

//----Controllers------------------------------------------------------------------------//
app.use("/auth", authController);
app.use(`/users/:userId/foods`, isSignedIn, foodsController);

//--------------------------------------------------------------------------------------//
app.get("/", (req, res) => {
  res.render("index.ejs", {
    user: req.session.user,
  });
});

app.get('/test', (req, res) => {
  res.render('test');
});

app.get(`/users/:userId/foods/new`);

app.listen(port, () => {
  console.log(`The express app is ready on port ${port}!`);
});
