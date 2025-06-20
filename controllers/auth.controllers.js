const User = require("../models/user.models");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken")

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

const login = async (req, res, next) => {
    const { email, password } = req.body;

    try {
        if (!email || !password) {
            const error = new Error("All fields are required");
            error.statusCode = 400;
            return next(error);
        }

        const existingUser = await User.findOne({ email });
        if (!existingUser) {
            const error = new Error("Incorrect credentials");
            error.statusCode = 401;
            return next(error);
        }

        const isMatch = bcrypt.compareSync(password, existingUser.password);
        if (!isMatch) {
            const error = new Error("Incorrect credentials");
            error.statusCode = 401;
            return next(error);
        }

        const isProduction = process.env.NODE_ENV === "production";
        const age = 1000 * 60 * 60 * 24 * 1;
        const token = jwt.sign({ id: existingUser._id }, process.env.JWT_SECRET, {
            expiresIn: age
        });

        const { password: pass, ...rest } = existingUser._doc;

        res.cookie("web_token", token, {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? "none" : "lax",
            path: "/",
            partitioned: isProduction,
            maxAge: age,
        }).status(200).json({
            success: true,
            message: "User logged in successfully",
            user: rest
        });
    } catch (error) {
        next(error);
    }
};

const logOut = (req, res, next) => {
  try {
    res.clearCookie("web_token").status(200).json({ success: true,message: "User log out successfully" })
  } catch (error) {
    next(error)
  }
};

module.exports = { register, login,logOut };
