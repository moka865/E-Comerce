const Purchase = require("../models/purchase.model");
const Product = require("../models/product.model");

exports.createPurchase = async(req,res)=>{
 const {productId,quantity}= req.body;
 const userId= req.user._id;

 const myProduct = await Product.findById(productId);

 if(!myProduct){
    return res.status(404).json({message:"product not found"});
 }
 

 const myPurchase = await Purchase.create({user:userId,product:productId,price:myProduct.price,quantity});
 res.status(201).json({message:"purchase created successfully",data:myPurchase})
    
}

exports.returnAllPrurchase = async(req,res)=>{
    
}
exports.returnOnePrurchase = async(req,res)=>{
    
}
exports.returnPurchas