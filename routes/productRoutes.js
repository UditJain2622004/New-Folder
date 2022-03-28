import express from "express";
import * as shopController from "./../controllers/shopController.js";
import * as authController from "./../controllers/authController.js";
import * as productController from "./../controllers/productController.js";

const router = express.Router();

router
  .route("/")
  .get(productController.getAllProducts)
  .post(productController.createProduct);

router
  .route("/:productId")
  .get(productController.getOneProduct)
  .patch(productController.updateProduct)
  .delete(productController.deleteProduct);

router
  .route("/shop/:shopId")
  .get(shopController.shopById, productController.getProductsByShop)
  .post(
    authController.requireSignIn,
    shopController.shopById,
    shopController.isOwner,
    productController.createMyProduct
  );

router
  .route("/:productId/shop/:shopId")
  .patch(
    authController.requireSignIn,
    shopController.shopById,
    shopController.isOwner,
    productController.updateMyProduct
  );
// .delete(
//   authController.requireSignIn,
//   shopController.shopById,
//   shopController.isOwner,
//   productController.removeProductsFromMyShop
// );

export default router;
