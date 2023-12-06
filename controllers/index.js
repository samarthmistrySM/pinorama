const passport = require("passport");

const userModel = require("../models/userModel");
const postModel = require("../models/postModel");

function renderRegister(req, res) {
  return res.render("register");
}

function renderLogin(req, res) {
  return res.render("login", { error: req.flash("error") });
}

async function uploadPost(req, res) {
  try {
    if (!req.file) {
      return res.status(404).send("no file were uploaded. ");
    }
    const user = await userModel.findOne({
      username: req.session.passport.user,
    });
    const post = await postModel.create({
      image: req.file.filename,
      imageText: req.body.filecaption,
      user: user._id,
    });

    await user.posts.push(post._id);
    await user.save();
    return res.redirect("/profile");
  } catch (error) {
    return res.send(error);
  }
}

async function userProfile(req, res) {
  const user = await userModel
    .findOne({
      username: req.session.passport.user,
    })
    .populate("posts");
  return res.render("profile", { user });
}

async function exploreFeed(req, res) {
  try {
    const posts = await postModel.find({}).populate("user");

    console.log(posts);

    if (req.isAuthenticated()) {
      const user = await userModel.findOne({
        username: req.session.passport.user,
      });
      return res.render("feed", { posts, req, user });
    } else {
      return res.render("feed", { posts, req });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal Server Error");
  }
}

function registerUser(req, res) {
  const { username, email, fullname } = req.body;
  const userData = new userModel({ username, email, fullname });

  userModel.register(userData, req.body.password).then(() => {
    passport.authenticate("local")(req, res, () => {
      return res.redirect("/profile");
    });
  });
}

async function likePost(req,res) {
    const postId = req.params.postId;

    try {
        const post = await postModel.findById(postId);
  
        if (!post.likes.includes(req.user._id)) {
            post.likes.push(req.user._id);
            await post.save();
            return res.redirect('back');
        } else {
          return res.redirect('back');
        }
    } catch (error) {
        console.error(error);
        return res.redirect('back');
    }
}

async function dislikePost(req,res){
    const postId = req.params.postId;

    try {
      const post = await postModel.findById(postId);
  
      const userLiked = post.likes.includes(req.user._id);
      if (userLiked) {
        post.likes.pull(req.user._id);
        await post.save();
      }
  
    return  res.redirect('back');
    } catch (error) {
      console.error(error);
    return  res.redirect('back');
    }
}

function logout(req,res) {
    req.logout(function (err) {
        if (err) {
          return next(err);
        }
        return res.redirect("/login");
      });
}

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) return next();
    res.redirect("/login");
  }

module.exports = {
  renderRegister,
  renderLogin,
  uploadPost,
  userProfile,
  exploreFeed,
  registerUser,
  likePost,
  dislikePost,
  logout,
  isLoggedIn
};
