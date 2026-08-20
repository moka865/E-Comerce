const {getProductBySlug,getAllProducts,createProduct} = require('../controllers/product.controller');
const express = require('express');
const router= express.Router();
const {authenticate}=require('../middlewares/auth.middleware')
const {authorize}=require('../middlewares/role.middleware');
const { upload } = require('../middlewares/upload.middleware');

router.post('/',authenticate,authorize('admin'),upload.single('img'),createProduct);
router.get('/',getAllProducts);
router.get('/:slug',getProductBySlug);

module.exports = router;

