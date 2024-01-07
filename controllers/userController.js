const User = require("../models/userModel");
const Cart = require("../models/cartModel");
const Coupon = require("../models/couponModel");
const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { generateToken } = require("../config/jwtToken");
const { generateRefreshToken } = require("../config/refreshToken");
const validateMongodbId = require("../utils/validateMongodbId");
const { sendEmail } = require("./emailController");

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
  const findUser = await User.findOne({ email: email, role: "user" });
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

// login admin controller
const loginAdmin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  // check if user exists and is an admin
  const findUser = await User.findOne({ email: email, role: "admin" });
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
        message: "Admin logged in successfully...",
        data: {
          ...findUser._doc,
          token: generateToken(findUser._id),
        },
      });
    } else {
      throw new Error("Invalid password...");
    }
  } else {
    throw new Error("Admin not found...");
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

// update a single user's password controller
const updateUserPassword = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { password } = req.body;
  validateMongodbId(id);
  try {
    const user = await User.findById(id);
    if (password) {
      user.password = password;
      user.passwordChangedAt = Date.now(); // set passwordChangedAt field for password reset
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

// forgot password controller
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email: email });
  try {
    if (user) {
      const token = await user.createPasswordResetToken();
      await user.save();
      const resetUrl = `Hi, ${user.firstname} ${user.lastname}! Please click on the link to reset your password: <a href='http://localhost:5000/api/v1/auth/forgot-pass/${token}'>Click Here</a>`;
      const data = {
        from: "nextstore0012@gmail.com",
        to: user.email,
        subject: "Reset Password Link",
        text: "Reset Password",
        html: resetUrl,
      };
      sendEmail(data);
      res.json({
        success: true,
        message: "Reset password link sent to your email...",
        data: { user, token },
      });
    } else {
      throw new Error("User not found...");
    }
  } catch (error) {
    throw new Error(error.message);
  }
});

// reset password controller
const resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpire: { $gt: Date.now() },
  });
  if (user) {
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpire = undefined;
    user.passwordChangedAt = Date.now();
    await user.save();
    res.json({
      success: true,
      message: "Password reset successfully...",
      data: user,
    });
  } else {
    throw new Error("Token is invalid or has expired...");
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

// get user wishlist controller
const getUserWishlist = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  validateMongodbId(_id);
  try {
    const findUserWishlist = await User.findById(_id).populate("wishlist");
    res.json({
      success: true,
      message: "Get user wishlist successfully...",
      data: findUserWishlist,
    });
  } catch (error) {
    throw new Error(error.message);
  }
});

// get user cart controller
const getUserCart = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  validateMongodbId(_id);
  try {
    const findUserCart = await User.findById(_id).populate({
      path: "cart",
      populate: {
        path: "products.product",
        model: "Product",
      },
    });
    res.json({
      success: true,
      message: "Get user cart successfully...",
      data: findUserCart,
    });
  } catch (error) {
    throw new Error(error.message);
  }
});

// empty user cart controller (remove from cart colloection too)
const emptyUserCart = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  validateMongodbId(_id);
  try {
    const findUserCart = await User.findById(_id);
    if (findUserCart) {
      // remove from cart collection
      await Cart.findOneAndDelete({ orderedBy: _id });
      // empty user cart
      const updatedUserCart = await User.findByIdAndUpdate(
        _id,
        {
          $set: {
            cart: [],
          },
        },
        { new: true }
      );
      res.json({
        success: true,
        message: "User cart emptied successfully...",
        data: updatedUserCart,
      });
    } else {
      throw new Error("User not found...");
    }
  } catch (error) {
    throw new Error(error.message);
  }
});

// apply coupon to user cart controller
const applyCouponToUserCart = asyncHandler(async (req, res) => {
  const { coupon } = req.body;
  const { _id } = req.user;
  validateMongodbId(_id);
  try {
    const validCoupon = await Coupon.findOne({ code: coupon });
    console.log(validCoupon);
    if (validCoupon && validCoupon.isActive) {
      const findUserCart = await Cart.findOne({ orderedBy: _id });
      if (findUserCart) {
        const totalAfterDiscount = (
          findUserCart.cartTotal -
          (findUserCart.cartTotal * validCoupon.discount) / 100
        ).toFixed(2);
        const updatedUserCart = await Cart.findOneAndUpdate(
          { orderedBy: _id },
          {
            $set: {
              totalAfterDiscount,
            },
          },
          { new: true }
        ).populate({
          path: "products.product",
          model: "Product",
        });
        res.json({
          success: true,
          message: "Coupon applied to user cart successfully...",
          data: updatedUserCart,
        });
      } else {
        throw new Error("User cart not found...");
      }
    } else {
      throw new Error("Invalid coupon, try another one...");
    }
  } catch (error) {
    throw new Error(error.message);
  }
});

// get user orders controller
const getUserOrders = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  validateMongodbId(_id);
  try {
    const findUser = await User.findById(_id).populate("orders");
    res.json({
      success: true,
      message: "Get user orders successfully...",
      data: findUser,
    });
  } catch (error) {
    throw new Error(error.message);
  }
});

// update user adderess controller
const updateUserAddress = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  validateMongodbId(_id);
  const newAddress = req.body.address;
  try {
    const findUser = await User.findById(_id);
    if (findUser) {
      findUser.address = newAddress;
      const updatedUser = await findUser.save();
      res.json({
        success: true,
        message: "User address updated successfully...",
        data: updatedUser,
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
  loginAdmin,
  handleRefreshToken,
  updateUserPassword,
  forgotPassword,
  resetPassword,
  logoutUser,
  getAllUsers,
  getSingleUser,
  deleteSingleUser,
  updateSingleUser,
  blockUser,
  unblockUser,
  getUserWishlist,
  getUserCart,
  emptyUserCart,
  applyCouponToUserCart,
  getUserOrders,
  updateUserAddress,
};
