const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");

const User = require("./../models/User.model");
const { isLoggedOut, isLoggedIn } = require("../middlewares/route-guard");

const saltRounds = 10;

//Sign up

router.get("/signup", (req, res, next) => {
  res.render("auth/signup");
});

router.post("/signup", async (req, res, next) => {
  try {
    const { username, password, email, name } = req.body;

    if (!username || !email || !password || !name) {
      res.render("auth/signup", {
        errorMessage: "Por favor rellena todos los campos."
      });
      return;
    }

    const user = await User.findOne({ $or: [{ username }, { email }] });
    if (user) {
      res.render("auth/signup", {
        errorMessage: "El usuario y/o el email están en uso."
      });
      return;
    }
    const salt = bcrypt.genSaltSync(saltRounds);
    const hashedPassword = bcrypt.hashSync(password, salt);
    await User.create({ username, email, name, password: hashedPassword });
    res.redirect("/");
  } catch (error) {
    next(error);
  }
});

router.get("/login", (req, res) => {
  res.render("auth/login");
});

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.render("auth/login", {
        errorMessage: "Por favor rellena todos los campos."
      });
      return;
    }

    const user = await User.findOne({ email });
    if (!user) {
      res.render("auth/login", {
        errorMessage: "Usuario o contraseña incorrectos."
      });
      return;
    }
    if (!bcrypt.compareSync(password, user.password)) {
      res.render("auth/login", {
        errorMessage: "Usuario o contraseña incorrectos."
      });
      return;
    }
    // console.log(user);
    req.session.currentUser = user;
    console.log("CURRENT USER", req.session.currentUser);
    res.redirect("/discover");
  } catch (error) {
    next(error);
  }
});

router.get("/profile", isLoggedIn, (req, res, next) => {
  res.render("auth/profile");
});

router.get("/logout", (req, res) => {
  req.session.destroy(() => res.redirect("/"));
});

module.exports = router;
