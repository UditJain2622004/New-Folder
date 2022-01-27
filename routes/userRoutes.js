// const express = require("express");
// const userControlller = require("./../controllers/userController");
import express from "express";
import * as userControlller from "./../controllers/userController.js";

const router = express.Router();

router
  .route("/")
  .get(userControlller.getAllUsers)
  .post(userControlller.createUser);

router
  .route("/:id")
  .get(userControlller.getUserById)
  .patch(userControlller.updateUserById)
  .delete(userControlller.deleteUserById);

// module.exports = router;
export default router;
