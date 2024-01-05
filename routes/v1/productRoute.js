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
} = require("../../controllers/productController");

// all routes
router.get("/get-all", getAllProducts);
router.post("/create-product", createNewProduct); // admin protected route
router.get("/get-product-by-id/:id", getProductById);
router.get("/get-product-by-slug/:slug", getProductBySlug);
router.put("/update-product/:id", updateProductById); // admin protected route
router.delete("/delete-product/:id", deleteProductById); // admin protected route

module.exports = router;
