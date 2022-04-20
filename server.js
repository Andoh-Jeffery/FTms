const express = require("express");
const mongoose = require("mongoose");
const favicon = require("serve-favicon");
const session = require("express-session");
const MongodbSession = require("connect-mongodb-session")(session);
const path = require("path");
const bcrypt = require("bcryptjs");
const Admin = require("./models/admin");
const User = require("./models/user");
const Expense = require("./models/expense");
const methodOverride=require('method-override')
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
app.use(favicon(__dirname + "/favicon.ico"));
// a new middleware from some random dude having the same problem as me
app.use(methodOverride('_method'));

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
  res.send("working...");
});

app.get("/login", (req, res) => {
  res.render("login", { title: "login" });
});

app.get("/dashboard", isAuth, (req, res) => {
  User.find({}, (err, user) => {
    res.render("dashboard", { title: "Dashboard", userData: user});
    
  });
});
app.get("/expense",(req,res)=>{
  Expense.find({},(err,data)=>{
    if(err){
      console.log(err.message)
    }res.send({expenseData:data})});
    
})
// GET LOGOUT
app.get("/logout", (req, res) => {
  req.session.destroy();
});

app.get("/update", isAuth, (req, res) => {
  const id = req.query.id;
  // console.log(id);
  User.findById({ _id: id }, (err, user) => {
    res.render("update", { title: "Update", userData: user });
  });
});
// APIs POST

// POST REGISTER
app.post("/register", async (req, res) => {
  const { email, password } = req.body;

  //   console.log(req.body);
  const admin = Admin.findOne({ email });
  console.log(admin.email);
  if (admin) {
    console.log("user existss");
  }
  // Hashing the password
  const hashedPwd = await bcrypt.hash(password, 12);
  const adminObj = new Admin({
    email,
    password: hashedPwd,
  });
  await adminObj.save();
});

app.post("/register/user", async (req, res) => {
  const { firstname, lastname, phone, programOfChoice, status, paymentMade } =
    req.body;
  const userObj = new User({
    firstname,
    lastname,
    phone,
    programOfChoice,
    status,
    paymentMade,
  });
  await userObj.save();
});

// POST expenses

app.post("/expenses_add", async (req, res) => {
  const { title, description, cost } = req.body;
  const expenseObj = new Expense({
    title,
    description,
    cost,
  });
  await expenseObj.save();
  res.send("data saved");
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

// PUT
<<<<<<< HEAD
app.put('/update',(req,res)=>{
console.log(req.body);
  if(!req.body){
    return res.send({message:'NO body to update'});
}
const id=req.query.id;
User.findByIdAndUpdate(id,req.body,{useFindAndModify:false})
.then(data=>{
    if(!data){
        res.send({Error:"No Data"})
    }else{
        res.send(data);
    }
}).catch(err=>{res.status(500).send({message:"could not update user"})});

})


=======
app.put("/update", async (req, res) => {
  // const id=req.params.id;
  const { firstname, lastname, phone, programOfChoice, status, paymentMade } =
  req.body;
  const userObj = new User({
    firstname,
    lastname,
    phone,
    programOfChoice,
    status,
    paymentMade,
  });
  // console.log(req.body);
  // await User.findByIdAndUpdate({_id:id})
 res.json(req.body);
});
>>>>>>> b5fa983c9e8aed6bbccddf497f86bca360b797ff
