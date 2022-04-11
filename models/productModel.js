import mongoose from "mongoose";
import Variation from "./variationModel.js";

export const variableSchema = new mongoose.Schema({
  quantity: {
    type: Number,
    // required: [true, "Quantity is required"],
  },
  price: {
    type: Number,
    // required: [true, "Price is required"],
  },
});

export const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      unique: true,
    },

    description: {
      type: String,
      trim: true,
    },
    image: {
      data: Buffer,
      contentType: String,
    },
    category: {
      type: String,
    },

    shops: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "Shop",
      },
    ],
    lowestPrice: {
      type: Number,
    },
    lowestPriceShop: {
      type: mongoose.Schema.ObjectId,
      ref: "Shop",
    },
    created: {
      type: Date,
      default: Date.now,
      select: false,
    },
    updated: {
      type: Date,
    },
    variables: variableSchema,
  },
  {
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        delete ret.__v;
      },
    },
    toObject: { virtuals: true },
    id: false,
  }
);

productSchema.methods.setLowestPriceAndShop = async function () {
  const variations = await Variation.find({ product: this._id }).sort(
    "variation.price"
  );

  const firstNotNullVariation = variations.find(
    (el) => el.variation !== undefined
  );

  if (
    firstNotNullVariation &&
    firstNotNullVariation.variation.price < this.variables.price
  ) {
    this.lowestPrice = firstNotNullVariation.variation.price;
    this.lowestPriceShop = firstNotNullVariation.shop;
  } else {
    this.lowestPrice = this.variables.price;
    this.lowestPriceShop = variations[0].shop;
  }
  this.save();
  // console.log(firstNotNullVariation);
  // console.log(variations);
};

export const Product = mongoose.model("Product", productSchema);
// export default Product;
