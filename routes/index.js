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
  res.render("profile", { user });
});

router.get('/feed', async (req, res, next) => {
  try {
    const posts = await postModel.find({});

    if (req.isAuthenticated()) {
      const user = await userModel.findOne({ username: req.session.passport.user });
      res.render('feed', { posts, req, user });
    } else {
      res.render('feed', { posts, req });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
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

router.post('/like/:postId', isLoggedIn, async (req, res) => {
  const postId = req.params.postId;

  try {
      const post = await postModel.findById(postId);

      if (!post.likes.includes(req.user._id)) {
          post.likes.push(req.user._id);
          await post.save();
          res.redirect('back');
      } else {
        res.redirect('back');
      }
  } catch (error) {
      console.error(error);
      res.redirect('back');
  }
});

router.post('/dislike/:postId', isLoggedIn, async (req, res) => {
  const postId = req.params.postId;

  try {
      const post = await postModel.findById(postId);

      const userIndex = post.likes.indexOf(req.user._id);
      if (userIndex !== -1) {
          post.likes.splice(userIndex, 1); 
          await post.save();
      }

      res.redirect('back');
  } catch (error) {
      console.error(error);
      res.redirect('back');
  }
});

router.post('/deletepost/:postId', isLoggedIn, async (req, res) => {
  const postId = req.params.postId;

  try {
    const post = await postModel.findOne({ _id: postId, user: req.user._id });

    if (!post) {
      return res.status(404).send('Post not found or you do not have permission to delete it.');
    }

    await postModel.findByIdAndDelete(postId);
    res.redirect('back');
  } catch (error) {
    console.error(error);
    res.redirect('back');
  }
});

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
