const mongoose = require("mongoose");

// Declare the Schema of the Mongo model
var couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
    },
    discount: {
      type: Number,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    expiry: {
      type: Date,
      required: true,
      default: () => Date.now() + 7 * 24 * 60 * 60 * 1000,
    },
  },
  {
    timestamps: true,
  }
);

//Export the model
module.exports = mongoose.model("Coupon", couponSchema);
