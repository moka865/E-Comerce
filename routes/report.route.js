const {getSalesReport} =require('../controllers/report.controller');
const express = require('express');
const router = express.Router();
const {authenticate} = require('../middlewares/auth.middleware');
const {authorize} = require('../middlewares/role.middleware');

router.get('/sales',authenticate,authorize('admin'),getSalesReport);

module.exports = router;