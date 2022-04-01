import express from "express";
import User from "../models/userModel.js";
import appError from "./../utils/appError.js";
import { filterObj, sendSuccessResponse } from "./../utils/functions.js";

export async function getAllUsers(req, res, next) {
  try {
    const users = await User.find();
    sendSuccessResponse(res, 200, users, "users", users.length);
  } catch (err) {
    next(err);
  }
}

export async function createUser(req, res, next) {
  try {
    const newUser = await User.create(req.body);
    newUser.password = undefined;
    sendSuccessResponse(res, 201, newUser, "user");
  } catch (err) {
    next(err);
  }
}

export async function getUserById(req, res, next) {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return next(new appError("User not found!", 404));

    sendSuccessResponse(res, 200, user, "user");
  } catch (err) {
    next(err);
  }
}

export async function updateUserById(req, res, next) {
  try {
    req.body.updated = Date.now();
    const user = await User.findByIdAndUpdate(req.params.userId, req.body, {
      runValidators: true,
      new: true,
    });

    if (!user) return next(new appError("User not found!", 404));

    sendSuccessResponse(res, 200, user, "user");
  } catch (err) {
    next(err);
  }
}

export async function deleteUserById(req, res, next) {
  try {
    const user = await User.findByIdAndDelete(req.params.userId);
    if (!user) return next(new appError("User not found!", 404));

    sendSuccessResponse(res, 204, null);
  } catch (err) {
    next(err);
  }
}

// ONLY FOR UPDATING NAME AND EMAIL
export async function updateMe(req, res, next) {
  try {
    if (req.body.password || req.body.passwordConfirm)
      return next(new appError("Go to /updatePassword!", 400));
    let updates = filterObj(req.body, ["name", "email", "isSeller"]);
    updates.updated = Date.now();

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      runValidators: true,
      new: true,
    });

    if (!user) return next(new appError("User not found!", 404));

    sendSuccessResponse(res, 200, user, "user");
  } catch (err) {
    next(err);
  }
}

export async function deleteMe(req, res, next) {
  try {
    await User.findByIdAndDelete(req.user._id);
    sendSuccessResponse(res, 204, null);
  } catch (err) {
    next(err);
  }
}
