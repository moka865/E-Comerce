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
            $group:{
                _id:"$product",
                totalQuantity:{$sum:'$quantity'},
                totalSpent:{$sum:{$multiply:['$price','$quantity']}},
                lastPurchaseDate:{$max:'$purchasedAt'}
            }
        },
        {
            $lookup:{
                from:'products',
                localField:'_id',
                foreignField:'_id',
                as:'product'
            }
        }
    ]);

    console.log(summary);
    res.json(summary);
}