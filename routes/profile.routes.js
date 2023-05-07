const express = require("express");
const router = express.Router();
const User = require("./../models/User.model");
const { isLoggedIn } = require("../middlewares/route-guard");

router.get("/", isLoggedIn, (req, res, next) => {
  const { currentUser } = req.session;
  User.findById(currentUser._id).then(user => {
    console.log(user);
    res.render("profile/profile", user);
  });
});

router.get("/edit", isLoggedIn, (req, res, next) => {
  const { currentUser } = req.session;
  User.findById(currentUser._id).then(user => {
    res.render("profile/edit-profile", user);
  });
});

router.post("/edit", isLoggedIn, (req, res, next) => {
  const { currentUser } = req.session;
  User.findByIdAndUpdate(currentUser._id, req.body).then(() => {
    res.redirect("/profile");
  });
});

module.exports = router;
