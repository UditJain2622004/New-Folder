import express from "express";
import Product from "./../models/productModel.js";
import Shop from "./../models/shopModel.js";
import { sendSuccessResponse, filterObj } from "./../utils/functions.js";
import appError from "./../utils/appError.js";
import APIFeatures from "./../utils/features.js";

export const getAllProducts = async (req, res, next) => {
  try {
    const features = new APIFeatures(Product.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    const products = await features.query;
    sendSuccessResponse(res, 200, products, "products", products.length);
  } catch (err) {
    next(err);
  }
};

export const createProduct = async (req, res, next) => {
  try {
    const product = await Product.create(req.body);
    sendSuccessResponse(res, 201, product, "product");
  } catch (err) {
    next(err);
  }
};

export const getOneProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.productId);
    if (!product) return next(new appError("Product not found!", 400));
    sendSuccessResponse(res, 200, product, "product");
  } catch (err) {
    next(err);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    req.body.updated = Date.now();
    //prettier-ignore
    const product = await Product.findByIdAndUpdate(req.params.productId,req.body,{
        runValidators: true,
        new: true,
      }
    );
    if (!product) return next(new appError("Product not found!", 400));
    sendSuccessResponse(res, 200, product, "product");
  } catch (err) {
    next(err);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    await Product.findByIdAndDelete(req.params.productId);
    sendSuccessResponse(res, 204);
  } catch (err) {
    next(err);
  }
};

//     =======================================  USER  ======================================================

export const getProductsByShop = async (req, res, next) => {
  try {
    const products = await Product.find({ shop: req.params.shopId });
    sendSuccessResponse(res, 200, products, "products", products.length);
  } catch (err) {
    next(err);
  }
};

export const createMyProduct = async (req, res, next) => {
  try {
    const details = filterObj(req.body, "name", "quantity", "price");
    details.shop = req.shop._id;
    const product = await Product.create(details);
    sendSuccessResponse(res, 201, product, "product");
  } catch (err) {
    next(err);
  }
};

export const updateMyProduct = async (req, res, next) => {
  try {
    //prettier-ignore
    const updates = filterObj(req.body,"name","description","quantity","price","category");
    updates.updated = Date.now();
    //prettier-ignore
    const product = await Product.findByIdAndUpdate(req.params.productId,updates,{
        runValidators: true,
        new: true,
      }
    );

    if (!product) return next(new appError("Product not found!", 400));
    sendSuccessResponse(res, 200, product, "product");
  } catch (err) {
    next(err);
  }
};

export const deleteMyProduct = async (req, res, next) => {
  try {
    await Product.findByIdAndDelete(req.params.productId);
    sendSuccessResponse(res, 204);
  } catch (err) {
    next(err);
  }
};
