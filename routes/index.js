var express = require("express");
var indexRouter = express.Router();
const { renderRegister,
  renderLogin, 
  uploadPost, 
  userProfile, 
  exploreFeed, 
  registerUser, 
  likePost,
  dislikePost,
  logout,
  isLoggedIn } = require('../controllers/index')

const passport = require("passport");

const userModel = require('../models/userModel')
const postModel = require("../models/postModel")

const upload = require("../middlewares/multer");



indexRouter.get("/", renderRegister);

indexRouter.get("/login", renderLogin);

indexRouter.post("/upload", upload.single("file"), uploadPost);

indexRouter.get("/profile", isLoggedIn, userProfile);

indexRouter.get('/feed', exploreFeed);

indexRouter.post("/register", registerUser);

indexRouter.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/profile",
    failureRedirect: "/login",
    failureFlash: true,
  })
);

indexRouter.post('/like/:postId', isLoggedIn, likePost);

indexRouter.post('/dislike/:postId', isLoggedIn, dislikePost);

indexRouter.get("/logout", logout);

indexRouter.get("*", (req, res) => {
  res.render("404");
});


module.exports = indexRouter;