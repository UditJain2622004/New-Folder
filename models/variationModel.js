import mongoose from "mongoose";
import { variableSchema, Product } from "./productModel.js";

const variationsSchema = new mongoose.Schema({
  shop: {
    type: mongoose.Schema.ObjectId,
    ref: "Shop",
  },

  product: {
    type: mongoose.Schema.ObjectId,
    ref: "Product",
  },
  variation: {
    type: variableSchema,
  },
});

variationsSchema.pre("save", async function (next) {
  if (!this.variation) return next();

  if (!this.populated("product")) {
    await this.populate([{ path: "product", select: "-shops" }]);
  }
  // console.log(this);
  if (this.variation.price < this.product.lowestPrice) {
    this.product.lowestPrice = this.variation.price;
    await Product.updateOne(
      { _id: this.product._id },
      { lowestPrice: this.variation.price, lowestPriceShop: this.shop }
    );
  }
  next();
});

variationsSchema.index({ shop: 1, product: 1 }, { unique: true });

const Variation = mongoose.model("Variation", variationsSchema);
export default Variation;
