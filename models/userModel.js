// const mongoose = require("mongoose");
// const bcrypt = require("bcryptjs");
import bcrypt from "bcryptjs";
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: [true, "Name is required"],
  },
  email: {
    type: String,
    trim: true,
    required: [true, "Email is required"],
    unique: [true, "An account already exists with this email."],
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      "Invalid email address.",
    ],
  },
  created: {
    type: Date,
    default: Date.now,
  },
  updated: {
    type: Date,
  },
  password: {
    type: String,
    required: true,
    minlength: [8, "Password must be of atleast 8 characters"],
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: true,
    validate: {
      // THIS WORKS ON SAVE AND CREATE ONLY, NOT ON UPDATE
      validator: function (el) {
        return el === this.password;
      },
      message: "Passwords do not match",
    },
  },
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

userSchema.methods.checkPassword = async function (enteredPassword, password) {
  return await bcrypt.compare(enteredPassword, password);
};

const User = mongoose.model("User", userSchema);

// module.exports = User;
export default User;
