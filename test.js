import merge from "lodash.merge";
import clonedeep from "lodash.clonedeep";

// export const addProductToMyShop = async (req, res, next) => {
//   try {
//     let shop;

//     for (const [i, el] of req.body.products.entries()) {
//       const product = await Product.findById(el);

//       // Check if the product has been changed
//       const difference = checkVariations(product, req.body.details[i]);
//       console.log(difference);

//       //   // When there is no change in product
//         if (isEmpty(difference)) {
//           shop = await Shop.findByIdAndUpdate(
//             req.shop._id,
//             { $addToSet: { products: el } },
//             { runValidators: true, new: true }
//           );

//           // When default product is changed
//         } else {
//           const variation = await Variation.create({
//             shop: req.shop._id,
//             product: product._id,
//             variation: difference,
//           });
//           shop = await Shop.findByIdAndUpdate(
//             req.shop._id,
//             { $addToSet: { customProducts: variation._id } },
//             { runValidators: true, new: true }
//           );

//           // console.log(variation);
//         }

//         //  Adding shopId into shops field of products
//         await Product.updateOne(
//           { _id: product._id },
//           { $addToSet: { shops: req.shop._id } }
//         );
//     }
//     await shop.myPopulate();
//     sendSuccessResponse(res, 200, shop, "shop");
//   } catch (err) {
//     next(err);
//   }
// };

// export const removeProductsFromMyShop = async (req, res, next) => {
//   try {
//     let shop;
//     //prettier-ignore
//     for(const el of req.body.products){
//       if (req.shop.products.includes(mongoose.Types.ObjectId(el))) {
//         shop = await Shop.findByIdAndUpdate(
//           req.shop._id,
//           { $pull: { products: el } },
//           {runValidators: true, new: true}
//           );
//         await Product.updateOne({ _id: el }, { $pull: { shops: req.shop._id } })

//       //prettier-ignore
//       } else if (await Variation.findOne({shop:req.shop._id,product:el})) {
//         const variation = await Variation.findOne({shop:req.shop._id,product:el})
//         shop = await Shop.findByIdAndUpdate(
//           req.shop._id,
//           { $pull: { customProducts: variation._id } },
//           { runValidators: true, new: true }
//         );
//       await Variation.deleteOne({shop:req.shop._id,product:el});
//       await Product.updateOne({ _id:el }, { $pull: { shops: req.shop._id } })

//       }
//     }

//     //  IF PRODUCT NOT FOUND IN SHOP (TO SEND AN ERROR USE THIS OR JUST IGNORE THE PRODUCT)
//     // else{
//     //   return next(new appError("You don't have this product"),400)
//     // }
//     // const product = await Shop.findByIdAndUpdate(req.shop._id)

//     await shop.myPopulate();
//     sendSuccessResponse(res, 200, shop, "shop");
//   } catch (err) {
//     next(err);
//   }
// };

const details = {
  price: 500,
  quantity: 500,
};

const v = [
  {
    shop: "622f17998c1f2f9da51129e6",
    product: "6232ef529963868cf021f02c",
    variation: { quantity: 1000, price: 2200 },
    __v: 0,
  },
  {
    shop: "622f17998c1f2f9da51129e6",
    product: "6232ef529963868cf021f02c",
    variation: { price: 10 },
    __v: 0,
  },
  {
    shop: "622f17998c1f2f9da51129e6",
    product: "6232ef529963868cf021f02c",
    variation: { quantity: 1000, price: 2000 },
    __v: 0,
  },
  {
    shop: "622f17998c1f2f9da51129e6",
    product: "6232ef529963868cf021f02c",
    variation: { quantity: 1000, price: 1800 },
    __v: 0,
  },
  {
    shop: "622f17998c1f2f9da51129e6",
    product: "6232ef529963868cf021f02c",
    variation: { quantity: 234 },
    __v: 0,
  },
];

const product = v.map((el) => {
  // const newDetails = merge(details, el.variation);
  // console.log(newDetails);
  let copy = clonedeep(details);
  // console.log(copy);
  // console.log(details);
  merge(copy, el.variation);
  console.log(copy);
  return { shop: el.shop, details: copy };
});

console.log(product);
