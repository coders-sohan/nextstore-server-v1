const Color = require("../models/colorModel");
const asyncHandler = require("express-async-handler");
const slugify = require("slugify");
const validateMongodbId = require("../utils/validateMongodbId");

// create new color controller
const createColor = asyncHandler(async (req, res) => {
  try {
    if (req.body.title) {
      req.body.slug = slugify(req.body.title, {
        remove: /[*+~.()'"!:@]/g,
        lower: true,
        trim: true,
      });
    }
    const newColor = await Color.create(req.body);
    res.json({
      success: true,
      message: "create new color successfully...",
      data: newColor,
    });
  } catch (error) {
    throw new Error(error.message);
  }
});

// get all colors controller
const getAllColors = asyncHandler(async (req, res) => {
  try {
    const colors = await Color.find({});
    res.json({
      success: true,
      message: "get all colors successfully...",
      data: colors,
      meta: {
        total: colors.length,
      },
    });
  } catch (error) {
    throw new Error(error.message);
  }
});

// get color by id controller
const getColorById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongodbId(id);
  try {
    const color = await Color.findById(id);
    if (!color) {
      throw new Error("color not found...");
    }
    res.json({
      success: true,
      message: "get color by id successfully...",
      data: color,
    });
  } catch (error) {
    throw new Error(error.message);
  }
});

// update color controller
const updateColor = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongodbId(id);
  try {
    const color = await Color.findById(id);
    if (!color) {
      throw new Error("color not found...");
    }
    const updatedColor = await Color.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true }
    );
    res.json({
      success: true,
      message: "update color successfully...",
      data: updatedColor,
    });
  } catch (error) {
    throw new Error(error.message);
  }
});

// delete color controller
const deleteColor = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongodbId(id);
  try {
    const color = await Color.findById(id);
    if (!color) {
      throw new Error("color not found...");
    }
    await Color.findByIdAndDelete(id);
    res.json({
      success: true,
      message: "delete color successfully...",
    });
  } catch (error) {
    throw new Error(error.message);
  }
});

// exports all controllers
module.exports = {
  createColor,
  getAllColors,
  getColorById,
  updateColor,
  deleteColor,
};
