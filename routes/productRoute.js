const express = require("express");
const router = express.Router();

// import controllers
const {
  getAllProducts,
  createNewProduct,
  getProductById,
  getProductBySlug,
} = require("../controllers/productController");

// all routes
router.get("/get-all", getAllProducts);
router.post("/create-product", createNewProduct);
router.get("/get-product-by-id/:id", getProductById);
router.get("/get-product-by-slug/:slug", getProductBySlug);

module.exports = router;
