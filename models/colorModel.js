const mongoose = require("mongoose");

// Declare the Schema of the Mongo model
var colorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    colorCode: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

//Export the model
module.exports = mongoose.model("Color", colorSchema);
