const Product = require("../models/productModel");
const User = require("../models/userModel");
const Cart = require("../models/cartModel");
const Order = require("../models/orderModel");
const asyncHandler = require("express-async-handler");
const slugify = require("slugify");
const fs = require("fs");
const uniqid = require("uniqid");
const validateMongodbId = require("../utils/validateMongodbId");
const cloudinaryImageUpload = require("../utils/cloudinary");

// create new product controller
const createNewProduct = asyncHandler(async (req, res) => {
  try {
    if (req.body.title) {
      req.body.slug = slugify(req.body.title, {
        remove: /[*+~.()'"!:@]/g,
        lower: true,
        trim: true,
      });
    }
    const newProduct = await Product.create(req.body);
    res.json({
      success: true,
      message: "create new product successfully",
      data: newProduct,
    });
  } catch (error) {
    throw new Error(error.message);
  }
});

// get all products using page number and limit or without those controller
const getAllProducts = asyncHandler(async (req, res) => {
  try {
    const products = await Product.find();
    res.json({
      success: true,
      message: "get all products successfully",
      data: products,
      meta: {
        totalProducts: products.length,
      },
    });
  } catch (error) {
    throw new Error(error.message);
  }
});

// get a single product by id controller
const getProductById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongodbId(id);
  try {
    const productById = await Product.findById(id);
    if (productById) {
      res.json({
        success: true,
        message: "get single product by id successfully...",
        data: productById,
      });
    } else {
      throw new Error("Product not found or maybe removed...");
    }
  } catch (error) {
    throw new Error(error.message);
  }
});

// get a single product by slug controller
const getProductBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  try {
    const productBySlug = await Product.findOne({ slug });
    if (productBySlug) {
      res.json({
        success: true,
        message: "get single product by slug successfully...",
        data: productBySlug,
      });
    } else {
      throw new Error("Product not found or maybe removed...");
    }
  } catch (error) {
    throw new Error(error.message);
  }
});

// update a single product by id controller
const updateProductById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongodbId(id);
  try {
    const productById = await Product.findById(id);
    if (productById) {
      // Remove the slug field from the request body
      const updateData = { ...req.body };
      delete updateData.slug;
      // update product
      const updatedProduct = await Product.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      });
      res.json({
        success: true,
        message: "update single product by id successfully...",
        data: updatedProduct,
      });
    } else {
      throw new Error("Product not found or maybe removed...");
    }
  } catch (error) {
    throw new Error(error.message);
  }
});

// delete a product controller
const deleteProductById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongodbId(id);
  try {
    const productById = await Product.findById(id);
    if (productById) {
      await Product.findByIdAndDelete(id);
      res.json({
        success: true,
        message: "delete single product by id successfully...",
        data: {},
      });
    } else {
      throw new Error("Product not found or maybe removed...");
    }
  } catch (error) {
    throw new Error(error.message);
  }
});

// filter products by multiple condition controller
const filterProducts = asyncHandler(async (req, res) => {
  try {
    // filtering products
    const queryObj = { ...req.query };
    const excludedFields = ["page", "sort", "limit", "fields"];
    excludedFields.forEach((el) => delete queryObj[el]);

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    let query = Product.find(JSON.parse(queryStr));

    // sorting products
    if (req.query.sort && typeof req.query.sort === "string") {
      const sortBy = req.query.sort.split(",").join(" ");
      query.sort(sortBy);
    } else {
      query.sort("-createdAt");
    }

    // field limiting
    if (req.query.fields) {
      const fields = req.query.fields.split(",").join(" ");
      query.select(fields);
    } else {
      query.select("-__v");
    }

    // pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startIndex = (page - 1) * limit;
    query.skip(startIndex).limit(limit);

    let total;

    if (req.query.page || req.query.limit) {
      total = await Product.countDocuments();
      if (startIndex >= total) {
        throw new Error("This page does not exist...");
      }
    }

    const getAllFilteredProduct = await query;

    // Create the response object
    let response = {
      success: true,
      message: "filter products successfully...",
      data: getAllFilteredProduct,
      meta: {
        totalProducts: getAllFilteredProduct.length,
      },
    };

    // Conditionally add the pagination meta data
    if (req.query.page || req.query.limit) {
      response.meta = {
        currentPage: page,
        productsOnCurrentPage: getAllFilteredProduct.length,
        totalProducts: total,
        totalPages: Math.ceil(total / limit),
      };
    }

    res.json(response);
  } catch (error) {
    throw new Error(error.message);
  }
});

