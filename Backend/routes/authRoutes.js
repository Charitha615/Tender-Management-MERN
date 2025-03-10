const express = require('express');
const { registerUser, loginUser, getPendingUsers, approveUser } = require('../controllers/authController');

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/pending-users', getPendingUsers); // Super Admin only
router.post('/approve-user', approveUser); // Super Admin only

module.exports = router;