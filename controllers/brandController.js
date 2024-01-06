const Brand = require("../models/brandModel");
const asyncHandler = require("express-async-handler");
const slugify = require("slugify");
const validateMongodbId = require("../utils/validateMongodbId");

// create new brand controller
const createBrand = asyncHandler(async (req, res) => {
  try {
    if (req.body.title) {
      req.body.slug = slugify(req.body.title, {
        remove: /[*+~.()'"!:@]/g,
        lower: true,
        trim: true,
      });
    }
    const newBrand = await Brand.create(req.body);
    res.json({
      success: true,
      message: "create new brand successfully...",
      data: newBrand,
    });
  } catch (error) {
    throw new Error(error.message);
  }
});

// get all brands controller
const getAllBrands = asyncHandler(async (req, res) => {
  try {
    const brands = await Brand.find({});
    res.json({
      success: true,
      message: "get all brands successfully...",
      data: brands,
      meta: {
        total: brands.length,
      },
    });
  } catch (error) {
    throw new Error(error.message);
  }
});

// get brand by id controller
const getBrandById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongodbId(id);
  try {
    const brand = await Brand.findById(id);
    if (!brand) {
      throw new Error("brand not found...");
    }
    res.json({
      success: true,
      message: "get brand by id successfully...",
      data: brand,
    });
  } catch (error) {
    throw new Error(error.message);
  }
});

// get brand by slug controller
const getbrandBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  try {
    const brand = await Brand.findOne({ slug });
    if (!brand) {
      throw new Error("brand not found...");
    }
    res.json({
      success: true,
      message: "get brand by slug successfully...",
      data: brand,
    });
  } catch (error) {
    throw new Error(error.message);
  }
});

// update brand controller
const updateBrand = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongodbId(id);
  try {
    const brand = await Brand.findById(id);
    if (!brand) {
      throw new Error("brand not found...");
    }
    const updatedBrand = await Brand.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true }
    );
    res.json({
      success: true,
      message: "update brand successfully...",
      data: updatedBrand,
    });
  } catch (error) {
    throw new Error(error.message);
  }
});

// delete brand controller
const deleteBrand = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongodbId(id);
  try {
    const brand = await Brand.findById(id);
    if (!brand) {
      throw new Error("brand not found...");
    }
    await Brand.findByIdAndDelete(id);
    res.json({
      success: true,
      message: "delete brand successfully...",
    });
  } catch (error) {
    throw new Error(error.message);
  }
});

// exports all controllers
module.exports = {
  createBrand,
  getAllBrands,
  getBrandById,
  getbrandBySlug,
  updateBrand,
  deleteBrand,
};
