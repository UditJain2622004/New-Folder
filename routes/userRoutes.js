// const express = require("express");
// const userControlller = require("./../controllers/userController");
import express from "express";
import * as userControlller from "./../controllers/userController.js";
import * as authControlller from "./../controllers/authController.js";

const router = express.Router();

router
  .route("/")
  .get(userControlller.getAllUsers)
  .post(userControlller.createUser);

router
  .route("/updateMe")
  .patch(authControlller.requireSignIn, userControlller.updateMe);
router
  .route("/deleteMe")
  .delete(authControlller.requireSignIn, userControlller.deleteMe);

router
  .route("/updatePassword")
  .post(authControlller.requireSignIn, authControlller.updatePassword);

router
  .route("/:userId")
  .get(userControlller.getUserById)
  .patch(userControlller.updateUserById)
  .delete(userControlller.deleteUserById);

// module.exports = router;
export default router;
