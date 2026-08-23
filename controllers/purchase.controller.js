const Purchase = require('../models/purchase.model');
const Product = require('../models/product.model');

exports.createPurchase = async(req,res)=>{
const {productId,quantity}= req.body;
const userId = req.user._id;

const myProduct = await Product.findById(productId);
if(!myProduct){
  return  res.status(404).json({error:'product not found'})
}

const myPurchase = await Purchase.create({user:userId,product:productId,price:myProduct.price,quantity});
res.status(201).json({message:'pruchases created', data:myPurchase});
}

exports.returnAllPurchases= async (req,res) => {
    const myPurchases = await Purchase.find().populate('user product','-password');
    res.status(200).json({message:'return all purchases',data:myPurchases});
}

exports.returnUserPurchases = async(req,res)=>{
const userId= req.user._id;
const myPurchases = await Purchase.find({user:userId}).populate('user product','-password');
 res.status(200).json({message:'return user purchases',data:myPurchases});

}