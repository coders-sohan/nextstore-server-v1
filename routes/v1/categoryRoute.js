const express = require("express");
const router = express.Router();

// import all controllers
const {
  createCategory,
  getAllCategories,
  getCategoryById,
  getCategoryBySlug,
  updateCategory,
  deleteCategory,
} = require("../../controllers/categoryController");

// auth middleware will apply when project is ready for production
const { authMiddleware, isAdmin } = require("../../middlewares/authMiddleware");

// create new category route
router.post("/create-category", createCategory); // admin portected route
router.get("/get-all", getAllCategories);
router.get("/get-category-by-id/:id", getCategoryById);
router.get("/get-category-by-slug/:slug", getCategoryBySlug);
router.put("/update-category/:id", updateCategory); // admin portected route
router.delete("/delete-category/:id", deleteCategory); // admin portected route

// export all routes
module.exports = router;
