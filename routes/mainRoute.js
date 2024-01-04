const express = require("express");
const router = express.Router();

const authRoute = require("./authRoute");
const productRoute = require("./productRoute");

const allRoutes = [
  {
    path: "/auth",
    route: authRoute,
  },
  {
    path: "/product",
    route: productRoute,
  },
];

allRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

module.exports = router;
