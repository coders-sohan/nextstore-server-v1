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
  updateBlogLikes,
  updateBlogDislikes,
  uploadBlogImages,
} = require("../../controllers/blogController");

// auth middleware will apply when project is ready for production
const { authMiddleware, isAdmin } = require("../../middlewares/authMiddleware");
// image upload middleware
const {
  uploadImage,
  blogImageResize,
} = require("../../middlewares/uploadImages");

// all routes
router.post("/create-blog", createBlog); // admin protected route
router.get("/get-all", getAllBlogs);
router.get("/get-by-id/:id", getBlogById);
router.get("/get-by-slug/:slug", getBlogBySlug);
router.put("/update-blog/:id", updateBlog); // admin protected route
router.delete("/delete-blog/:id", deleteBlog); // admin protected route
router.put("/like-blog/:id", authMiddleware, updateBlogLikes);
router.put("/dislike-blog/:id", authMiddleware, updateBlogDislikes);
// blog images upload routes
router.put(
  "/upload-images/:id",
  uploadImage.array("images", 10),
  blogImageResize,
  uploadBlogImages
);

// export router
module.exports = router;
