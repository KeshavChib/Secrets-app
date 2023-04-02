import * as dotenv from 'dotenv' // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
dotenv.config()
import express from "express";
import mongoose from "mongoose";
import path from "path";
import encrypt from "mongoose-encryption";
import session from 'express-session';
import passport from 'passport';
import passportLocalMongoose from 'passport-local-mongoose';

const app = express();
const __dirname = path.resolve();

app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended : true }));
app.use(express.static("public"));

app.use(session({
    secret : "This is our little secret.",
    resave : false,
    saveUninitialized : false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.set('strictQuery', true);
mongoose.connect("mongodb://0.0.0.0:27017/usersDB", {useNewUrlParser: true, useUnifiedTopology : true});



const userSchema = new mongoose.Schema( {
    username : String,
    Password : String
});

userSchema.plugin(passportLocalMongoose);

const User = mongoose.model("User", userSchema);


// CHANGE: USE "createStrategy" INSTEAD OF "authenticate"
passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/", function(req, res){
    res.render("home");
});

app.get("/login", function(req, res){
    res.render("login");
});

app.get("/register", function(req, res){
    res.render("register");
});

app.get("/logout", function (req, res){
    req.logout(function(err){
        if(err) {
            console.log(err);
        }
    });
    res.redirect("/");
});

app.get("/secrets", function(req, res){
    if(req.isAuthenticated()){
        res.render("secrets");
    }
    else {
        res.render("login");
    }
});

app.post("/register", function (req, res){

    User.register({username : req.body.username}, req.body.password, function(err, user){
        if(err){
            console.log(err);
            res.redirect("/register");
        }
        else{
            passport.authenticate("local")(req, res, function(){
                res.redirect("/secrets");
            });
        }
    });

});

app.post("/login", function (req, res){
    const user = new User({
        username : req.body.username,
        Password : req.body.password
    });

    req.login(user, function (err){
        if(err){
            console.log(err);
            res.render("login");
        }
        else {
            passport.authenticate("local")(req, res, function(){
                res.redirect("/secrets");
            });
        }
    });
});


app.listen(3000, function (){
    console.log("we are listening to port 3000");
});