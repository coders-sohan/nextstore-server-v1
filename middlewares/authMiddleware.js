const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");

// auth middleware
const authMiddleware = asyncHandler(async (req, res, next) => {
  let token;
  // check if token exists
  if (req?.headers?.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
    // verify token
    try {
      if (token) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // check if user exists
        const findUser = await User.findById(decoded.id);
        if (findUser) {
          req.user = findUser;
          next();
        } else {
          throw new Error("User not found...");
        }
      }
    } catch (error) {
      throw new Error("Please Login again (token is invalid or expired)");
    }
  } else {
    throw new Error("There is no token attached to header...");
  }
});

// isAdmin middleware
const isAdmin = asyncHandler(async (req, res, next) => {
  const { email } = req.user;
  // check if user exists
  const adminUser = await User.findOne({ email });
  if (adminUser.role !== "admin") {
    throw new Error("You are not authorized to access this route...");
  } else {
    next();
  }
});

module.exports = { authMiddleware, isAdmin };
