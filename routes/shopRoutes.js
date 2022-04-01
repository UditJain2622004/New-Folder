import express from "express";
import * as shopController from "./../controllers/shopController.js";
import * as authController from "./../controllers/authController.js";

const router = express.Router();

router
  .route("/")
  .get(shopController.getAllShops)
  .post(shopController.createShop);

router
  .route("/myShop")
  .get(authController.requireSignIn, shopController.getMyShops)
  .post(authController.requireSignIn, shopController.createMyShop);

router
  .route("/myShop/:shopId")
  .patch(
    authController.requireSignIn,
    shopController.shopById,
    shopController.isOwner,
    shopController.updateMyShop
  )
  .delete(
    authController.requireSignIn,
    shopController.shopById,
    shopController.isOwner,
    shopController.deleteShop
  );

router
  .route("/myshop/:shopId/products")
  .post(
    // Uncomment these methods (commented just for testing)
    // authController.requireSignIn,
    shopController.shopById,
    // shopController.isOwner,
    shopController.addProductToMyShop
  )
  .delete(
    // Uncomment these methods (commented just for testing)
    // authController.requireSignIn,
    shopController.shopById,
    // shopController.isOwner,
    shopController.removeProductsFromMyShop
  );

router
  .route("/:shopId")
  .get(shopController.getOneShop)
  .patch(shopController.updateShop)
  .delete(shopController.deleteShop);

router.route("/owner/:userId").get(shopController.getShopsOfAUser);

export default router;
