const express = require("express");
const router = express.Router();

// import all controllers
const {
  createBrand,
  getAllBrands,
  getBrandById,
  getbrandBySlug,
  updateBrand,
  deleteBrand,
} = require("../../controllers/brandController");

// auth middleware will apply when project is ready for production
const { authMiddleware, isAdmin } = require("../../middlewares/authMiddleware");

// create new brand route
router.post("/create-brand", createBrand); // admin portected route
router.get("/get-all", getAllBrands);
router.get("/get-brand-by-id/:id", getBrandById);
router.get("/get-brand-by-slug/:slug", getbrandBySlug);
router.put("/update-brand/:id", updateBrand); // admin portected route
router.delete("/delete-brand/:id", deleteBrand); // admin portected route

// export all routes
module.exports = router;
