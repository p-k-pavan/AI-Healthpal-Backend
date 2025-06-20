const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const userSchema = new Schema({
  name: {
    required: true,
    type: String
  },
  dob: {
    required: true,
    type: Date
  },
  age: {
    required: true,
    type: Number
  },
  gender: {
    required: true,
    type: String
  },
  role: {
    type: String,
    enum: ['admin', 'doctor', 'patient'],
    default: 'patient'
  },
  email: {
    required: true,
    type: String,
    unique: true
  },
  password: {
    required: true,
    type: String
  },
  isApproved: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

const User = model("User", userSchema);

module.exports = User;
