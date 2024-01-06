const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");

// auth middleware
const authMiddleware = asyncHandler(async (req, res, next) => {
  console.log('authMiddleware called'); // Add this line

  let token;
  // check if token exists
  if (req?.headers?.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

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
        console.log('Sending "User not found..." response'); // Add this line
        res.status(401).json({ message: "User not found..." });
      }
    } else {
      console.log('Sending "No token attached to header..." response'); // Add this line
      res.status(401).json({ message: "There is no token attached to header..." });
    }
  } catch (error) {
    console.log('Sending "Please Login again..." response'); // Add this line
    res.status(401).json({ message: "Please Login again (token is invalid or expired)" });
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
