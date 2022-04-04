const express=require('express');
const mongoose=require('mongoose');
const path=require('path');
require('dotenv').config();

const app=express();
// middlewares
app.set('view engine','ejs');
app.use(express.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname,'./styles')));
app.use(express.static(path.join(__dirname,'./images')));

// APIs

app.get('/',(req,res)=>{
    res.render('index',{title:'Hompage'});
});
app.get('/login',(req,res)=>{
    res.render('login',{title:'login'});
})

app.listen(process.env.PORT,console.log(`server is running on port: ${process.env.PORT}`));