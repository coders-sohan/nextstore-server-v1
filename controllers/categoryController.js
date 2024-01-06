const Category = require("../models/categoryModel");
const asyncHandler = require("express-async-handler");
const slugify = require("slugify");
const validateMongodbId = require("../utils/validateMongodbId");

// create new category controller
const createCategory = asyncHandler(async (req, res) => {
  try {
    if (req.body.title) {
      req.body.slug = slugify(req.body.title, {
        remove: /[*+~.()'"!:@]/g,
        lower: true,
        trim: true,
      });
    }
    const newCategory = await Category.create(req.body);
    res.json({
      success: true,
      message: "create new category successfully...",
      data: newCategory,
    });
  } catch (error) {
    throw new Error(error.message);
  }
});

// get all categories controller
const getAllCategories = asyncHandler(async (req, res) => {
  try {
    const categories = await Category.find({});
    res.json({
      success: true,
      message: "get all categories successfully...",
      data: categories,
      meta: {
        total: categories.length,
      },
    });
  } catch (error) {
    throw new Error(error.message);
  }
});

// get category by id controller
const getCategoryById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongodbId(id);
  try {
    const category = await Category.findById(id);
    if (!category) {
      throw new Error("category not found...");
    }
    res.json({
      success: true,
      message: "get category by id successfully...",
      data: category,
    });
  } catch (error) {
    throw new Error(error.message);
  }
});

// get category by slug controller
const getCategoryBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  try {
    const category = await Category.findOne({ slug });
    if (!category) {
      throw new Error("category not found...");
    }
    res.json({
      success: true,
      message: "get category by slug successfully...",
      data: category,
    });
  } catch (error) {
    throw new Error(error.message);
  }
});

// update category controller
const updateCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongodbId(id);
  try {
    const category = await Category.findById(id);
    if (!category) {
      throw new Error("category not found...");
    }
    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true }
    );
    res.json({
      success: true,
      message: "update category successfully...",
      data: updatedCategory,
    });
  } catch (error) {
    throw new Error(error.message);
  }
});

// delete category controller
const deleteCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongodbId(id);
  try {
    const category = await Category.findById(id);
    if (!category) {
      throw new Error("category not found...");
    }
    await Category.findByIdAndDelete(id);
    res.json({
      success: true,
      message: "delete category successfully...",
    });
  } catch (error) {
    throw new Error(error.message);
  }
});

// exports all controllers
module.exports = {
  createCategory,
  getAllCategories,
  getCategoryById,
  getCategoryBySlug,
  updateCategory,
  deleteCategory,
};
