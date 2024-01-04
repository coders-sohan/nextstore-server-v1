const express = require("express");
const router = express.Router();

const authRoute = require("./authRoute");

const allRoutes = [
  {
    path: "/auth",
    route: authRoute,
  },
];

allRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

module.exports = router;
