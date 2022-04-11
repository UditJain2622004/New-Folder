import express from "express";
import mongoose from "mongoose";
import Shop from "./../models/shopModel.js";
import Variation from "./../models/variationModel.js";
import { Product } from "./../models/productModel.js";
import User from "./../models/userModel.js";
import { sendSuccessResponse, filterObj } from "./../utils/functions.js";
import appError from "./../utils/appError.js";

const isEmpty = (obj) => {
  return Object.keys(obj).length === 0;
};

const checkVariations = (product, enteredDetails) => {
  const difference = {};
  Object.keys(enteredDetails).forEach((el) => {
    if (product[el] !== enteredDetails[el]) {
      difference[el] = enteredDetails[el];
    }
  });
  return difference;
};

export const shopById = async (req, res, next) => {
  try {
    const shop = await Shop.findById(req.params.shopId);
    if (!shop) return next(new appError("Shop not found", 404));
    req.shop = shop;
    next();
  } catch (err) {
    next(err);
  }
};

export const isOwner = async (req, res, next) => {
  if (!req.user._id.equals(req.shop.owner)) {
    return next(new appError("This shop doesn't belong to you!", 400));
  }
  next();
};

//         ===================     ALL      =================================================================================

export const getAllShops = async (req, res, next) => {
  try {
    const shops = await Shop.find();
    sendSuccessResponse(res, 200, shops, "shops", shops.length);
  } catch (err) {
    next(err);
  }
};

export const getShopsOfAUser = async (req, res, next) => {
  try {
    const shops = await Shop.find({ owner: req.params.userId }).select(
      "-owner -__v"
    );
    if (!shops)
      return next(new appError("This user doesn't have any shops!", 400));
    sendSuccessResponse(res, 200, shops, "shops", shops.length);
  } catch (err) {
    next(err);
  }
};

export const getOneShop = async (req, res, next) => {
  try {
    const shop = await Shop.findById(req.params.shopId);
    await shop.myPopulate();

    if (!shop) return next(new appError("No shop found!", 404));
    sendSuccessResponse(res, 200, shop, "shop");
  } catch (err) {
    next(err);
  }
};

export const updateShop = async (req, res, next) => {
  try {
    req.body.updated = Date.now();
    const shop = await Shop.findByIdAndUpdate(req.params.shopId, req.body, {
      runValidators: true,
      new: true,
    });

    await shop.myPopulate();

    if (!shop) return next(new appError("Shop not found!", 404));

    sendSuccessResponse(res, 200, shop, "shop");
  } catch (err) {
    next(err);
  }
};

export const deleteShop = async (req, res, next) => {
  try {
    const shop = await Shop.findByIdAndDelete(req.params.shopId);
    if (!shop) return next(new appError("Shop not found!", 404));
    await Variation.deleteMany({ shop: req.params.shopId });
    await Product.updateMany(
      { shops: { $in: [req.params.shopId] } },
      { $pull: { shops: req.params.shopId } }
    );

    sendSuccessResponse(res, 204);
  } catch (err) {
    next(err);
  }
};

export const createShop = async (req, res, next) => {
  try {
    const owner = await User.findById(req.body.owner);
    if (!owner)
      return next(new appError("User not found with this owner Id!", 404));
    if (!owner.isSeller)
      return next(new appError("This user is not a seller!", 400));
    const shop = await Shop.create(req.body);
    await shop.myPopulate();
    sendSuccessResponse(res, 201, shop, "shop");
  } catch (err) {
    next(err);
  }
};

//   ===========================  SIGNED IN USER    =================================================

export const createMyShop = async (req, res, next) => {
  try {
    if (!req.user.isSeller)
      return next(new appError("You are not a seller!", 400));
    const details = filterObj(req.body, ["name", "description"]);
    details.owner = req.user._id;
    const shop = await Shop.create(details);
    await shop.myPopulate();
    sendSuccessResponse(res, 201, shop, "shop");
  } catch (err) {
    next(err);
  }
};

