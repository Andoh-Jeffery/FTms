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
const methodOverride = require('method-override');
// const { getHeapCodeStatistics } = require("v8");
require("dotenv").config();

const app = express();

const store = new MongodbSession({
  uri: process.env.MONGOURI,
  collection: "mysession",
});
// middlewares
app.set("view engine", "ejs");
app.use(express.json());
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
  // if (req.session.isAuth) {
  //   next();
  if (req.session.isAuth&&req.session.isAuthorize==="admin") {
    User.find({}, (err, user) => {
        let initValue = 0;
        // let totalAmount = 0;
        let totalAmount = user.reduce((p, c) => {
          return p + (c.paymentMade ? c.paymentMade : 0);
        }, initValue);
        Expense.find({}, (err, data) => {
          let totalExpenses = 0;
          data.forEach(u => {
    
            // console.log(u.cost ? u.cost : 0);
            const a = u.cost ? u.cost : 0;
            totalExpenses += a;
          })
          let total = totalAmount - totalExpenses;
          console.log(req.body.role);
          res.render("dashboard", { title: "Dashboard", userData: user, expenseData: data, totalAmount: totalAmount, totalExpenses: totalExpenses, total: total });
        });
       
      });
  }
  else if(req.session.isAuth&&req.session.isAuthorize==="web"){
    res.send(`${req.session.isAuthorize} is logged in`);
   
  } 
  else {
    res.redirect("/login");
  }
};
// const isAuthorize=(res,req,next)=>{
//   if(isAuth&&req.session.isAuthorize==="admin"){
//     next()
//   }
//   else if(isAuth&&req.session.isAuthorize==="web"){
//     res.send('Kanta is logged in');
//   }else{res.status(404).send("you are not authorized...")}
// }

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
  .catch((err) => console.log(err.message));

// APIs

app.get("/", (req, res) => {
  res.render("index", { title: "Hompage" });
});

app.get("/login", (req, res) => {
  res.render("login", { title: "login" });
});

app.get("/dashboard", isAuth,(req, res) => {
  // User.find({}, (err, user) => {
  //   let initValue = 0;
  //   // let totalAmount = 0;
  //   let totalAmount = user.reduce((p, c) => {
  //     return p + (c.paymentMade ? c.paymentMade : 0);
  //   }, initValue);
  //   Expense.find({}, (err, data) => {
  //     let totalExpenses = 0;
  //     data.forEach(u => {

  //       // console.log(u.cost ? u.cost : 0);
  //       const a = u.cost ? u.cost : 0;
  //       totalExpenses += a;
  //     })
  //     let total = totalAmount - totalExpenses;
  //     console.log(req.body.role);
  //   });
  //   // console.log(exp);
  // });
      // res.render("dashboard", { title: "Dashboard", userData: user, expenseData: data, totalAmount: totalAmount, totalExpenses: totalExpenses, total: total });
});

app.get("/expenses", isAuth, (req, res) => {
  Expense.find({}, (err, data) => {
    if (err) {
      console.log(err.message)
    } res.send({ expenseData: data })
  });
})
// GET LOGOUT
app.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect('/login');
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
  const { email, password, role } = req.body;

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
    role
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
  res.send("Data saved...")
  res.end();
});

// POST expenses

app.post("/expenses", async (req, res) => {
  const { title, description, cost } = req.body;
  const expenseObj = new Expense({
    title,
    description,
    cost,
  });
  await expenseObj.save();

  res.send("data saved" + req.body);
});

// POST LOGIN
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const admin = await Admin.findOne({ email });
  // console.log(admin);
  if (!admin) {
    console.log("no such email...");
    return res.redirect("/login");
  }
  const isMatch = bcrypt.compare(password, admin.password);
  if (!isMatch) {
    return res.redirect("/login");
  }
  // console.log(req.body.role);
  req.session.isAuthorize=admin.role;
  req.session.isAuth = true;
  res.redirect("/dashboard");
});

// PUT
app.put("/update/:id", isAuth, async (req, res) => {
  const { firstname, lastname, phone, programOfChoice, status, paymentMade } =
    req.body;
  const userObj = new User({
    firstname,
    lastname,
    phone,
    programOfChoice,
    status,
    paymentMade
  });
  let id = req.params.id;
  if (!req.body) {
    res.status(400).send('No request Body')
  }
  User.findByIdAndUpdate({ _id: id }, req.body, { useFindAndModify: false }).then(data => {
    if (!data) {
      res.send("No data")
    }
    res.redirect('/dashboard');

    // res.send(data);
  }).catch(err => res.status(500).send({ message: `could not update user with id ${id}` }));

});
