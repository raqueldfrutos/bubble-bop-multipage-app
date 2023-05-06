const express = require("express");
const router = express.Router();

// Index Page
router.get("/", (req, res, next) => {
  res.render("index");
});

// Welcome "username" Page
router.get("/discover", (req, res, next) => {
  //console.log(req.session);
  //res.render("discover", { currentUser: req.session.currentUser });
  res.render("discover")
});

module.exports = router;
