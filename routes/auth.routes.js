const express = require("express");
const {register,login, logOut} = require("../controllers/auth.controllers");
const router = express.Router();

router.post('/register',register);
router.post('/login',login);
router.get('/logout',logOut)

module.exports = router;