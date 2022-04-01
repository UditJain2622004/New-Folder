import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import util from "util";
import { filterObj } from "./../utils/functions.js";
import appError from "./../utils/appError.js";

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, res, statusCode) => {
  const token = signToken(user._id);

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  res.cookie("jwt", token, cookieOptions);

  user.password = undefined;

  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};

export const signup = async (req, res, next) => {
  try {
    //prettier-ignore
    const details = filterObj(req.body,["name","email","password","passwordConfirm","isSeller"]);

    const user = await User.create(details);

    createSendToken(user, res, 201);
  } catch (err) {
    next(err);
  }
};

export const signin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return next(new appError("Please provide email and password!", 400));
    // return res
    //   .status(400)
    //   .json({ message: "Please provide email and password!" });

    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await user.checkPassword(password, user.password))) {
      return next(new appError("Invalid email or password!", 401));
    }

    createSendToken(user, res, 200);
  } catch (err) {
    next(err);
  }
};

export const signout = async (req, res, next) => {
  try {
    res.cookie("jwt", "loggedout", {
      expires: new Date(Date.now() + 1000),
      httpOnly: true,
    });
    //   console.log(req.cookies);
    res.status(200).json({
      message: "Signed Out",
    });
  } catch (err) {
    next(err);
  }
};

export const requireSignIn = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;
    if (!token) return next(new appError("You are not logged in!", 401));
    const decoded = await util.promisify(jwt.verify)(
      token,
      process.env.JWT_SECRET
    );

    const user = await User.findById(decoded.id);
    if (!user) return next(new appError("You are not logged in!", 401));

    // console.log(user.passwordChangedAfter(decoded.iat));
    if (user.passwordChangedAfter(decoded.iat))
      return next(new appError("You are not logged in!", 401));

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};

export const updatePassword = async (req, res, next) => {
  try {
    // 1) Get user from collection
    const user = await User.findById(req.user._id).select("+password");

    // 2) check if posted current password is correct
    const password = req.body.currentPassword;
    if (!(await user.checkPassword(password, user.password))) {
      return next(new appError("Wrong password", 401));
    }
    // 3) If so, update the password
    user.password = req.body.newPassword;
    user.passwordConfirm = req.body.passwordConfirm;
    await user.save();

    // 4) Log user in, send JWT
    // This is our made func. which makes a token creates a cookie and sends response
    createSendToken(user, res, 200);
  } catch (err) {
    next(err);
  }
};
