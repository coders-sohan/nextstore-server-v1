const mongoose = require("mongoose");

var productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    brand: {
      type: String,
      required: true,
    },
    // category: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "Category",
    // },
    category: {
      type: String,
      required: true,
    },
    subCategory: {
      type: String,
      required: true,
    },
    images: [
      {
        type: String,
      },
    ],
    quantity: {
      type: Number,
      required: true,
    },
    sold: {
      type: Number,
      default: 0,
      // select: false, // hide from client but can be used in backend for admin protected routes
    },
    offer: {
      type: Number,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    reviews: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        review: String,
      },
    ],
    // variants: [
    //   {
    //     color: {
    //       type: String,
    //       enum: ["white", "black", "silver", "blue", "red"],
    //     },
    //     size: String,
    //     quantity: Number,
    //     sku: String,
    //     price: Number,
    //     images: [String],
    //   },
    // ],
    color: {
      type: String,
      enum: ["white", "black", "silver", "blue", "red"],
    },
    ratings: [
      {
        star: Number,
        postedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      },
    ],
    // weight: {
    //   type: Number,
    // },
    // dimensions: {
    //   width: Number,
    //   height: Number,
    //   depth: Number,
    // },
    // seo: {
    //   metaTitle: String,
    //   metaDescription: String,
    // },
  },
  { timestamps: true }
);

//Export the model
module.exports = mongoose.model("Product", productSchema);