// add to wishlist controller based on user id
const addToWishlist = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { productId } = req.body;
  validateMongodbId(productId);
  try {
    const user = await User.findById(_id);
    const alreadyAdded = user.wishlist.find(
      (id) => id.toString() === productId
    );
    if (alreadyAdded) {
      let user = await User.findByIdAndUpdate(
        _id,
        { $pull: { wishlist: productId } },
        { new: true }
      );
      res.json({
        success: true,
        message: "Product removed from wishlist successfully...",
        data: user,
      });
    } else {
      let user = await User.findByIdAndUpdate(
        _id,
        { $push: { wishlist: productId } },
        { new: true }
      );
      res.json({
        success: true,
        message: "Product added to wishlist successfully...",
        data: user,
      });
    }
  } catch (error) {
    throw new Error(error.message);
  }
});

// add to cart controller based on user id
const addToCart = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { productId, count } = req.body;
  validateMongodbId(productId);
  try {
    const product = await Product.findById(productId);
    if (product) {
      let cart = await Cart.findOne({ orderedBy: _id });
      // Check if cart exists
      if (cart) {
        let itemIndex = cart.products.findIndex(
          (p) => p.product._id.toString() === productId
        );
        if (itemIndex > -1) {
          let productItem = cart.products[itemIndex];
          productItem.count = count;
          cart.products[itemIndex] = productItem;
        } else {
          cart.products.push({
            product: productId,
            count: count,
            price: product.price,
          });
        }
        // Calculate the cart total
        cart.cartTotal = cart.products.reduce((total, product) => {
          let price = Number(product.price) || 0;
          let count = Number(product.count) || 0;
          return total + price * count;
        }, 0);
        cart = await cart.save();

        // Update the user's cart
        let user = await User.findByIdAndUpdate(
          _id,
          { cart: cart._id },
          { new: true }
        );

        return res.json({
          success: true,
          message: "Product added to cart successfully...",
          data: { cart, user },
        });
      } else {
        const newCart = await Cart.create({
          orderedBy: _id,
          products: [
            {
              product: productId,
              count: count,
              price: product.price,
            },
          ],
          cartTotal: (product.price * count).toFixed(2),
        });

        // Update the user's cart
        let user = await User.findByIdAndUpdate(
          _id,
          { cart: newCart._id },
          { new: true }
        );

        return res.json({
          success: true,
          message: "Product added to cart successfully...",
          data: { cart: newCart, user },
        });
      }
    } else {
      throw new Error("Product not found or maybe removed...");
    }
  } catch (error) {
    throw new Error(error.message);
  }
});

