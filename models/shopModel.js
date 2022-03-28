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
  products: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "Product",
    },
  ],
  created: {
    type: Date,
    default: Date.now,
  },
  updated: Date,
});

// shopSchema.pre(/^find/, function (next) {
//   this.populate({ path: "owner", select: "_id email name" }).populate({
//     path: "products",
//     select: "-__v -created",
//   });
//   console.log("yes");
//   next();
// });

// shopSchema.methods.myPopulate = function (next) {
//   this.populate({ path: "owner", select: "_id email name" }).populate({
//     path: "products",
//     select: "-__v -created",
//   });
//   console.log("yes");
//   next();
// };

const Shop = mongoose.model("Shop", shopSchema);

export default Shop;
