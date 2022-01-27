// const User = require("../models/userModel.js");
import express from "express";
import User from "../models/userModel.js";
// import "User" from "../models/userModel.js";

export async function getAllUsers(req, res, next) {
  try {
    const users = await User.find();
    res.status(200).json({
      status: "success",
      results: users.length,
      data: {
        users,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      err: err.message,
    });
  }
}

export async function createUser(req, res, next) {
  try {
    const newUser = await User.create(req.body);
    res.status(200).json({
      status: "success",
      data: {
        user: newUser,
      },
    });
  } catch (err) {
    // console.log(err);
    res.status(400).json({
      status: "fail",
      err,
    });
  }
}

export async function getUserById(req, res, next) {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found!" });
    res.status(200).json({
      status: "success",
      data: {
        user,
      },
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({
      status: "fail",
      err,
    });
  }
}

export async function updateUserById(req, res, next) {
  try {
    req.body.updated = Date.now(); // to set the updated field we add it to req.body which is used for updating in next line
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      runValidators: true,
      new: true,
    });

    if (!user) return res.status(404).json({ message: "User not found!" });
    res.status(200).json({
      status: "success",
      data: {
        user,
      },
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({
      status: "fail",
      err,
    });
  }
}

export async function deleteUserById(req, res, next) {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found!" });
    res.status(204).json({
      status: "success",
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({
      status: "fail",
      err,
    });
  }
}
