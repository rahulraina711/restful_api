const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Product = require('../models/product_model');
const multer = require('multer');
const auth = require('../middleware/auth');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
})
const upload = multer({
    storage: storage
});

// get all the images in the database posted by different users
router.get("/", (req, res) => {
    // const token = req.cookies;
    // console.log(token)
    Product.find().select('_id name desc productImage').exec()
        .then(doc => {
            const response = {
                count: doc.length,
                products: doc.map(doc => {
                    return {
                        _id: doc._id,
                        name: doc.name,
                        desc: doc.desc,
                        productImage: "http://localhost:3000/" + doc.productImage,
                        request: {
                            type: 'GET',
                            url: 'http://localhost:3000/products/' + doc._id
                        }
                    }
                })
            }
            console.log("displaying all documents")
            res.status(200).json(response);

        })
        .catch((err) => {
            console.log(err)
        });
})
// get image of a specific id
router.get("/:id", (req, res, next) => {

    const id = req.params.id;
    //console.log(req.params.id);
    Product.findById(id).select('_id name desc productImage').exec()
        .then(doc => {
            console.log(doc);
            res.status(200).json({
                _id: doc._id,
                name: doc.name,
                desc: doc.desc,
                productImage: doc.productImage,
                request: {
                    type: 'GET',
                    url: 'http://localhost:3000/products/' + doc._id
                }
            });
        })
        .catch(err => {
            res.status(400).json({
                message: err
            });
        });
});

// only authorized users can post photos
router.post("/", auth, upload.single('productImage'), (req, res) => {
    //console.log(req.file)
    //console.log(req.userData);
    const product = new Product({
        name: req.body.name,
        desc: req.body.desc,
        productImage: req.file.path,
        email: req.userData.email,
        userId: req.userData.userId
    });
    product.save().then((result) => {
        console.log(result);
        res.status(200).json({
            message: "Created product Successfully",
            _id: result._id,
            name: result.name,
            desc: result.desc,
            productImage: result.productImage,
            request: {
                type: 'GET',
                url: 'http://localhost:3000/products/' + result._id
            },
            email: result.email
        })
    }).catch((err) => {
        console.log(err)
    });
});


// only authorized users can patch photos
router.patch("/:id", auth, (req, res, next) => {
    const logEmail = req.userData.email;
    const id = req.params.id;
    const updateOps = {};
    for (const ops of req.body) {
        updateOps[ops.propName] = ops.value;
    }

    Product.find({
            _id: id
        }).exec().then((doc) => {
            if (doc.email !== logEmail) {
                return res.status(400).json({
                    message: "Access Denied"
                })
            } else {
                Product.findByIdAndUpdate(id, {
                        $set: updateOps
                    }).exec()
                    .then(doc => {
                        //console.log(doc);
                        res.status(200).json(doc);
                    })
            }
        })
        .catch(err => {
            res.status(400).json({
                message: err
            });
        });
})

// only authorized users can delete photos
router.delete("/:id", auth, (req, res, next) => {
    const logEmail = req.userData.email;
    const id = req.params.id;
    // verify
    Product.findById(id).exec()
        .then(doc => {
            if (doc.email !== logEmail) {
                return res.status(400).json({
                    message: "Access Denied"
                })
            }
            else{
                Product.findByIdAndDelete(id).exec()
                .then(doc => {

                    //console.log(doc);
        
                    res.status(200).json({
                        message: "Item deleted successfully"
                    });
                })
            }
        })      
        .catch(err => {
            res.status(400).json({
                message: err
            });
        });

})

module.exports = router