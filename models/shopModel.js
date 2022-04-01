import mongoose from "mongoose";
// import { filterObj } from "./../utils/functions.js";
import merge from "lodash.merge";

const shopSchema = new mongoose.Schema(
  {
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
    customProducts: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "Variation",
      },
    ],
    created: {
      type: Date,
      default: Date.now,
    },
    updated: {
      type: Date,
      select: false,
    },
  },
  {
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        delete ret.products;
        delete ret.customProducts;
        delete ret.__v;
      },
    },
    toObject: { virtuals: true },
    id: false,
  }
);

// shopSchema.pre(/^find/, function (next) {
// console.log(this);
// console.log(this.op);
// if (this.op !== "find") {
//   console.log("yes");
// }
// this.populate({ path: "owner", select: "_id email name" }).populate({
//   path: "products",
//   select: "-__v -created",
// });
// console.log("yes");
// next();
// });

shopSchema.methods.myPopulate = async function () {
  await this.populate([
    { path: "owner", select: "_id email name" },
    { path: "products", select: "-__v -created" },
    {
      path: "customProducts",
      select: "-__v -created",
      populate: { path: "product" },
    },
  ]);

  // To merge the product doc. with the variations
  const customProducts = this.customProducts.map((el) => {
    return merge(el.product, el.variation);
  });

  shopSchema.virtual("allProducts").get(function () {
    return [...this.products, ...customProducts];
  });
  return this;
};

// shopSchema.methods.allProducts = function () {
//   if (this.populated("products") || this.populated("customProducts")) {
//     shopSchema.virtual("allProducts").get(function () {
//       return [...this.products, ...this.customProducts];
//     });
//   }
// };

// shopSchema.post(/^find/, function (doc, next) {
//   let newDoc = doc.toObject();
//   newDoc = filterObj(newDoc, ["products", "customProducts"], true);
//   doc = newDoc;
//   console.log(doc);
//   next();
// });

const Shop = mongoose.model("Shop", shopSchema);

export default Shop;
