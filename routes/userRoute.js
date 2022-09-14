const express = require("express");
const router = express.Router();
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const authFile = require("../service/authentication");



// router.get("/msg",function(req,res) {
//     return res.send("hey I'm utkarsh");
// });


//check
router.get("/",function(req,res) {

    try {
        return res.send("user router all ok");
        
    } catch (error) {
        console.log(error);
    }
});



var salt =  bcrypt.genSaltSync(10);

//register
router.post("/Signup", async(req,res) => {
    try {
        
        var hash = bcrypt.hashSync(req.body.password);
        var hash1 = bcrypt.hashSync(req.body.repeatPassword);
        const {userName,password,repeatPassword,userEmail} = req.body;
        const oldUser = await User.findOne({ userEmail });

        if(!(userName && password && repeatPassword && userEmail)){
            return res.status(400).send("You are missing something");
        }
        else if (oldUser) {
            return res.status(409).send("User Already Exist. Please Login");
          }
        else if (password.length < 8 || repeatPassword.length < 8) {
            return res.status(400).send( "Your Password must be atleast 8 characters" );
          }
        else if (password !== repeatPassword) {
            return res.status(400).send("password and repeatPassword should be same");
        }
        else{
            await User.create({
                userName : req.body.firstName,
                password : hash,
                repeatPassword : hash1,
                userEmail : req.body.userEmail,
            });
        }
        return res.send("User Registered Successfully");

    } catch (error) {
        console.log(error);
    }
});


//Login

router.post("/Login", async(req,res) => {
    try {
    
        const user = await User.findOne({userEmail : req.body.userEmail});
        const check = bcrypt.compareSync(req.body.password,user.password);


        if (!(user && check)) {
            return res.status(401).send("Invalid Credentials");
        }
        else if (!user) {
            return res.status(401).send("User does not exists");
        }

        const token = authFile.getToken(user._id);
        return res.send({token : token,userid : user._id, message : `Login Successfully`});

    } catch (error) {
        console.log(error);
    }
})







module.exports = router;