const express = require("express");
const router = express.Router();
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const authFile = require("../service/authentication");
const jwt = require("jsonwebtoken");



// router.get("/msg",function(req,res) {
//     return res.send("hey I'm utkarsh");
// });

const JWT_SECRET = "hvdvay6ert72839289()aiyg8t87qt72393293883uhefiuh78ttq3ifi78272jbkj?[]]pou89ywe";


//check
router.get("/",function(req,res) {

    try {
        return res.send("user router all ok");
        
    } catch (error) {
        console.log(error);
    }
});



var salt = bcrypt.genSaltSync(10);

//register
router.post("/Signup", async(req,res) => {
    try {
        
        const {userName,password,repeatPassword,userEmail} = req.body;
        var hash =   bcrypt.hashSync(req.body.password);
        var sechash =  bcrypt.hashSync(req.body.repeatPassword);
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
                repeatPassword : sechash,
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

//forgot password
router.post("/Frgtpassword", async (req, res) => {
    const { userEmail } = req.body;
    try {
      const oldUser = await User.findOne({userEmail});
      if (!oldUser) {
        return res.status(401).json({ status: "User Not Exists!!" }); // here we can use it .send also 
      }
      const secret = JWT_SECRET + oldUser.password;
      const token = authFile.getToken({ userEmail: oldUser.userEmail, userid : oldUser._id})
      const link = `http://localhost:5000/resetpassword/${oldUser._id}/${token}`;
      console.log(link);
      return res.send("sent");
    } catch (error) {
        console.log(error);
    }
  });



  router.get("/resetpassword/:id/:token", async (req, res) => {
    const { id, token } = req.params;
     console.log(req.params);
     const oldUser = await User.findOne({ _id: id });
     if (!oldUser) {
       return res.json({ status: "User Not Exists!" });
     }
     const secret = JWT_SECRET + oldUser.password;
     try {
       const verify = authFile.getToken.verify(token, secret);
        //res.render("index", { email: verify.email, status: "Not Verified" });
        return res.send("verified")
     } catch (error) {
       console.log(error);
       res.send("Not Verified");
     }

  });



module.exports = router;