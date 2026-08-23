const mongoose = require('mongoose');
const Purchase = require('../models/purchase.model');

exports.getSalesReport = async(req,res)=>{
    
    const {startDate,endDate}= req.query;
    const matchStage = {}


    if(startDate || endDate){
        matchStage.purchasedAt={};
        if(startDate) matchStage.purchasedAt.$gte = new Date(startDate);
        if(endDate) matchStage.purchasedAt.$lte = new Date(endDate);
    }

    const summary = await Purchase.aggregate([
        {$match: matchStage},
        {
            $lookup:{
                from:'users',
                localField:'user',
                foreignField:'_id',
                as:'user'
            }
        },
        {
            $unwind:'$user'
        },
        {
            $lookup:{
                from:'products',
                localField:'product',
                foreignField:'_id',
                as:'product'
            }
        },
        {
            $unwind:'$product'
        },

        
    ]);

    console.log(summary);
    res.json(summary);
}