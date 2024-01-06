const express = require("express");
const router = express.Router();

const authRoute = require("./v1/authRoute");
const productRoute = require("./v1/productRoute");
const blogRoute = require("./v1/blogRoute");

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
];

allRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

module.exports = router;
