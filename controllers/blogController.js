const Blog = require("../models/blogModel");
const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");
const slugify = require("slugify");
const fs = require("fs");
const validateMongodbId = require("../utils/validateMongodbId");
const cloudinaryImageUpload = require("../utils/cloudinary");

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
    const blogById = await Blog.findByIdAndUpdate(
      id,
      { $inc: { views: 1 } },
      { new: true }
    )
      .populate("likes")
      .populate("dislikes");
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
    const blogBySlug = await Blog.findOneAndUpdate(
      { slug },
      { $inc: { views: 1 } },
      { new: true }
    )
      .populate("likes")
      .populate("dislikes");
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

// update blog likes controller
const updateBlogLikes = asyncHandler(async (req, res) => {
  const { id: blogId } = req.params;
  validateMongodbId(blogId);
  // Find the blog which you want to be liked
  const blog = await Blog.findById(blogId);
  // find the login user
  const loginUserId = req?.user?._id;
  // find if the user has liked the blog
  const isLiked = blog?.isLiked;
  // find if the user has disliked the blog
  const alreadyDisliked = blog?.dislikes?.find(
    (userId) => userId?.toString() === loginUserId?.toString()
  );
  // if the user has disliked the blog then remove the user from dislikes array
  if (alreadyDisliked) {
    const blog = await Blog.findByIdAndUpdate(
      blogId,
      {
        $pull: { dislikes: loginUserId },
        isDisliked: false,
      },
      { new: true }
    );
    res.json({
      success: true,
      message: "blog disliked successfully...",
      data: blog,
    });
  }
  // if the user has already liked the blog then remove the user from likes array, else add the user to array
  if (isLiked) {
    const blog = await Blog.findByIdAndUpdate(
      blogId,
      {
        $pull: { likes: loginUserId },
        isLiked: false,
      },
      { new: true }
    );
    res.json({
      success: true,
      message: "blog unliked successfully...",
      data: blog,
    });
  } else {
    const blog = await Blog.findByIdAndUpdate(
      blogId,
      {
        $push: { likes: loginUserId },
        isLiked: true,
      },
      { new: true }
    );
    res.json({
      success: true,
      message: "blog liked successfully...",
      data: blog,
    });
  }
});

// update blog dislikes controller
const updateBlogDislikes = asyncHandler(async (req, res) => {
  const { id: blogId } = req.params;
  validateMongodbId(blogId);
  // Find the blog which you want to be disliked
  const blog = await Blog.findById(blogId);
  // find the login user
  const loginUserId = req?.user?._id;
  // find if the user has disliked the blog
  const isDisliked = blog?.isDisliked;
  // find if the user has liked the blog
  const alreadyLiked = blog?.likes?.find(
    (userId) => userId?.toString() === loginUserId?.toString()
  );
  // if the user has liked the blog then remove the user from likes array
  if (alreadyLiked) {
    const blog = await Blog.findByIdAndUpdate(
      blogId,
      {
        $pull: { likes: loginUserId },
        isLiked: false,
      },
      { new: true }
    );
    res.json({
      success: true,
      message: "blog liked successfully...",
      data: blog,
    });
  }
  // if the user has already disliked the blog then remove the user from dislikes array, else add the user to array
  if (isDisliked) {
    const blog = await Blog.findByIdAndUpdate(
      blogId,
      {
        $pull: { dislikes: loginUserId },
        isDisliked: false,
      },
      { new: true }
    );
    res.json({
      success: true,
      message: "blog undisliked successfully...",
      data: blog,
    });
  } else {
    const blog = await Blog.findByIdAndUpdate(
      blogId,
      {
        $push: { dislikes: loginUserId },
        isDisliked: true,
      },
      { new: true }
    );
    res.json({
      success: true,
      message: "blog disliked successfully...",
      data: blog,
    });
  }
});

// upload blog images controller based on blog id
const uploadBlogImages = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongodbId(id);
  try {
    const uploader = async (path) =>
      await cloudinaryImageUpload(path, "images");
    const urls = [];
    const files = req.files;
    for (const file of files) {
      const { path } = file;
      const newPath = await uploader(path);
      urls.push(newPath);
      fs.unlinkSync(path);
    }
    const blog = await Blog.findById(id);
    const images = blog.images;
    urls.forEach((url) => images.push(url));
    console.log(images);
    const updatedBlog = await Blog.findByIdAndUpdate(
      id,
      { images: images },
      { new: true }
    );
    res.json({
      success: true,
      message: "Blog images uploaded successfully...",
      data: updatedBlog,
    });
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
  updateBlogLikes,
  updateBlogDislikes,
  uploadBlogImages,
};
