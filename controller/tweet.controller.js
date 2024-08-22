// tweet.controller.js
const PostModel = require("../model/tweet.model");
const TweetModel = require("../model/tweet.model");
const UserModel = require("../model/user.model");
const { ObjectId } = require("mongoose").Types;
exports.getAllTweets = (req, res) => {
  PostModel.find()
    .populate("tweetedBy", "_id name profileImg username")
    .populate("comments.commentedBy", "_id name profileImg username")
    .then((dbtweet) => {
      res.status(200).json({ tweet: dbtweet });
    })
    .catch((error) => {
      console.log(error);
    });
};

exports.getMyAllTweets = (req, res) => {
  PostModel.find({ tweetedBy: req.user._id })
    .populate("tweetedBy", "_id name profileImg username")
    .then((dbtweet) => {
      res.status(200).json({ tweet: dbtweet });
    })
    .catch((error) => {
      console.log(error);
    });
};

exports.getTweetById = async (req, res) => {
  try {
    const tweet = await TweetModel.findById(req.params.tweetId)
      .populate("tweetedBy", "username profileImg")
      .populate("comments.commentedBy", "username profileImg");
    if (!tweet) {
      return res.status(404).json({ message: "Tweet not found" });
    }
    res.json(tweet);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createTweet = (req, res) => {
  const { content, image } = req.body;

  if (!content && !image) {
    return res.status(400).json({ error: "Content or image is required" });
  }

  req.user.password = undefined; // Ensure password is not included

  const tweetObj = new TweetModel({
    content: content,
    image: image,
    tweetedBy: req.user._id, // Store only the user ID for reference
  });

  tweetObj
    .save()
    .then((newTweet) => {
      res.status(200).json({ tweet: newTweet });
    })
    .catch((error) => {
      console.log("Error:", error);
      res.status(500).json({ error: "Failed to create tweet" });
    });
};

exports.deleteTweet = async (req, res) => {
  try {
    const tweet = await PostModel.findOne({ _id: req.params.tweetId });

    if (!tweet) {
      return res.status(400).json({ error: "Tweet does not exist." });
    }

    if (tweet.tweetedBy.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ error: "Not authorized to delete this tweet." });
    }

    const result = await PostModel.deleteOne({ _id: req.params.tweetId });
    res.status(200).json({ result });
  } catch (error) {
    console.error("Error deleting tweet:", error);
    res.status(500).json({ error: "Failed to delete tweet." });
  }
};

exports.uncommentTweet = async (req, res) => {
  const comment = {
    commentText: req.body.commentText,
    commentedBy: req.user._id,
  };

  try {
    let tweet = await TweetModel.findByIdAndUpdate(
      req.body.tweetId,
      { $pull: { comments: comment } },
      { new: true }
    )
      .populate("comments.commentedBy", "_id name")
      .populate("tweetedBy", "_id name");

    if (!tweet) {
      return res.status(404).json({ error: "Tweet not found" });
    }

    res.json(tweet);
  } catch (error) {
    console.error("Error removing comment:", error);
    res.status(400).json({ error: "Error removing comment" });
  }
};

exports.commentTweet = async (req, res) => {
  const comment = {
    commentText: req.body.commentText,
    commentedBy: req.user._id,
  };

  try {
    let tweet = await TweetModel.findByIdAndUpdate(
      req.body.tweetId,
      { $push: { comments: comment } },
      { new: true }
    )
      .populate("comments.commentedBy", "_id name")
      .populate("tweetedBy", "_id name");

    if (!tweet) {
      return res.status(404).json({ error: "Tweet not found" });
    }

    res.json(tweet);
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(400).json({ error: "Error adding comment" });
  }
};

exports.replyToComment = async (req, res) => {
  try {
    const { tweetId, commentId } = req.params;
    const { replyText } = req.body;
    const userId = req.user.id;

    // Find the tweet containing the comment
    const tweet = await TweetModel.findById(tweetId);

    if (!tweet) {
      return res.status(404).json({ error: "Tweet not found" });
    }

    // Find the comment to reply to
    const comment = tweet.comments.id(commentId);

    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    // Add the reply to the comment's replies array
    comment.replies.push({
      commentText: replyText,
      commentedBy: userId,
    });

    await tweet.save();

    // Return the updated comment with the new reply
    res.status(201).json(comment);
  } catch (error) {
    console.error("Error replying to comment:", error);
    res.status(500).json({ error: "Server error" });
  }
};

