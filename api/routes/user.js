const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt'); // string hasher
const mongoose = require('mongoose');
const User = require('../models/user_model')
const jwt = require('jsonwebtoken');
const Product = require('../models/product_model')

router.post('/signup', async (req, res, next) => {
    try {
        //(a password and email validation can be added here as well)
        const email = req.body.email;
        const password = await bcrypt.hash(req.body.password, 10);

        // unique email
        const existingUser = await User.findOne({
            email
        });
        if (existingUser) {
            return res.status(400).json({
                message: "user already exists"
            })
        }
        const user = new User({
            email,
            password
        })
        const savedUser = await user.save();
        res.status(201).json(savedUser);
        //create a jwt token
        // const token = jwt.sign({
        //     id: savedUser._id
        // }, process.env.JWT_KEY);

        // res.cookie("token", token, {httpOnly: true}).send();


    } catch (err) {
        res.status(500).json({message: err});
    }
});

router.post('/login', async (req, res, next) => {
    try {
    
        const email = req.body.email;
        const password = req.body.password;

        // unique email
        const existingUser = await User.findOne({
            email
        });
        if (existingUser) {
            //res.status(201).json(existingUser);
            bcrypt.compare(password, existingUser.password,(err, result)=>{
                if(err){
                    res.status(401).json({message: "auth failed"})
                }
                if(result){
                    const token = jwt.sign({
                        email: existingUser.email,
                        userId: existingUser._id
                    }, process.env.JWT_KEY,{
                        expiresIn: "1h"
                    })
                    res.status(201).json({message: "auth done", token: token})
                }
            })// a slight issue with wrong password, the server times out (yet to be fixed)
        }
        else{
            res.status(401).json({message: "auth failed"})
        }

    } catch (err) {
        res.status(500).json({message: err});
    }
});

router.get("/",(req, res, next)=>{
    let email = req.query.email;
    Product.find({email: email}).exec()
    .then(docs=>{
        res.status(201).json(docs)
    })
    .catch(err=>{res.status(404).json({message: err})})
    
})
module.exports = router;