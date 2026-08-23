const Product = require('../models/product.model');


exports.createProduct = async (req,res) => {
    const {name,desc,price,slug, stock} = req.body;
    const imgURL = req.file.filename;
    const myProduct = await Product.create({name,desc,price,slug,stock,imgURL});
    res.status(201).json({message:'product created',data:myProduct})
}

exports.getAllProducts= async (req,res) => {
    const myProducrs = await Product.find();
    res.status(200).json({message:'list of all products',data:myProducrs})
}

exports.getProductBySlug = async (req,res) => {
    const slug = req.params.slug;
    const myProduct = await Product.findOne({slug});
    res.status(200).json({message:`get product by slug: ${slug}`,data:myProduct});
}