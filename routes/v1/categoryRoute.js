const express = require("express");
const router = express.Router();

// import all controllers
const { createCategory } = require("../../controllers/categoryController");

// auth middleware will apply when project is ready for production
const { authMiddleware, isAdmin } = require("../../middlewares/authMiddleware");

// create new category route
router.post("/create-category", createCategory);

// export all routes
module.exports = router;
