const express = require("express");
const router = express.Router();

// import controllers
const {
  createUser,
  loginUser,
  loginAdmin,
  handleRefreshToken,
  forgotPassword,
  resetPassword,
  logoutUser,
  getAllUsers,
  getSingleUser,
  deleteSingleUser,
  updateSingleUser,
  updateUserPassword,
  blockUser,
  unblockUser,
  getUserWishlist,
} = require("../../controllers/userController");

// auth middleware will apply when project is ready for production
const { authMiddleware, isAdmin } = require("../../middlewares/authMiddleware");

// all routes
router.post("/register", createUser);
router.post("/login", loginUser);
router.get("/refresh", handleRefreshToken);
router.put("/change-pass/:id", updateUserPassword);
router.post("/forgot-pass", forgotPassword);
router.put("/reset-pass/:token", resetPassword);
router.get("/logout", logoutUser);
router.get("/all-users", getAllUsers); // admin protected route
router.get("/user/:id", getSingleUser); // admin protected route
router.delete("/user/:id", deleteSingleUser); // admin protected route
router.put("/user/:id", updateSingleUser);
router.put("/block-user/:id", blockUser); // admin protected route
router.put("/unblock-user/:id", unblockUser); // admin protected route
// admin login route
router.post("/admin-login", loginAdmin);
// user ecommerce related routes
router.get("/wishlist", getUserWishlist);

// export router
module.exports = router;
