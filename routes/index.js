var express = require("express");
var router = express.Router();

const userModel = require("./users");
const postModel = require("./posts");
const passport = require("passport");
const localStrategy = require("passport-local");
const upload = require("./multer");

passport.use(new localStrategy(userModel.authenticate()));

router.get("/", function (req, res, next) {
  res.render("index");
});

router.get("/login", function (req, res, next) {
  res.render("login", { error: req.flash("error") });
});



router.post("/upload", upload.single("file"), async function (req, res, next) {
  try {
    if (!req.file) {
      return res.status(404).send("no file were uploaded. ");
    }
    const user = await userModel.findOne({ username: req.session.passport.user });
    const post = await postModel.create({
      image: req.file.filename,
      imageText: req.body.filecaption,
      user: user._id,
    });
  
    await user.posts.push(post._id);
    await user.save();
    res.redirect("/profile")
  } catch (error) {
    res.send(error);
  }
});

router.get("/profile", isLoggedIn, async function (req, res, next) {
  const user = await userModel.findOne({
    username: req.session.passport.user,
  })
  .populate("posts")
  console.log(user);
  res.render("profile", { user });
});

router.get("/feed",async function (req, res, next) {
  const posts = await postModel.find({})
  console.log(posts);
  res.render("feed",{posts});
});

router.post("/register", (req, res) => {
  console.log(req.body);
  const { username, email, fullname } = req.body;
  const userData = new userModel({ username, email, fullname });

  userModel.register(userData, req.body.password).then(() => {
    passport.authenticate("local")(req, res, () => {
      res.redirect("/profile");
    });
  });
});

router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/profile",
    failureRedirect: "/login",
    failureFlash: true,
  })
);

router.get("/logout", function (req, res) {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/login");
  });
});

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect("/login");
}

router.get("*", (req, res) => {
  res.render("404");
});
module.exports = router;
