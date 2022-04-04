import merge from "lodash.merge";
import clonedeep from "lodash.clonedeep";

// export const addProductToMyShop = async (req, res, next) => {
//   try {
//     const product = await Product.findById(req.body.products[0]);

//     // Check if the product has been changed
//     const difference = checkVariations(product, req.body.details);

//     // When there is no change in product
//     if (isEmpty(difference)) {
//       const shop = await Shop.findByIdAndUpdate(
//         req.shop._id,
//         { $addToSet: { products: req.body.products } },
//         { runValidators: true, new: true }
//       );

//       // When default product is changed
//     } else {
//       const shop = await Shop.findByIdAndUpdate(
//         req.shop._id,
//         { $addToSet: { customProducts: req.body.products } },
//         { runValidators: true, new: true }
//       );
//       const variation = await Variation.create({
//         shop: req.shop._id,
//         product: product._id,
//         variation: difference,
//       });
//       console.log(variation);
//     }

//     //  Adding shopId into shops field of products
//     await Product.updateOne(
//       { _id: product._id },
//       { $addToSet: { shops: req.shop._id } }
//     );

//     // const shop = await Shop.findByIdAndUpdate(                                     // ADD MULTIPLE ITEMS TO ARRAY
//     //   req.shop._id,
//     //   { $addToSet: { products: { $each: req.body.products } } },
//     //   { runValidators: true, new: true }
//     // );
//     // addShopToProducts(req.body.products, req.shop._id);
//     // sendSuccessResponse(res, 200, shop, "shop");
//     sendSuccessResponse(res, 200, "World", "Hello");
//   } catch (err) {
//     next(err);
//   }
// };

// export const addProductToMyShop2 = async (req, res, next) => {
//   try {
//     let shop;
//     // req.body.products.forEach(function (el, i) {
//     //   console.log(el, i);
//     // });
//     // for (const [i, el] of req.body.products.entries()) {

//     // }
//     req.body.products.forEach(async function (el, i) {
//       const product = await Product.findById(el);
//       // Check if the product has been changed
//       const difference = checkVariations(product, req.body.details[i]);

//       // When there is no change in product
//       if (isEmpty(difference)) {
//         shop = await Shop.findByIdAndUpdate(
//           req.shop._id,
//           { $addToSet: { products: el } },
//           { runValidators: true, new: true }
//         );

//         // When default product is changed
//       } else {
//         shop = await Shop.findByIdAndUpdate(
//           req.shop._id,
//           { $addToSet: { customProducts: el } },
//           { runValidators: true, new: true }
//         );
//         const variation = await Variation.create({
//           shop: req.shop._id,
//           product: product._id,
//           variation: difference,
//         });
//         // console.log(variation);
//       }

//       //  Adding shopId into shops field of products
//       await Product.updateOne(
//         { _id: product._id },
//         { $addToSet: { shops: req.shop._id } }
//       );
//     });
//     console.log(shop);
//     sendSuccessResponse(res, 200, req.shop, "shop");

//     // const shop = await Shop.findByIdAndUpdate(                                     // ADD MULTIPLE ITEMS TO ARRAY
//     //   req.shop._id,
//     //   { $addToSet: { products: { $each: req.body.products } } },
//     //   { runValidators: true, new: true }
//     // );
//     // addShopToProducts(req.body.products, req.shop._id);
//     // sendSuccessResponse(res, 200, shop, "shop");
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
