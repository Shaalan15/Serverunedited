const express = require('express');
const router = express.Router();

// mongodb user model
const User = require('../models/User');

//Password Handler
const bcrypt = require('bcrypt');

//Signup
router.post('/signup', (req,res) => {
    let {name, email, password, dob} = req.body;
    name = name.trim();
    email = email.trim();
    password = password.trim();
    dob = dob.trim();

    if (name == "" || email == "" || password == "" || dob == "") {
        res.json({
            status: "FAILED",
            message: "Empty input fields!"
        });
     } else if (!new Date(dob).getTime()) {
        res.json({
            status: "FAILED",
            message: "Invalid Date of Birth entered."
        })  
    } else if (password.length < 8) {
        res.json({
            status: "FAILED",
            message: "Password is too short."
        }) 
    } else {
        //Checking if user already exists
        User.find({email}).then(result => {
            if (result.length) {
                //A User already exists
                res.json({
                    status: "FAILED",
                    message: "User with the provided email already exists."
                })
            }else {
                //Try to create new user

                //Password handling
                const saltRounds = 10;
                bcrypt.hash(password, saltRounds).then(hashedPassword => {
                    const newUser = new User({
                        name,
                        email,
                        password: hashedPassword,
                        dob
                    });

                    newUser.save().then(result => {
                        res.json({
                            status: "SUCCESS",
                            message: "Account Created Successfully.",
                            data: result,
                        })
                        .catch(err => {
                            res.json({
                                status: "FAILED",
                                message: "An error occurred while saving new user."
                            })
                        })
                    })
                })
                .catch(err => {
                    res.json({
                        status: "FAILED",
                        message: "An error occurred while hashing the password."
                    })
                })
            }
        }).catch(err => {
            console.log(err);
            res.json({
                status:"FAILED",
                message: "An error occured while checking for existing user."
            })
        })
    }
})

//Signin
router.post('/signin', (req,res) => {
    let {email, password} = req.body;
    email = email.trim();
    password = password.trim();
    if (email == "" || password == ""){
        res.json({
            status: "FAILED",
            message: "Empty Credentials go fuck yourself"
        })
    } else{
        User.find({email})
        .then(data => {
            if (data.length) {
                const hashedPassword=data[0].password;
                bcrypt.compare(password, hashedPassword).then(result => {
                    if(result){
                        res.json({
                            status: "SUCCESS",
                            message: "Signin Successful",
                            data: data
                        })
                    }else{
                        res.json({
                            status: "FAILED",
                            message: "Invalid Password entered."
                        })
                    }
                })
                .catch(err => {
                    res.json({
                        status: "FAILED",
                        message: "An error occurred while comparing passwords."
                    })
                })
            }else {
                res.json({
                    status: "FAILED",
                    message: "Invalid credentials entered"
                })
            }
        })
        .catch(err => {
            res.json({
                status: "FAILED",
                message: "An error occurred while checking for existing user."
            })
        })
    }
})
module.exports = router;