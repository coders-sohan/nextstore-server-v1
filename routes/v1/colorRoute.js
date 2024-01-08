const express = require("express");
const router = express.Router();

// import all controllers
const {
  createColor,
  getAllColors,
  getColorById,
  updateColor,
  deleteColor,
} = require("../../controllers/colorController");

// auth middleware will apply when project is ready for production
const { authMiddleware, isAdmin } = require("../../middlewares/authMiddleware");

// all color routes
router.post("/create-color", createColor); // admin portected route
router.get("/get-all", getAllColors); // admin portected route
router.get("/get-color-by-id/:id", getColorById); // admin portected route
router.put("/update-color/:id", updateColor); // admin portected route
router.delete("/delete-color/:id", deleteColor); // admin portected route

// export all routes
module.exports = router;
