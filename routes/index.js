//router setup
var express = require("express");
var indexRouter = express.Router();

//middleware
const passport = require("passport");
const upload = require("../middlewares/multer");

//controllers
const { renderRegister,
  renderLogin, 
  uploadPost, 
  userProfile, 
  exploreFeed, 
  registerUser,
  toggleLikePost,
  deletePost,
  readPost,
  postComments,
  likecomment,
  search,
  user,
  getSearch,
  logout,
  isLoggedIn, 
  } = require('../controllers/index');
const userModel = require("../models/userModel");

//routes
indexRouter.get("/", renderRegister);

indexRouter.get("/login", renderLogin);

indexRouter.get("/profile", isLoggedIn, userProfile);

indexRouter.get('/feed', exploreFeed);

indexRouter.get('/post/:postId',readPost);

indexRouter.get('/searchuser',getSearch);

indexRouter.get('/user/:userId',user)

indexRouter.get('/search',search);

indexRouter.post("/register", registerUser);

indexRouter.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/profile",
    failureRedirect: "/login",
    failureFlash: true,
  })
);

indexRouter.post("/upload", upload.single("file"), uploadPost);

indexRouter.post('/like/:postId', isLoggedIn, toggleLikePost);

indexRouter.post('/deletepost/:postId',isLoggedIn, deletePost);

indexRouter.post('/comments/:postId',isLoggedIn,postComments);

indexRouter.post('/likecomment/:commentId',isLoggedIn,likecomment)

indexRouter.get("/logout", logout);

indexRouter.get("*", (req, res) => {
  res.render("404");
});

module.exports = indexRouter;