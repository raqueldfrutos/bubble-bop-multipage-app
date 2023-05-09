const express = require("express");
const router = express.Router();
const User = require("./../models/User.model");
const uploader = require("../config/cloudinary.config");
const { isLoggedIn } = require("../middlewares/route-guard");

router.get("/", isLoggedIn, (req, res, next) => {
  const { currentUser } = req.session;
  User.findById(currentUser._id)
    .populate("favoriteArtists")
    .then(user => {
      res.render("profile/profile", user);
    });
});

router.get("/edit", isLoggedIn, (req, res, next) => {
  const { currentUser } = req.session;
  User.findById(currentUser._id).then(user => {
    res.render("profile/edit-profile", user);
  });
});

router.post("/edit", isLoggedIn, uploader.single("imageProfile"), (req, res, next) => {
  const { currentUser } = req.session;
  const data = { ...req.body };

  if (req.file) {
    data.imageProfile = req.file.path;
  }
  User.findByIdAndUpdate(currentUser._id, data).then(() => {
    res.redirect("/profile");
  });
});

module.exports = router;
