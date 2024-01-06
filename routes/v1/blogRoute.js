const express = require("express");
const router = express.Router();

// import controllers
const {
  createBlog,
  getAllBlogs,
  getBlogById,
  getBlogBySlug,
  updateBlog,
  deleteBlog,
} = require("../../controllers/blogController");

// all routes
router.post("/create-blog", createBlog); // admin protected route
router.get("/get-all", getAllBlogs);
router.get("/get-by-id/:id", getBlogById);
router.get("/get-by-slug/:slug", getBlogBySlug);
router.put("/update-blog/:id", updateBlog); // admin protected route
router.delete("/delete-blog/:id", deleteBlog); // admin protected route

// export router
module.exports = router;
