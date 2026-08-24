const mongoose = require('mongoose');
const Purchase = require('../models/purchase.model');

exports.getSalesReport = async(req,res)=>{
    const {startDate, endDate}= req.query;
    const matchStage = {};
    if(startDate || endDate){
        matchStage.purchasedAt = {};

        if(startDate) matchStage.purchasedAt.$gte = new Date(startDate);

        if(endDate) matchStage.purchasedAt.$lte = new Date(endDate);
    }

    const summary = await Purchase.aggregate([
        {$match:matchStage},
        {
            $lookup:{
                from: 'users',
                localField: 'user',
                foreignField: '_id',
                as:'user'
            }
        },
        {$unwind:'$user'},
        {
            $lookup:{
                from:'products',
                localField:'product',
                foreignField:'_id',
                as : 'product'
            }
        },
        {$unwind:'$product'},
        {
            $addFields:{
                totalPrice: {$multiply : ['$price','$quantity']}
            }
        },
        {
            $facet:{
                //1 total sales
                overallStats:[
                    {
                        $group:{
                            _id:null,
                            totalSalesAmount : {$sum:'$totalPrice'},
                            totalQuantitySold:{$sum:'$quantity'},
                            numberOfPurchases:{$sum:1}
                        }
                    }
                ],
                topProducts:[
                    {
                        $group:{
                            _id:'$product._id',
                            name:{$first:'$product.name'},
                            revenue:{$sum:'$totalPrice'},
                            totalQuantity:{$sum:'$quantity'},
                            imge:{$first:'$product.imgURL'}

                        }
                    },
                    {$sort:{revenue:-1}},
                    {$limit:5}
                ],
                topUsers:[
                    {
                        $group:{
                            _id:'$user.id',
                            name:{$first:'$user.name'},
                            totalSpent:{$sum:'$totalPrice'},
                            totalPurchases:{$sum:1}
                        }
                    },
                    {$sort:{totalSpent:-1}},
                    {$limit:5}

                ],
                monthlySales:[
                    {
                        $group:{
                            _id:{
                                year:{$year:'$purchasedAt'},
                                month:{$month:'$purchasedAt'}
                            },
                            totalRevenue:{$sum:'$totalPrice'},
                            totalQuantity:{$sum:'$quantity'},
                            totalPurchases:{$sum:1}
                        }
                    },
                    {$sort:{'_id.year':1,'_id.month':1}}
                ]
            }
        }

    ])
res.status(200).json({message:`sales report from ${startDate} to ${endDate} `,data:summary});

}