const mongoose = require('mongoose');

const productSchema= new mongoose.Schema({
    name: {type: String, required: true},
    desc: {type: String, required: true},
    productImage: {type: String, required:true},
    email:{type: String, required:true},
    userId:{type: String, required:true}
});

module.exports = mongoose.model("Product", productSchema);