const bcrypt = require("bcrypt");
const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const { generateToken } = require("../config/jwtToken");
const { generateRefreshToken } = require("../config/refreshToken");
const validateMongodbId = require("../utils/validateMongodbId");

// Create user controller
const createUser = asyncHandler(async (req, res) => {
  const email = req.body.email;
  const findUser = await User.findOne({ email: email });
  try {
    if (!findUser) {
      // create a new user
      const newUser = await User.create(req.body);
      res.json({
        success: true,
        message: "User created successfully...",
        data: newUser,
      });
    } else {
      // user already exists
      throw new Error("User already exists...");
    }
  } catch (error) {
    throw new Error(error.message);
  }
});

// login user controller
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  // check if user exists
  const findUser = await User.findOne({ email: email });
  if (findUser) {
    // check if password matches
    const isMatch = await findUser.isPasswordMatched(password);
    if (isMatch) {
      // generate token
      const token = generateRefreshToken(findUser._id);
      // save token to database
      await User.findByIdAndUpdate(
        findUser._id,
        {
          $set: {
            refreshToken: token,
          },
        },
        { new: true }
      );
      // send cookie
      res.cookie("refreshToken", token, {
        httpOnly: true,
        maxAge: 2 * 60 * 60 * 1000, // 2 hours
      });
      // send response
      res.json({
        success: true,
        message: "User logged in successfully...",
        data: {
          ...findUser._doc,
          token: generateToken(findUser._id),
        },
      });
    } else {
      throw new Error("Invalid password...");
    }
  } else {
    throw new Error("User not found...");
  }
});

// handle refresh token controller
const handleRefreshToken = asyncHandler(async (req, res) => {
  const cookies = req.cookies;
  if (!cookies.refreshToken) {
    throw new Error("No refresh token in cookies...");
  }
  const refreshToken = cookies.refreshToken;
  const user = await User.findOne({ refreshToken });
  if (user) {
    jwt.verify(refreshToken, process.env.JWT_SECRET, (err, decoded) => {
      if (err || user.id !== decoded.id) {
        throw new Error("there is something wrong with refresh token...");
      }
      const accessToken = generateToken(user._id);
      res.json({
        success: true,
        message: "Get user by refresh token successfully...",
        data: user,
        accessToken,
      });
    });
  } else {
    throw new Error("No user found by refresh token in cookies...");
  }
});

// logout user controller
const logoutUser = asyncHandler(async (req, res) => {
  const cookies = req.cookies;
  if (!cookies.refreshToken) {
    throw new Error("No refresh token in cookies or expired...");
  }
  const refreshToken = cookies.refreshToken;
  const user = await User.findOne({ refreshToken });
  if (!user) {
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
    });
    return res.status(200).json({
      success: true,
      message: "User logged out successfully...",
    });
  }
  await User.findOneAndUpdate(
    { refreshToken },
    {
      $set: {
        refreshToken: "",
      },
    },
    { new: true }
  );
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: true,
  });
  return res.status(200).json({
    success: true,
    message: "User logged out successfully...",
  });
});

// get all users controller
const getAllUsers = asyncHandler(async (req, res) => {
  try {
    const users = await User.find();
    res.json({
      success: true,
      message: "Get all users successfully...",
      data: users,
      meta: {
        total: users.length,
      },
    });
  } catch (error) {
    throw new Error(error.message);
  }
});

// get a single user controller
const getSingleUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongodbId(id);
  try {
    const user = await User.findById(id);
    if (user) {
      res.json({
        success: true,
        message: "Get single user successfully...",
        data: user,
      });
    } else {
      throw new Error("User not found...");
    }
  } catch (error) {
    throw new Error(error.message);
  }
});

// delete a single user controller
const deleteSingleUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongodbId(id);
  try {
    const user = await User.findByIdAndDelete(id);
    if (user) {
      res.json({
        success: true,
        message: "User deleted successfully...",
        data: {},
      });
    } else {
      throw new Error("User not found...");
    }
  } catch (error) {
    throw new Error(error.message);
  }
});

// update a single user controller
const updateSingleUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongodbId(id);
  try {
    const updatedUser = await User.findByIdAndUpdate(
      id,
      {
        $set: {
          firstname: req.body.firstname,
          lastname: req.body.lastname,
          email: req.body.email,
          mobile: req.body.mobile,
          role: req.body.role,
          isBlocked: req.body.isBlocked,
          updatedAt: Date.now(),
        },
      },
      { new: true }
    );
    if (updatedUser) {
      res.json({
        success: true,
        message: "User updated successfully...",
        data: updatedUser,
      });
    } else {
      throw new Error("User not found...");
    }
  } catch (error) {
    throw new Error(error.message);
  }
});

// update a single user's password controller
const updateUserPassword = asyncHandler(async (req, res) => {
  try {
    const { email } = req.params;
    const { password } = req.body;
    const user = await User.findOne({ email: email });
    if (password) {
      user.password = password;
      const updatedUser = await user.save();
      res.json({
        success: true,
        message: "User password updated successfully...",
        data: updatedUser,
      });
    } else {
      res.json({
        success: false,
        message: "User password not updated...",
        data: user,
      });
    }
  } catch (error) {
    throw new Error(error.message);
  }
});

// block a single user controller
const blockUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongodbId(id);
  try {
    const block = await User.findByIdAndUpdate(
      id,
      {
        $set: {
          isBlocked: true,
          updatedAt: Date.now(),
        },
      },
      { new: true }
    );
    if (block) {
      res.json({
        success: true,
        message: "User blocked successfully...",
        data: block,
      });
    } else {
      throw new Error("User not found...");
    }
  } catch (error) {
    throw new Error(error.message);
  }
});

// unblock a single user controller
const unblockUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongodbId(id);
  try {
    const unblock = await User.findByIdAndUpdate(
      id,
      {
        $set: {
          isBlocked: false,
          updatedAt: Date.now(),
        },
      },
      { new: true }
    );
    if (unblock) {
      res.json({
        success: true,
        message: "User unblocked successfully...",
        data: unblock,
      });
    } else {
      throw new Error("User not found...");
    }
  } catch (error) {
    throw new Error(error.message);
  }
});

// export all controllers
module.exports = {
  createUser,
  loginUser,
  handleRefreshToken,
  logoutUser,
  getAllUsers,
  getSingleUser,
  deleteSingleUser,
  updateSingleUser,
  updateUserPassword,
  blockUser,
  unblockUser,
};
