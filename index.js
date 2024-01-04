// require all needed packages and files
const express = require("express");
const app = express();
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const dbConfig = require("./config/dbConfig");
const mainRoute = require("./routes/mainRoute");
const { notFound, errorHandler } = require("./middlewares/errorHandler");

// all config here
dotenv.config();
dbConfig();

// all use here
app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// port config
const port = process.env.PORT || 5000;

// global routes here
app.get("/", (req, res) => {
  res.json({
    message: "nextstore server is running",
  });
});

// all routes here
app.use("/api/v1", mainRoute);

// error handler
app.use(notFound);
app.use(errorHandler);

// route not found handler
app.all("*", (req, res) => {
  res.json({
    message: "route not found",
  });
});

// all listen here
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