exports.getTweetsByUserId = async (req, res) => {
  try {
    const tweets = await TweetModel.find({ tweetedBy: req.params.userId })
      .populate("tweetedBy", "_id name username profileImg")
      .populate("comments.commentedBy", "_id name username profileImg");

    res.status(200).json({ tweets });
  } catch (error) {
    console.error("Error fetching tweets by user ID:", error);
    res.status(500).json({ error: "Server error" });
  }
};

exports.likeTweet = async (req, res) => {
  try {
    const updatedTweet = await TweetModel.findByIdAndUpdate(
      req.body.postId,
      { $push: { likes: req.user._id } },
      { new: true }
    ).populate("tweetedBy", "_id name");

    if (!updatedTweet) {
      return res.status(404).json({ error: "Tweet not found" });
    }

    res.json(updatedTweet);
  } catch (error) {
    console.error("Error liking tweet:", error);
    res.status(400).json({ error: error.message });
  }
};

exports.unlikeTweet = async (req, res) => {
  try {
    const updatedTweet = await TweetModel.findByIdAndUpdate(
      req.body.postId,
      { $pull: { likes: req.user._id } },
      { new: true }
    ).populate("tweetedBy", "_id name");

    if (!updatedTweet) {
      return res.status(404).json({ error: "Tweet not found" });
    }

    res.json(updatedTweet);
  } catch (error) {
    console.error("Error unliking tweet:", error);
    res.status(400).json({ error: error.message });
  }
};

exports.retweet = async (req, res) => {
  try {
    const originalTweet = await TweetModel.findById(req.params.tweetId);
    if (!originalTweet) {
      return res.status(404).json({ message: "Tweet not found" });
    }

    const retweet = new TweetModel({
      content: originalTweet.content,
      tweetedBy: req.user._id,
      retweetOf: originalTweet._id,
      originalTweetedBy: originalTweet.tweetedBy,
    });

    await retweet.save();

    if (originalTweet.retweetBy) {
      originalTweet.retweetBy.push(req.user._id);
    } else {
      originalTweet.retweetBy = [req.user._id];
    }
    await originalTweet.save();

    res.status(201).json(retweet);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.user = async (req, res) => {
  const userId = req.params.id;
  if (!ObjectId.isValid(userId)) {
    return res.status(400).json({ message: "Invalid user ID" });
  }

  try {
    const user = await UserModel.findOne({ _id: userId });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.originalTweet = async (req, res) => {
  const tweetId = req.params.id;
  if (!ObjectId.isValid(tweetId)) {
    return res.status(400).json({ message: "Invalid tweet ID" });
  }

  try {
    const tweet = await TweetModel.findOne({ _id: tweetId });
    if (!tweet) {
      return res.status(404).json({ message: "Tweet not found" });
    }
    res.json(tweet);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.likeunlikecomment = async (req, res) => {
  try {
    const { tweetId, commentId } = req.params;
    const userId = req.user._id; // Assuming you are using some auth middleware to get logged in user's ID

    const tweet = await TweetModel.findById(tweetId);
    if (!tweet) {
      return res.status(404).json({ message: "Tweet not found" });
    }

    const comment = tweet.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    const likeIndex = comment.likes.indexOf(userId);
    if (likeIndex === -1) {
      // User has not liked the comment, so like it
      comment.likes.push(userId);
    } else {
      // User has already liked the comment, so unlike it
      comment.likes.splice(likeIndex, 1);
    }

    await tweet.save();

    res
      .status(200)
      .json({ message: "Comment like toggled successfully", tweet });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
exports.getCommentById = async (req, res) => {
  try {
    const { tweetId, commentId } = req.params;

    // Find the tweet by tweetId and populate the necessary fields
    const tweet = await TweetModel.findById(tweetId)
      .populate("comments.commentedBy", "username profileImg name")
      .populate("comments.replies.commentedBy", "_id name username profileImg");

    if (!tweet) {
      return res.status(404).json({ error: "Tweet not found" });
    }

    // Find the comment by commentId
    const comment = tweet.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    res.status(200).json({ comment });
  } catch (error) {
    console.error("Error fetching comment:", error);
    res.status(500).json({ error: "Server error" });
  }
};
