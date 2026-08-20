const express = require('express');
const router = express.Router();
const { authenticate } = require("../middlewares/auth.middleware");
const {authorize}=require('../middlewares/role.middleware');
const {createPurchase} = require('../controllers/purchase.controller');


router.post('/',authenticate,authorize('user'),createPurchase);


// route.get('/',authenticate,authorize('admin'),returnAllPrurchase);
// route.get('/:id',authenticate,authorize('admin'),returnOnePrurchase);
// route.put('/:id',authenticate,authorize('admin'),returnPurchase);
module.exports = router;