import mongoose from "mongoose";

const shopSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: [true, "Name is required"],
  },
  description: {
    type: String,
    trim: true,
  },
  image: {
    data: Buffer,
    contentType: String,
  },
  owner: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: [true, "Shop must have an owner"],
  },
  // product:[{
  //   type:mongoose.Schema.ObjectId,
  //   ref:"Product"
  // }],
  created: {
    type: Date,
    default: Date.now,
  },
  updated: Date,
});

const Shop = mongoose.model("Shop", shopSchema);

export default Shop;
