const {createBackup,restore} = require('../controllers/database.controller');

const express = require('express');
const router = express.Router();
const {authenticate} = require('../middlewares/auth.middleware');
const {authorize} = require('../middlewares/role.middleware');

router.get('/create-backup',authenticate,authorize('admin'),createBackup);
router.post('/restore',authenticate,authorize('admin'),restore);

module.exports = router;