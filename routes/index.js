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
  logout,
  isLoggedIn } = require('../controllers/index')

//routes
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

indexRouter.post('/like/:postId', isLoggedIn, toggleLikePost);

indexRouter.post('/deletepost/:postId',isLoggedIn, deletePost);

indexRouter.get('/post/:postId',isLoggedIn,readPost);

indexRouter.post('/comments/:postId',isLoggedIn,postComments);

indexRouter.get("/logout", logout);

indexRouter.get("*", (req, res) => {
  res.render("404");
});

module.exports = indexRouter;