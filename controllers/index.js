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

async function registerUser(req, res) {
  try {
    const { username, email, fullname } = req.body;

    const existingUser = await userModel.findOne({ username });

    if (existingUser) {
      return res.send("User already exists");
    }

    const userData = new userModel({ username, email, fullname });

    userModel.register(userData, req.body.password, (err, user) => {
      if (err) {
        console.error(err);
        return res.send("email already exist!");
      }

      passport.authenticate("local")(req, res, () => {
        return res.redirect("/profile");
      });
    });
  } catch (error) {
    console.log(error);
    res.send(error);
  }
}


async function toggleLikePost(req, res) {
  const postId = req.params.postId;

  try {
      const post = await postModel.findById(postId);
      const userLiked = post.likes.includes(req.user._id);

      if (!userLiked) {
          post.likes.push(req.user._id);
      } else {
          post.likes.pull(req.user._id);
      }

      await post.save();
      return res.redirect('back');
  } catch (error) {
      console.error(error);
      return res.redirect('back');
  }
}

async function deletePost(req,res){
  const postId = req.params.postId;

  try{
    const post = await postModel.findByIdAndDelete(postId);
    return res.redirect('back');
  }
  catch(error){
    console.log(error);
    return res.redirect('back');
  }
}

async function readPost(req,res){
  const postId = req.params.postId;

  try{
    const post = await postModel.findById(postId)
    .populate("user")
    .populate("comments.user");
    console.log(post);
    if (req.isAuthenticated()) {
      const user = await userModel.findOne({
        username: req.session.passport.user,
      });
      return res.render("post", { post, req, user });
    } else {
      return res.render("post", { post, req });
    }
  }
  catch(error){
    console.log(error);
    res.redirect('back');
  }
}

async function postComments(req,res) {
  try {
    const postId = req.params.postId;
    const { CommentText } = req.body;

    const post = await postModel.findById(postId);
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const newComment = {
      CommentText,
      user: req.user._id, 
      CommentLikes: [], 
    };

    post.comments.push(newComment);

    await post.save();

    res.redirect('back')
  } catch (error) {
    console.error(error);
    res.redirect('back')
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
  toggleLikePost,
  deletePost,
  readPost,
  postComments,
  logout,
  isLoggedIn
};