export const getMyShops = async (req, res, next) => {
  try {
    const shops = await Shop.find({ owner: req.user._id }).select("-owner");
    if (!shops) return next(new appError("You don't have any shops!", 400));
    sendSuccessResponse(res, 200, shops, "shops", shops.length);
  } catch (err) {
    next(err);
  }
};

export const updateMyShop = async (req, res, next) => {
  try {
    const updates = filterObj(req.body, ["name", "description"]);
    updates.updated = Date.now();
    //prettier-ignore
    const updatedShop = await Shop.findByIdAndUpdate(req.params.shopId, updates, { runValidators: true, new: true }).select("-owner")
    await updatedShop.myPopulate();
    sendSuccessResponse(res, 200, updatedShop, "shop");
  } catch (err) {
    next(err);
  }
};

//  TODO  ::::::  DELETING A SHOP SHOULD DELETE ALL OF ITS VARIATIONS AND REFERENCE OF THE SHOP IN PRODUCTS
// export const deleteMyShop = async (req, res, next) => {
//   try {
//     await Shop.findByIdAndDelete(req.params.shopId);                            // IT'S SAME AS deleteShop so only that is used
//     await Variation.deleteMany({ shop: req.params.shopId });
//     await Product.updateMany({ shops: { $in: [req.params.shopId] } }, { $pull: { shops: req.params.shopId } })
//     sendSuccessResponse(res, 204);
//   } catch (err) {
//     next(err);
//   }
// };

export const addProductToMyShop = async (req, res, next) => {
  try {
    let shop;

    for (const [i, el] of req.body.products.entries()) {
      const product = await Product.findById(el);

      // Check if the product has been changed
      const difference = checkVariations(
        product.variables,
        req.body.details[i]
      );
      console.log(difference);

      const variation = await Variation.create({
        shop: req.shop._id,
        product: product._id,
        variation: difference,
      });

      // bcz no variation will be created if the shop already has this product
      if (!variation) continue;

      shop = await Shop.findByIdAndUpdate(
        req.shop._id,
        { $addToSet: { products: variation._id } },
        { runValidators: true, new: true }
      );

      await Product.updateOne(
        { _id: product._id },
        { $addToSet: { shops: req.shop._id } }
      );

      //   // When there is no change in product
      //   if (isEmpty(difference)) {
      //     shop = await Shop.findByIdAndUpdate(
      //       req.shop._id,
      //       { $addToSet: { products: el } },
      //       { runValidators: true, new: true }
      //     );

      //     // When default product is changed
      //   } else {
      //     const variation = await Variation.create({
      //       shop: req.shop._id,
      //       product: product._id,
      //       variation: difference,
      //     });
      //     shop = await Shop.findByIdAndUpdate(
      //       req.shop._id,
      //       { $addToSet: { products: variation._id } },
      //       { runValidators: true, new: true }
      //     );

      //     // console.log(variation);
      //   }

      //   //  Adding shopId into shops field of products
      //   await Product.updateOne(
      //     { _id: product._id },
      //     { $addToSet: { shops: req.shop._id } }
      //   );
    }
    await shop.myPopulate();
    sendSuccessResponse(res, 200, shop, "shop");
  } catch (err) {
    next(err);
  }
};

export const removeProductsFromMyShop = async (req, res, next) => {
  try {
    let shop;
    for (const el of req.body.products) {
      const variation = await Variation.findOne({
        shop: req.shop._id,
        product: el,
      });
      if (!variation) continue;
      shop = await Shop.findByIdAndUpdate(
        req.shop._id,
        { $pull: { products: variation._id } },
        { runValidators: true, new: true }
      );
      await Variation.deleteOne({ shop: req.shop._id, product: el });
      const product = await Product.findByIdAndUpdate(el, {
        $pull: { shops: req.shop._id },
      });
      if ((product.lowestPriceShop = req.shop._id)) {
        await product.setLowestPriceAndShop();
      }
    }

    await shop.myPopulate();
    sendSuccessResponse(res, 200, shop, "shop");
  } catch (err) {
    next(err);
  }
};
