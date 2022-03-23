//9VIeIKxKuTFveqLx

import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import bodyparser from "body-parser";
import cookieparser from "cookie-parser";

// const express = require("express");
// const cors = require("cors");
// const helmet = require("helmet");
// const compression = require("compression");
// const bodyparser = require("body-parser");
// const cookieparser = require("cookie-parser");

// const userRouter = require("./routes/userRoutes");
import userRouter from "./routes/userRoutes.js";
import authRouter from "./routes/authRoutes.js";
import shopRouter from "./routes/shopRoutes.js";
import productRouter from "./routes/productRoutes.js";
import globalErrorHandler from "./controllers/errorController.js";

const app = express();

app.use(cors());
app.use(cookieparser());
app.use(helmet());
app.use(compression());
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }));

app.use("/api/users", userRouter);
app.use("/api/auth", authRouter);
app.use("/api/shops", shopRouter);
app.use("/api/products", productRouter);

app.use(globalErrorHandler);

export default app;
