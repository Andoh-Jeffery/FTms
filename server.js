const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const MongodbSession = require("connect-mongodb-session")(session);
const path = require("path");
const bcrypt = require("bcryptjs");
const Admin = require("./models/admin");
require("dotenv").config();

const app = express();

const store = new MongodbSession({
  uri: process.env.MONGOURI,
  collection: "mysession",
});
// middlewares
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "./styles")));
app.use(express.static(path.join(__dirname, "./images")));
app.use(
  session({
    secret: "the key for the secret",
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);

const isAuth = (req, res, next) => {
  if (req.session.isAuth) {
    next();
  } else {
    res.redirect("/login");
  }
};

// mongo connection
mongoose
  .connect(process.env.MONGOURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then((result) => {
    app.listen(
      process.env.PORT,
      console.log(`server is running on port: ${process.env.PORT}`)
    );
  })
  .catch((err) => console.log(err));

// APIs

app.get("/", (req, res) => {
  res.render("index", { title: "Hompage" });
});
app.get("/login", (req, res) => {
  res.render("login", { title: "login" });
});
app.get("/dashboard", isAuth, (req, res) => {
  res.render("dashboard", { title: "Dashboard" });
});

// APIs POST

// POST REGISTER
app.post("/register", async (req, res) => {
  const { email, password } = req.body;
  // Hashing the password
  console.log(req.body);
  const admin = Admin.findOne({ email });
  console.log(admin.email);
  if (admin) {
    console.log("user existss");
  }
  const hashedPwd = await bcrypt.hash(password, 12);
  const adminObj = new Admin({
    email,
    password: hashedPwd,
  });
  await adminObj.save();
  res.redirect("/login");
});

// POST LOGIN
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const admin = await Admin.findOne({ email });
  if (!admin) {
    console.log("no such email...");
    return res.redirect("/login");
  }
  const isMatch = bcrypt.compare(password, admin.password);
  if (!isMatch) {
    return res.redirect("/login");
  }
  req.session.isAuth = true;
  res.redirect("/dashboard");
});
