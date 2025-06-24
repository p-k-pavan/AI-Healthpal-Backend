const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('..//models/user.models');

const generateToken = (userId) => {
  const age = 1000 * 60 * 60 * 24 * 7;
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: age });
};

const setAuthCookie = (res, token) => {
  const isProduction = process.env.NODE_ENV === 'production';
  const age = 1000 * 60 * 60 * 24 * 7;
  
  res.cookie('web_token', token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: age,
    path: '/',
    partitioned: isProduction
  });
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'All fields are required' 
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    const token = generateToken(user._id);
    setAuthCookie(res, token);

    const { password: _, ...userData } = user._doc;

    res.status(200).json({
      success: true,
      message: 'Login successful',
      user: userData,
      token
    });
  } catch (error) {
    next(error);
  }
};

const register = async (req, res, next) => {
  try {
    const { name, email, password, role, dob, gender } = req.body;

    if (!name || !email || !password || !role || !gender || !dob) {
      return res.status(400).json({ 
        success: false, 
        message: 'Required fields are missing' 
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ 
        success: false, 
        message: 'Email already in use' 
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role,
      dob: dob,
      gender: gender
    });

    await newUser.save();

    const token = generateToken(newUser._id);
    setAuthCookie(res, token);

    const { password: _, ...userData } = newUser._doc;

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      user: userData,
      token
    });
  } catch (error) {
    next(error);
  }
};

const logout = (req, res) => {
  res.clearCookie('web_token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    path: '/'
  });
  
  res.status(200).json({ 
    success: true, 
    message: 'Logout successful' 
  });
};

const checkAuth = async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'Unauthorized' 
      });
    }

    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    res.status(200).json({ 
      success: true, 
      user 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

module.exports = {login,register,logout,checkAuth};