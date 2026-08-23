const mongoose = require('mongoose');
const productSchema= new mongoose.Schema({
    name:String,
    desc:String,
    price:Number,
    imgURL:String,
    stock:Number,
    slug:{
        required:true,
        type:String,
         unique:true,
        trim:true,
        lowecase:true,
    }
},{
    timestamps:true
});

module.exports = mongoose.model('Product',productSchema);