const express = require("express");
const router = express.Router();

const authRoute = require("./v1/authRoute");
const productRoute = require("./v1/productRoute");
const blogRoute = require("./v1/blogRoute");
const categoryRoute = require("./v1/categoryRoute");
const blogCategoryRoute = require("./v1/blogCategoryRoute");
const brandRoute = require("./v1/brandRoute");

const allRoutes = [
  {
    path: "/auth",
    route: authRoute,
  },
  {
    path: "/product",
    route: productRoute,
  },
  {
    path: "/blog",
    route: blogRoute,
  },
  {
    path: "/category",
    route: categoryRoute,
  },
  {
    path: "/blog-category",
    route: blogCategoryRoute,
  },
  {
    path: "/brand",
    route: brandRoute,
  },
];

allRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

module.exports = router;
