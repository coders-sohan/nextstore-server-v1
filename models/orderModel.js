const mongoose = require("mongoose");

// Declare the Schema of the Mongo model
var orderSchema = new mongoose.Schema(
  {
    products: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
        count: Number,
      },
    ],
    paymentIntent: {},
    orderStatus: {
      type: String,
      default: "Not Processed",
      enum: [
        "Not Processed",
        "Processing",
        "Dispatched",
        "Cancelled",
        "Completed",
        "Delivered"
      ], // enum means string objects
    },
    orderedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    paymentMethod: {
      type: String,
      default: "Cash On Delivery",
      enum: [
        "Cash On Delivery",
        "Card Payment",
        "SSlCommerz",
        "Bkash",
        "Stripe",
      ], // enum means string objects
    },
    orderTotal: {
      type: Number,
      default: 0,
    },
    totalAfterDiscount: {
      type: Number,
      default: 0,
    },
    couponApplied: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

//Export the model
module.exports = mongoose.model("Order", orderSchema);
