const mongoose = require('mongoose');
const productSchema= new mongoose.Schema({
    name:String,
    desc:String,
    price:Number,
    imgURL:String,
    stock:Number,
    slug:{
        type:String,
         unique:true,
        trim:true,
        lowecase:true,
        require:true
    }

},{
    timestamps:true
});

module.exports = mongoose.model('Product',productSchema);