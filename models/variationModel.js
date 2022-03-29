import mongoose from "mongoose";
import { productSchema } from "./productModel.js";

const variationsSchema = new mongoose.Schema({
  shop: {
    type: mongoose.Schema.ObjectId,
    ref: "Shop",
  },

  product: {
    type: mongoose.Schema.ObjectId,
    ref: "Product",
  },
  variation: {},
});

const Variation = mongoose.model("Variation", variationsSchema);
export default Variation;
