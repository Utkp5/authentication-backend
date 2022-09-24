const express = require("express");
const router = express.Router();
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const authFile = require("../service/authentication");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const dotenv = require('dotenv');
dotenv.config();



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
    const { userEmail} = req.body;
    try {
      const oldUser = await User.findOne({userEmail});
      if (!oldUser) {
        return res.status(401).json({ status: "User Not Exists!!" }); // here we can use it .send also 
      }
      const secret = JWT_SECRET + oldUser.password;
      const token = jwt.sign({ userEmail: oldUser.userEmail, userid : oldUser._id},secret, {
            expiresIn: "5m",
      });
      const link = `http://localhost:5000/api/resetpassword/${oldUser._id}/${token}`;
      var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.GMAIL,
          pass: process.env.PASSWORD,
        },
      });
  
      var mailOptions = {
        from: process.env.GMAIL,
        to: userEmail,
        subject: "Password Reset",
        html: `<h2>Do not reply on this email as this email is bot</h2><h3>Click on the below link to Reset Your Password<br>${link}`,
        // text: link,

      };
  
      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log(error);
        } else {
          console.log("Email sent: " + info.response);
        }
      });
      console.log(link);
      return res.send("sent");
    } catch (error) {
        console.log(error);
    }
  });



  router.get("/resetpassword/:id/:token", async (req, res, next) => {
    const { id, token } = req.params;
     console.log(req.params);
     const { userEmail} = req.body;
     const oldUser = await User.findOne({_id : id});
     if (!oldUser) {
       return res.json({ status: "User Not Exists!" });
     }
     const secret = JWT_SECRET + oldUser.password;
     try {
       const decoded = jwt.verify(token, secret);
        res.render("index.ejs", { userEmail : decoded.userEmail,  status: "Not verified" });
        // return res.json({status: "verified"})
     } catch (error) {
       console.log(error);
      //  return res.json({status: "Not Verified"})
     }

  });



  router.post("/resetpassword/:id/:token", async (req, res) => {
    const { id, token } = req.params;
    const { password,userEmail } = req.body;
  
    const oldUser = await User.findOne({ _id: id });
    if (!oldUser) {
      return res.json({ status: "User Not Exists!!" });
    }
    const secret = JWT_SECRET + oldUser.password;
    try {
      const decoded = jwt.verify(token, secret);
      const encryptedPassword = await bcrypt.hash(password, salt);
      await User.updateOne(
        {
          _id: id,
        },
        {
          $set: {
            password: encryptedPassword,
          },
        }
      );
      res.render("index.ejs", { userEmail: decoded.userEmail, status: "verified" });
    } catch (error) {
      console.log(error);
      res.json({ status: "Something Went Wrong" });
    }
  });

module.exports = router;