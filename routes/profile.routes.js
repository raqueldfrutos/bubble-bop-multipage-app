const express = require("express");
const router = express.Router();
const User = require("./../models/User.model");
const {isLoggedIn}  = require("../middlewares/route-guard");


router.get("/", isLoggedIn, (req, res, next) => {
  const { currentUser } = req.session
    res.render("profile", { currentUser });
  });

module.exports = router;
