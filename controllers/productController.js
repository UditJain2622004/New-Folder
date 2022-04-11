import express from "express";
import { Product } from "./../models/productModel.js";
import Shop from "./../models/shopModel.js";
import Variation from "./../models/variationModel.js";
import { sendSuccessResponse, filterObj } from "./../utils/functions.js";
import appError from "./../utils/appError.js";
import APIFeatures from "./../utils/features.js";
import mongoose from "mongoose";
import merge from "lodash.merge";
import clonedeep from "lodash.clonedeep";

const sortingFunction = (a, b) => {
  if (a.details.price < b.details.price) {
    return -1;
  }
  if (a.details.price > b.details.price) {
    return 1;
  }
  return 0;
};

export const getAllProducts = async (req, res, next) => {
  try {
    const features = new APIFeatures(Product.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate()
      .lean();
    const products = await features.query;
    // console.log(products[0].constructor.name);

    const productsWithLowestPrice = [];

    for (const el of products) {
      let variations = await Variation.find({
        product: el._id,
      })
        .sort("variation.price")
        .lean();

      variations = variations.filter((el) => el.variation !== undefined);

      //prettier-ignore
      if ( variations.length !== 0 && variations[0].variation && variations[0].variation.price && el.variables) {
        if (variations[0].variation.price < el.variables.price) {
          
           merge(el.variables , variations[0].variation)
          el.shop = variations[0].shop;
          el.shops = undefined;
        }
      }
      productsWithLowestPrice.push(el);
    }

    // console.log(productsWithLowestPrice);

    //prettier-ignore
    sendSuccessResponse(res,200,productsWithLowestPrice,"products",products.length);
  } catch (err) {
    next(err);
  }
};

export const createProduct = async (req, res, next) => {
  try {
    //prettier-ignore
    const details = filterObj(req.body, ["name","description","category","variables",]);
    const product = await Product.create(details);
    // if (req.body.shop) {
    //   await Shop.updateOne(
    //     { _id: req.body.shop },
    //     { $push: { products: product._id } }
    //   );
    // }
    sendSuccessResponse(res, 201, product, "product");
  } catch (err) {
    next(err);
  }
};

export const getOneProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.productId)
      .select(" -__v -shops")
      .lean();
    if (!product) return next(new appError("Product not found!", 400));

    const variations = await Variation.find({
      product: req.params.productId,
    });
    // console.log(variations);

    if (variations.length === 0)
      return next(new appError("No shop currently sells this product!!"));

    if (variations.length !== 0) {
      // const details = { price: product.price, quantity: product.quantity };

      const products = variations.map((el) => {
        let copy = clonedeep(product.variables);
        // console.log(el.variation);
        if (el.variation) {
          merge(copy, el.variation);
        }
        // console.log(copy);
        return { shop: el.shop, details: copy };
      });
      products.sort(sortingFunction);
      // console.log(products);

      product.shop = products[0].shop;
      merge(product.variables, products[0].details);

      products.shift();

      product.otherShops = products.map((el) => {
        return { shop: el.shop, details: el.details };
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

// export const updateProduct = async (req, res, next) => {
//   try {
//     req.body.updated = Date.now();
//     //prettier-ignore
//     const product = await Product.findByIdAndUpdate(req.params.productId,req.body,{
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

// export const deleteProduct = async (req, res, next) => {
//   try {
//     await Product.findByIdAndDelete(req.params.productId);
//     sendSuccessResponse(res, 204);
//   } catch (err) {
//     next(err);
//   }
// };

//     =======================================  USER  ======================================================

//             NOT COMPLETED
export const getProductsByShop = async (req, res, next) => {
  try {
    // const products = await Product.find({ shop: req.params.shopId });
    const products = await Shop.findById(req.params.shopId)
      .populate({
        path: "products",
        select: " -created -__v",
        populate: { path: "product", select: "-shops -__v" },
      })
      .lean();
    // const products = await req.shop.populate({
    //   path: "products",
    //   select: " -created -__v",
    //   populate: { path: "product" },
    // });

    const populatedProducts = products.products.map((el) => {
      console.log(el.product);
      if (el.variation) {
        merge(el.product.variables, el.variation);
      }
      // console.log(el.product);
      return el.product;
    });
    // console.log(populatedProducts);

    //prettier-ignore
    sendSuccessResponse(res,200,populatedProducts,"products",populatedProducts.length);
  } catch (err) {
    next(err);
  }
};

//   ONLY FOR CREATING A COMPLETELY NEW PRODUCT
export const createMyProduct = async (req, res, next) => {
  try {
    //prettier-ignore
    const details = filterObj(req.body, ["name","description","category","variables",]);
    details.shops = [req.shop._id];
    details.lowestPrice = req.body.variables.price;
    details.lowestPriceShop = req.shop._id;

    const product = await Product.create(details);

    const variation = await Variation.create({
      shop: req.shop._id,
      product: product._id,
    });

    req.shop.products.push(variation._id);
    await req.shop.save();

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

// export const allShopsOfAProduct = async (req, res, next) => {
//   try {
//     //TODO        =============================================

//     sendSuccessResponse(res, 200);
//   } catch (err) {
//     next(err);
//   }
// };

//  UPDATING PRODUCT OF A PARTICULAR SHOP ,i.e., a variation
export const updateMyProduct = async (req, res, next) => {
  try {
    const product = await Variation.findOne({
      product: req.params.productId,
      shop: req.shop._id,
    }).populate("product");
    product.variation = merge(product.variation, req.body);
    await product.save();
    product.product.variables = merge(
      product.product.variables,
      product.variation
    );
    // console.log(product);
    // console.log(product.variation);
    // const details = await Product.findOne({
    //   "variables._id": product.variables._id,
    // });
    // console.log(details);
    // The above implementation won't work . bcz now we have variations
    sendSuccessResponse(res, 200, product.product, "product");
  } catch (err) {
    next(err);
  }
};

// UPDATING THE DEFAULT PRODUCT
export const updateProduct = async (req, res, next) => {
  try {
    // The above implementation won't work . bcz now we have variations
    sendSuccessResponse(res, 200);
  } catch (err) {
    next(err);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.productId);
    if (!product) return next(new appError("Product not found!", 404));

    const variations = await Variation.find({
      product: req.params.productId,
    });
    if (variations) {
      const variationIds = variations.map((el) => el._id);
      console.log(variationIds);

      // const shops = await Shop.find({ products: { $in: variationIds } });
      // console.log(shops);

      await Shop.updateMany(
        { products: { $in: variationIds } },
        { $pull: { products: { $in: variationIds } } }
      );
      await Variation.deleteMany({ product: req.params.productId });
    }
    sendSuccessResponse(res, 204);
  } catch (err) {
    next(err);
  }
};
