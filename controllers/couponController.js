const Coupon = require("../models/couponModel");
const asyncHandler = require("express-async-handler");
const validateMongodbId = require("../utils/validateMongodbId");

// create new coupon controller
const createCoupon = asyncHandler(async (req, res) => {
  try {
    const newCoupon = await Coupon.create(req.body);
    res.json({
      success: true,
      message: "create new coupon successfully...",
      data: newCoupon,
    });
  } catch (error) {
    throw new Error(error.message);
  }
});

// get all coupons controller
const getAllCoupons = asyncHandler(async (req, res) => {
  try {
    const coupons = await Coupon.find({});
    res.json({
      success: true,
      message: "get all coupons successfully...",
      data: coupons,
      meta: {
        total: coupons.length,
      },
    });
  } catch (error) {
    throw new Error(error.message);
  }
});

// get coupon by id controller
const getCouponById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongodbId(id);
  try {
    const coupon = await Coupon.findById(id);
    res.json({
      success: true,
      message: "get coupon by id successfully...",
      data: coupon,
    });
  } catch (error) {
    throw new Error(error.message);
  }
});

// update coupon controller
const updateCoupon = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongodbId(id);
  try {
    const updatedCoupon = await Coupon.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true }
    );
    res.json({
      success: true,
      message: "update coupon successfully...",
      data: updatedCoupon,
    });
  } catch (error) {
    throw new Error(error.message);
  }
});

// delete coupon controller
const deleteCoupon = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongodbId(id);
  try {
    await Coupon.findByIdAndDelete(id);
    res.json({
      success: true,
      message: "delete coupon successfully...",
    });
  } catch (error) {
    throw new Error(error.message);
  }
});

// active and inactive coupon controller
const activeInactiveCoupon = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongodbId(id);
  try {
    const coupon = await Coupon.findById(id);
    coupon.isActive = !coupon.isActive;
    await coupon.save();
    res.json({
      success: true,
      message: "active and inactive coupon successfully...",
      data: coupon,
    });
  } catch (error) {
    throw new Error(error.message);
  }
});

// export all controllers
module.exports = {
  createCoupon,
  getAllCoupons,
  getCouponById,
  updateCoupon,
  deleteCoupon,
  activeInactiveCoupon,
};
