const Product = require("../models/productModel");
const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");
const slugify = require("slugify");
const fs = require("fs");
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
    console.log(images);
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
  addRating,
  uploadProductImages,
};
