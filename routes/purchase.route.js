const express = require('express');
const router = express.Router();
const {authenticate} = require('../middlewares/auth.middleware');
const {authorize} = require('../middlewares/role.middleware');
const {createPurchase,returnAllPurchases,returnUserPurchases} = require('../controllers/purchase.controller');


router.post('/',authenticate, authorize('user'),createPurchase);

router.get('/',authenticate, authorize('admin'),returnAllPurchases);

router.get('/user-purchases',authenticate, authorize('user'),returnUserPurchases);

module.exports = router;