// order product controller based on user id and reduce product quantity after order
const orderProduct = asyncHandler(async (req, res) => {
  const { paymentMethod, couponApplied } = req.body;
  const { _id } = req.user;
  validateMongodbId(_id);
  try {
    if (!paymentMethod) {
      throw new Error("Payment method is required...");
    }
    const userCart = await Cart.findOne({ orderedBy: _id });
    let finalAmount = 0;
    if (userCart) {
      finalAmount = userCart.cartTotal;
    } else {
      throw new Error("Cart not found or maybe removed...");
    }
    if (couponApplied && userCart.totalAfterDiscount) {
      finalAmount = userCart.totalAfterDiscount;
    } else {
      finalAmount = userCart.cartTotal;
    }
    const newOrder = await Order.create({
      products: userCart.products,
      paymentIntent: {
        id: uniqid("order-"),
        amount: finalAmount,
        currency: "usd",
        paymentMethod: paymentMethod,
        status: "Not Processed",
        createdAt: Date(),
      },
      orderedBy: _id,
      orderStatus: "Not Processed",
      paymentMethod: paymentMethod,
      orderTotal: userCart.cartTotal,
      totalAfterDiscount: userCart.totalAfterDiscount,
      couponApplied: couponApplied,
    });
    // Reduce the quantity, increase the sold
    let bulkOption = userCart.products.map((item) => {
      return {
        updateOne: {
          filter: { _id: item.product._id },
          update: {
            $inc: {
              quantity: -item.count,
              sold: +item.count,
            },
          },
        },
      };
    });
    // Update the product quantity and sold
    const updatedProduct = await Product.bulkWrite(bulkOption, {});
    // Remove the cart
    await Cart.findOneAndDelete({ orderedBy: _id });
    // Update the user's cart
    const updatedUser = await User.findByIdAndUpdate(
      _id,
      { cart: [] }, // or { cart: null }
      { new: true }
    );
    // update the user's order
    await User.findByIdAndUpdate(
      _id,
      { $push: { orders: newOrder._id } },
      { new: true }
    );
    res.json({
      success: true,
      message: "Order placed successfully...",
      data: {
        newOrder,
        updatedProduct,
        updatedUser,
      },
    });
  } catch (error) {
    throw new Error(error.message);
  }
});

// get all orders controller
const getAllOrders = asyncHandler(async (req, res) => {
  try {
    const orders = await Order.find({})
      .sort("-createdAt")
      .populate("products.product");
    res.json({
      success: true,
      message: "get all orders successfully...",
      data: orders,
      meta: {
        totalOrders: orders.length,
      },
    });
  } catch (error) {
    throw new Error(error.message);
  }
});

// add rating controller based on user id
const addRating = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { productId, star, review } = req.body;
  validateMongodbId(productId);
  let message;
  let data;
  try {
    const product = await Product.findById(productId);
    const alreadyRated = product.ratings.find(
      (userId) => userId.postedBy.toString() === _id.toString()
    );
    if (alreadyRated) {
      await Product.updateOne(
        { ratings: { $elemMatch: alreadyRated } },
        {
          $set: {
            "ratings.$.star": star,
            "ratings.$.review": review,
          },
        },
        { new: true }
      );
      message = "Product rating updated successfully...";
    } else {
      data = await Product.findByIdAndUpdate(
        productId,
        {
          $push: {
            ratings: {
              star: star,
              review: review,
              postedBy: _id,
            },
          },
        },
        { new: true }
      );
      message = "Product rated successfully...";
    }
    const getAllRatings = await Product.findById(productId);
    let totalRating = getAllRatings.ratings.length;
    let ratingSum = getAllRatings.ratings
      .map((item) => item.star)
      .reduce((prev, curr) => prev + curr, 0);
    let averageRating = ratingSum / totalRating;
    data = await Product.findByIdAndUpdate(
      productId,
      {
        totalRating: averageRating.toFixed(2),
      },
      { new: true }
    );
    message = "Product total rating updated successfully...";
    res.json({
      success: true,
      message: message,
      data: data,
    });
  } catch (error) {
    throw new Error(error.message);
  }
});

// upload product images controller based on product id
const uploadProductImages = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongodbId(id);
  try {
    const uploader = async (path) =>
      await cloudinaryImageUpload(path, "images");
    const urls = [];
    const files = req.files;
    for (const file of files) {
      const { path } = file;
      const newPath = await uploader(path);
      urls.push(newPath);
      fs.unlinkSync(path);
    }
    const product = await Product.findById(id);
    const images = product.images;
    urls.forEach((url) => images.push(url));
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { images: images },
      { new: true }
    );
    res.json({
      success: true,
      message: "Product images uploaded successfully...",
      data: updatedProduct,
    });
  } catch (error) {
    throw new Error(error.message);
  }
});

// export all controllers
module.exports = {
  createNewProduct,
  getAllProducts,
  getProductById,
  getProductBySlug,
  updateProductById,
  deleteProductById,
  filterProducts,
  addToWishlist,
  addToCart,
  orderProduct,
  getAllOrders,
  addRating,
  uploadProductImages,
};
