const express= require('express');
const router = express.Router();
const {getAllUsers,createUser} = require('../controllers/user.controller')
const {authenticate} = require('../middlewares/auth.middleware')
const {authorize} = require('../middlewares/role.middleware');

router.post('/',createUser('user'));



router.get('/',authenticate,authorize('admin'),getAllUsers);
router.post('/admin',authenticate,authorize('admin'),createUser('admin'));


module.exports = router;