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

const addShopToProducts = (products, shopId) => {
  products.forEach(async (el) => {
    await Product.updateOne({ _id: el }, { $push: { shops: shopId } });
  });
};

const removeShopFromProducts = (products, shopId) => {
  products.forEach(
    async (el) =>
      await Product.updateOne({ _id: el }, { $pull: { shops: shopId } })
  );
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
    const shops = await Shop.find({ owner: req.params.userId });
    if (!shops)
      return next(new appError("This user doesn't have any shops!", 400));
    sendSuccessResponse(res, 200, shops, "shops", shops.length);
  } catch (err) {
    next(err);
  }
};

export const getOneShop = async (req, res, next) => {
  try {
    const shop = await Shop.findById(req.params.shopId)
      .populate({ path: "owner", select: "_id email name" })
      .populate({ path: "products", select: "-__v -created" });
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
    })
      .populate({ path: "owner", select: "_id email name" })
      .populate({ path: "products", select: "-__v -created" });

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
    const details = filterObj(req.body, "name", "description");
    details.owner = req.user._id;
    const shop = await Shop.create(details);
    sendSuccessResponse(res, 201, shop, "shop");
  } catch (err) {
    next(err);
  }
};

export const getMyShops = async (req, res, next) => {
  try {
    const shops = await Shop.find({ owner: req.user._id });
    if (!shops) return next(new appError("You don't have any shops!", 400));
    sendSuccessResponse(res, 200, shops, "shops", shops.length);
  } catch (err) {
    next(err);
  }
};

export const updateMyShop = async (req, res, next) => {
  try {
    const updates = filterObj(req.body, "name", "description");
    updates.updated = Date.now();
    //prettier-ignore
    const updatedShop = await Shop.findByIdAndUpdate(req.params.shopId, updates, { runValidators: true, new: true })
    .populate({ path: "products", select: "-__v -created" });
    sendSuccessResponse(res, 200, updatedShop, "shop");
  } catch (err) {
    next(err);
  }
};

export const deleteMyShop = async (req, res, next) => {
  try {
    await Shop.findByIdAndDelete(req.params.shopId);
    sendSuccessResponse(res, 204);
  } catch (err) {
    next(err);
  }
};

export const addProductToMyShop = async (req, res, next) => {
  try {
    let shop;

    for (const [i, el] of req.body.products.entries()) {
      const product = await Product.findById(el);

      // Check if the product has been changed
      const difference = checkVariations(product, req.body.details[i]);

      // When there is no change in product
      if (isEmpty(difference)) {
        shop = await Shop.findByIdAndUpdate(
          req.shop._id,
          { $addToSet: { products: el } },
          { runValidators: true, new: true }
        );

        // When default product is changed
      } else {
        shop = await Shop.findByIdAndUpdate(
          req.shop._id,
          { $addToSet: { customProducts: el } },
          { runValidators: true, new: true }
        );
        const variation = await Variation.create({
          shop: req.shop._id,
          product: product._id,
          variation: difference,
        });
        // console.log(variation);
      }

      //  Adding shopId into shops field of products
      await Product.updateOne(
        { _id: product._id },
        { $addToSet: { shops: req.shop._id } }
      );
    }

    sendSuccessResponse(res, 200, shop, "shop");
  } catch (err) {
    next(err);
  }
};

export const removeProductsFromMyShop = async (req, res, next) => {
  try {
    console.log(req.shop);
    let shop;
    //prettier-ignore
    for(const el of req.body.products){
      if (req.shop.products.includes(mongoose.Types.ObjectId(el))) {
        shop = await Shop.findByIdAndUpdate(
          req.shop._id,
          { $pull: { products: el } },
          {runValidators: true, new: true}
          );
        await Product.updateOne({ _id: el }, { $pull: { shops: req.shop._id } })
          
      //prettier-ignore
      } else if (req.shop.customProducts.includes(mongoose.Types.ObjectId(el))) {
        shop = await Shop.findByIdAndUpdate(
          req.shop._id,
          { $pull: { customProducts: el } },
          { runValidators: true, new: true }
        );
      await Variation.deleteOne({shop:req.shop._id,product:el});
      await Product.updateOne({ _id:el }, { $pull: { shops: req.shop._id } })
  
      }
    }

    //  IF PRODUCT NOT FOUND IN SHOP (TO SEND AN ERROR USE THIS OR JUST IGNORE THE PRODUCT)
    // else{
    //   return next(new appError("You don't have this product"),400)
    // }
    // const product = await Shop.findByIdAndUpdate(req.shop._id)

    sendSuccessResponse(res, 200, shop, "shop");
  } catch (err) {
    next(err);
  }
};
