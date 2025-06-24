const express = require("express");
const {register,login, logOut, logout, checkAuth} = require("../controllers/auth.controllers");
const { protect } = require("../middleware/auth.middleware");
const router = express.Router();

router.post('/register',register);
router.post('/login',login);
router.get('/logout',logout);
router.get('/check', protect, checkAuth);

module.exports = router;