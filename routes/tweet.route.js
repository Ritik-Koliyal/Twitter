const express = require("express");
const router = express.Router();
const protect = require("../middleware/protect");
const tweetController = require("../controller/tweet.controller");

router.get("/alltweets", protect, tweetController.getAllTweets);
router.get("/myalltweets", protect, tweetController.getMyAllTweets);
router.get("/tweets/:tweetId", tweetController.getTweetById);
router.post("/createtweet", protect, tweetController.createTweet);
router.delete("/deletetweet/:tweetId", protect, tweetController.deleteTweet);

router.post("/tweets/:tweetId", protect, tweetController.retweet);

router.put("/like", protect, tweetController.likeTweet);
router.put("/unlike", protect, tweetController.unlikeTweet);

router.put("/uncomment", protect, tweetController.uncommentTweet);
router.put("/comment", protect, tweetController.commentTweet);
router.post(
  "/:tweetId/comments/:commentId/reply",
  protect,
  tweetController.replyToComment
);

router.get(
  "/tweets/:tweetId/comments/:commentId",
  protect,
  tweetController.getCommentById
);

router.get("/tweets/user/:userId", tweetController.getTweetsByUserId);
router.put("/tweets/retweet/:tweetId", protect, tweetController.retweet);
router.get("/users/:id", protect, tweetController.user);
router.post("/tweet/:id", protect, tweetController.originalTweet);

router.put(
  "/tweets/:tweetId/comments/:commentId/like",
  protect,
  tweetController.likeunlikecomment
);
router.put(
  "/tweets/:tweetId/comments/:commentId/reply",
  protect,
  tweetController.replyToComment
);

module.exports = router;
