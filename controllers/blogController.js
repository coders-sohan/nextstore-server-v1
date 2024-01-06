const Blog = require("../models/blogModel");
const asyncHandler = require("express-async-handler");
const slugify = require("slugify");
const validateMongodbId = require("../utils/validateMongodbId");

// create new blog controller
const createBlog = asyncHandler(async (req, res) => {
  try {
    if (req.body.title) {
      req.body.slug = slugify(req.body.title, {
        remove: /[*+~.()'"!:@]/g,
        lower: true,
        trim: true,
      });
    }
    const newBlog = await Blog.create(req.body);
    res.json({
      success: true,
      message: "create new blog successfully...",
      data: newBlog,
    });
  } catch (error) {
    throw new Error(error.message);
  }
});

// get all blogs controller
const getAllBlogs = asyncHandler(async (req, res) => {
  try {
    const blogs = await Blog.find({});
    res.json({
      success: true,
      message: "get all blogs successfully...",
      data: blogs,
      meta: {
        total: blogs.length,
      },
    });
  } catch (error) {
    throw new Error(error.message);
  }
});

// get blog by id controller
const getBlogById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongodbId(id);
  try {
    const blogById = await Blog.findById(id);
    res.json({
      success: true,
      message: "get blog by id successfully...",
      data: blogById,
    });
  } catch (error) {
    throw new Error(error.message);
  }
});

// get blog by slug controller
const getBlogBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  try {
    const blogBySlug = await Blog.findOne({ slug });
    res.json({
      success: true,
      message: "get blog by slug successfully...",
      data: blogBySlug,
    });
  } catch (error) {
    throw new Error(error.message);
  }
});

// update blog controller
const updateBlog = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongodbId(id);
  try {
    const blog = await Blog.findById(id);
    if (blog) {
      const updatedBlog = await Blog.findByIdAndUpdate(id, req.body, {
        new: true,
        runValidators: true,
      });
      res.json({
        success: true,
        message: "update blog successfully...",
        data: updatedBlog,
      });
    } else {
      throw new Error("blog not found...");
    }
  } catch (error) {
    throw new Error(error.message);
  }
});

// delete blog controller
const deleteBlog = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongodbId(id);
  try {
    const blog = await Blog.findById(id);
    if (blog) {
      await Blog.findByIdAndDelete(id);
      res.json({
        success: true,
        message: "delete blog successfully...",
      });
    } else {
      throw new Error("blog not found...");
    }
  } catch (error) {
    throw new Error(error.message);
  }
});

// export all blogs controller
module.exports = {
  createBlog,
  getAllBlogs,
  getBlogById,
  getBlogBySlug,
  updateBlog,
  deleteBlog,
};
