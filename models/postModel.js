const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  imageText: {
    type: String,
    required: true,
  },
  image:{
    type:String
  },
  user:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'User'
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  likes: {
    type: Array,
    default: [],
  },
});

const Post = mongoose.model("Post", postSchema);

module.exports = Post;
