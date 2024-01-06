const express = require("express");
const router = express.Router();

// import controllers
const {
  createBlog,
  getAllBlogs,
  getBlogById,
  getBlogBySlug,
} = require("../../controllers/blogController");

// all routes
router.post("/create-blog", createBlog);
router.get("/get-all", getAllBlogs);
router.get("/get-by-id/:id", getBlogById);
router.get("/get-by-slug/:slug", getBlogBySlug);

// export router
module.exports = router;
