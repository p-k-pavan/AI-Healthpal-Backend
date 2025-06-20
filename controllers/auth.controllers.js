const User = require("../models/user.models");
const bcrypt = require("bcrypt");

const register = async (req, res, next) => {
  const { name, age, dob, gender, role, email, password } = req.body;

  try {
    if (!name || !age || !dob || !gender || !role || !email || !password) {
      const error = new Error("All fields are required");
      error.statusCode = 400;
      return next(error);
    }
    if (
      typeof name !== "string" ||
      typeof age !== "number" ||
      isNaN(Date.parse(dob)) ||
      typeof gender !== "string" ||
      typeof role !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string"
    ) {
      const error = new Error("Invalid input types");
      error.statusCode = 400;
      return next(error);
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      const error = new Error("This email already exists");
      error.statusCode = 409;
      return next(error);
    }

    const hashedPassword = bcrypt.hashSync(password, 10);

    const newUser = new User({
      name,
      dob,
      age,
      gender,
      role,
      email,
      password: hashedPassword
    });

    await newUser.save();

    res.status(201).json({
      success: true,
      message: "User registered successfully"
    });
  } catch (error) {
    next(error);
  }
};

module.exports = register;
