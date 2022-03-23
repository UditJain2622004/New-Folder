import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
    trim: true,
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
  quantity: {
    type: Number,
    required: [true, "Quantity is required"],
  },
  price: {
    type: Number,
    required: [true, "Price is required"],
  },
  shop: {
    type: mongoose.Schema.ObjectId,
    ref: "Shop",
    required: [true, "Shop is required"],
  },
  created: {
    type: Date,
    default: Date.now,
  },
  updated: {
    type: Date,
  },
});

const Product = mongoose.model("Product", productSchema);
export default Product;
