const asyncHandler = require("express-async-handler");
const slugify = require("slugify");
const Product = require("../models/productModel");
const validateMongodbId = require("../utils/validateMongodbId");

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
    if (
      (req.query.page && req.query.limit) ||
      req.query.page ||
      req.query.limit
    ) {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const startIndex = (page - 1) * limit;

      const total = await Product.countDocuments();
      const products = await Product.find().skip(startIndex).limit(limit);

      res.json({
        success: true,
        message: "get all products successfully",
        data: products,
        meta: {
          currentPage: page,
          productsOnCurrentPage: products.length,
          totalProducts: total,
          totalPages: Math.ceil(total / limit),
        },
      });
    } else {
      const products = await Product.find();
      res.json({
        success: true,
        message: "get all products successfully",
        data: products,
        meta: {
          totalProducts: products.length,
        },
      });
    }
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

// export all controllers
module.exports = {
  createNewProduct,
  getAllProducts,
  getProductById,
  getProductBySlug,
  updateProductById,
  deleteProductById,
};
