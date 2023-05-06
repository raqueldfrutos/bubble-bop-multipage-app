const express = require("express");
const router = express.Router();

/* GET home page */
router.get("/", (req, res, next) => {
  res.render("index");
});

router.get("/auth/login", (req, res, next)=>{
  res.render("auth/login");
});

router.get("/auth/signup", (req, res, next)=>{
  res.render("auth/signup");
});





module.exports = router;
