const express = require("express");
const router = express.Router();

// import all controllers
const {
  createCoupon,
  getAllCoupons,
  getCouponById,
  updateCoupon,
  deleteCoupon,
  activeInactiveCoupon,
} = require("../../controllers/couponController");

// all routes
router.post("/create-coupon", createCoupon); // admin protected route
router.get("/get-all", getAllCoupons); // admin protected route
router.get("/get-coupon-by-id/:id", getCouponById); // admin protected route
router.put("/update-coupon/:id", updateCoupon); // admin protected route
router.delete("/delete-coupon/:id", deleteCoupon); // admin protected route
router.put("/set-coupon-status/:id", activeInactiveCoupon); // admin protected route

// export routes
module.exports = router;
