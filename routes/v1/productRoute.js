const express = require("express");
const router = express.Router();

// import controllers
const {
  getAllProducts,
  createNewProduct,
  getProductById,
  getProductBySlug,
  updateProductById,
  deleteProductById,
  filterProducts,
  addToWishlist,
  addRating,
} = require("../../controllers/productController");

// auth middleware will apply when project is ready for production
const { authMiddleware, isAdmin } = require("../../middlewares/authMiddleware");

// all routes
router.get("/get-all", getAllProducts);
router.post("/create-product", createNewProduct); // admin protected route
router.get("/get-product-by-id/:id", getProductById);
router.get("/get-product-by-slug/:slug", getProductBySlug);
router.put("/update-product/:id", updateProductById); // admin protected route
router.delete("/delete-product/:id", deleteProductById); // admin protected route
router.get("/filter-products", filterProducts);
// dynamic control routes based on user
router.put("/add-to-wishlist", authMiddleware, addToWishlist);
router.put("/add-rating", authMiddleware, addRating);

// export router
module.exports = router;
