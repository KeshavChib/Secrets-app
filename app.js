import * as dotenv from 'dotenv' // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
dotenv.config()
import express from "express";
import mongoose, { model } from "mongoose";
import path from "path";
import encrypt from "mongoose-encryption";
import bcrypt from "bcryptjs";
const saltRounds = 10;

const app = express();
const __dirname = path.resolve();

app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended : true }));
app.use(express.static("public"));

mongoose.set('strictQuery', true);
mongoose.connect("mongodb://0.0.0.0:27017/usersDB", {useNewUrlParser: true, useUnifiedTopology : true});

const userSchema = new mongoose.Schema( {
    Email : String,
    Password : String
});

const User = mongoose.model("User", userSchema);

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
    res.render("home");
});

app.post("/register", function (req, res){
    bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
        const newUser = new User({
            Email : req.body.username,
            Password : hash
        });
        newUser.save();
        res.render("secrets");
    });
});

app.post("/login", function (req, res){
    const username = req.body.username;
    async function run(){
        try {
            const data = await User.findOne({Email : username});
            bcrypt.compare(req.body.password, data.Password, function(err, result) {
                if(result == true){
                    res.render("secrets");
                }
                else{
                    res.render("login");
                }
            });
        }
        catch(err){
            console.log(err);
            res.render("login");
        }
    }
    run().catch(console.dir);
});


app.listen(3000, function (){
    console.log("we are listening to port 3000");
});