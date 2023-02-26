const express = require("express");
const User = require("../models/User.model");
const router = express.Router();
const bcrypt = require("bcryptjs");
const salt = 10;
//        /auth/signup
router.get("/signup", (req, res, next) => {
  res.render("auth/signup");
});

router.post("/signup", async (req, res, next) => {
  const { username, password } = req.body;
  console.log({ username, password });
  try {
    if (!username || !password) {
      return res.render("auth/signup", {
        errorMessage: "Please fill out all of the fields!",
      });
    }
    if (password.length < 6) {
      return res.render("auth/signup", {
        errorMessage: "Please put a longer password",
      });
    }
    const foundUser = await User.findOne({ username: username });
    if (foundUser) {
      return res.render("auth/signup", {
        errorMessage: "Theres another one of you!",
      });
    }

    const hashed = await bcrypt.genSalt(salt);
    const hashedPassword = await bcrypt.hash(password, hashed);

    const newUser = await User.create({ username, password: hashedPassword });
    res.redirect("/");
  } catch (error) {
    next(error);
  }
});

router.get("/login", (req, res) => {
  res.render("auth/login");
});

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.render("auth/signup", {
        errorMessage: "Please fill out all of the fields!",
      });
    }

    const foundUser = await User.findOne({ username });
    if (!foundUser) {
      return res.render("auth/login");
    }

    const checkPassword = await bcrypt.compare(password, foundUser.password);
    if (!checkPassword) {
      return res.render("auth/login");
    }

    req.session.currentUser = foundUser;

    res.redirect("/");
  } catch (error) {}
});
module.exports = router;
