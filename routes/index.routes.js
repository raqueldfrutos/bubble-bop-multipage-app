const express = require("express");
const router = express.Router();

// Index Page
router.get("/", (req, res, next) => {
  res.render("index");
});

// Welcome "username" Page
router.get("/discover", (req, res, next) => {
  res.render("discover", { currentUser: req.session.currentUser });
 });


module.exports = router;

