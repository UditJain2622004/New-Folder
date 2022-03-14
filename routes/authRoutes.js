import express from "express";
import * as authControlller from "./../controllers/authController.js";

const router = express.Router();

router.route("/signin").post(authControlller.signin);
router.route("/signup").post(authControlller.signup);
router.route("/signout").get(authControlller.signout);

export default router;
