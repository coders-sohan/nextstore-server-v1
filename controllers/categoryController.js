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

// exports all controllers
module.exports = {
  createCategory,
};
