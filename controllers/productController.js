import express from "express";
import { Product } from "./../models/productModel.js";
import Shop from "./../models/shopModel.js";
import Variation from "./../models/variationModel.js";
import { sendSuccessResponse, filterObj } from "./../utils/functions.js";
import appError from "./../utils/appError.js";
import APIFeatures from "./../utils/features.js";
import mongoose from "mongoose";
import merge from "lodash.merge";

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
    if (req.body.shop) {
      await Shop.updateOne(
        { _id: req.body.shop },
        { $push: { products: product._id } }
      );
    }
    sendSuccessResponse(res, 201, product, "product");
  } catch (err) {
    next(err);
  }
};

export const getOneProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.productId)
      .select(" -__v")
      .lean();
    if (!product) return next(new appError("Product not found!", 400));

    const variations = await Variation.find({
      product: req.params.productId,
    }).sort("variation.price");
    console.log(variations);

    if (variations.length !== 0) {
      product.shop = variations[0].shop;
      merge(product, variations[0].variation);

      variations.shift();

      product.otherShops = variations.map((el) => {
        return { shop: el.shop, details: el.variation };
      });
    }

    // const shops = await Shop.find({                                    //SHOPS HAVING THIS PRODUCT
    //   products: { $in: [mongoose.Types.ObjectId(product._id)] },
    // });

    // const product = await Product.aggregate([
    //   {
    //     $match: { _id: mongoose.Types.ObjectId(req.params.productId) }, // the "$match"  stage is like a query, this will take tours which have rating
    //   },
    //   {
    //     $unwind: "$shops",
    //   },
    //   {
    //     $lookup: {
    //       from: "shops",
    //       localField: "shops",
    //       foreignField: "_id",
    //       as: "shopsIn",
    //     },
    //   },
    // {
    //   $replaceRoot: {
    //     newRoot: {
    //       $mergeObjects: [{ $arrayElemAt: ["$shopsIn", 0] }, "$$ROOT"],
    //     },
    //   },
    // },
    // ]);

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
    // const products = await Product.find({ shop: req.params.shopId });
    const products = await req.shop.populate({
      path: "products",
      select: " -created -__v",
    });
    //prettier-ignore
    sendSuccessResponse(res,200,products.products,"products",products.products.length);
  } catch (err) {
    next(err);
  }
};

export const createMyProduct = async (req, res, next) => {
  try {
    const details = filterObj(req.body, ["name", "quantity", "price"]);
    // details.shop = req.shop._id;
    const product = await Product.create(details);
    product.shops.push(req.shop._id);
    req.shop.products.push(product._id);
    await req.shop.save();
    await product.save();
    sendSuccessResponse(res, 201, product, "product");
  } catch (err) {
    next(err);
  }
};

// export const updateMyProduct = async (req, res, next) => {
//   try {
//     //prettier-ignore
//     const updates = filterObj(req.body,["name","description","quantity","price","category"]);
//     updates.updated = Date.now();
//     //prettier-ignore
//     const product = await Product.findByIdAndUpdate(req.params.productId,updates,{
//         runValidators: true,
//         new: true,
//       }
//     );

//     if (!product) return next(new appError("Product not found!", 400));
//     sendSuccessResponse(res, 200, product, "product");
//   } catch (err) {
//     next(err);
//   }
// };

export const allShopsOfAProduct = async (req, res, next) => {
  try {
    //TODO        =============================================
    sendSuccessResponse(res, 200);
  } catch (err) {
    next(err);
  }
};

export const updateMyProduct = async (req, res, next) => {
  try {
    // The above implementation won't work . bcz now we have variations
    sendSuccessResponse(res, 200);
  } catch (err) {
    next(err);
  }
};
