const express = require("express");
const router = express.Router();
const { isLoggedIn } = require("../middlewares/route-guard");

// Index Page
router.get("/", (req, res, next) => {
  res.render("index");
});

// Welcome "username" Page
router.get("/discover", isLoggedIn, (req, res, next) => {
  res.render("discover", { currentUser: req.session.currentUser });
 });

 router.get("/trendingmusic", (req, res, next) => {
  res.render("trendingmusic", { currentUser: req.session.currentUser });
 });


module.exports = router;

