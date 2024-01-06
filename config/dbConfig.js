const { default: mongoose } = require("mongoose");
require("dotenv").config();

const dbConfig = () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("Please define the MONGO_URI environment variable...");
    process.exit(1);
  }
  try {
    mongoose.connect(uri);
    console.log("MongoDB connected successfully...");
  } catch (err) {
    console.log(err);
  }
};

module.exports = dbConfig;
