const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;
const { Schema } = mongoose;

// Define the Tweet schema
const tweetSchema = new Schema(
  {
    content: {
      type: String,
      required: false,
    },
    tweetedBy: {
      type: Schema.Types.ObjectId,
      ref: "UserModel",
      required: true,
    },
    likes: [
      {
        type: Schema.Types.ObjectId,
        ref: "UserModel",
      },
    ],
    retweetOf: {
      type: Schema.Types.ObjectId,
      ref: "Tweet",
    },
    originalTweetedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    image: {
      type: String,
    },
    replies: [
      {
        type: Schema.Types.ObjectId,
        ref: "Tweet",
      },
    ],
    comments: [
      {
        commentText: String,
        commentedBy: { type: ObjectId, ref: "UserModel" },
        likes: [
          {
            type: Schema.Types.ObjectId,
            ref: "UserModel",
          },
        ],
        replies: [
          {
            commentText: String,
            commentedBy: { type: ObjectId, ref: "UserModel" },
            createdAt: { type: Date, default: Date.now },
            likes: [
              {
                type: Schema.Types.ObjectId,
                ref: "UserModel",
              },
            ],
          },
        ],
      },
    ],
  },
  {
    timestamps: true, // Automatically create createdAt and updatedAt fields
  }
);

// Create the Tweet model
const TweetModel = mongoose.model("TweetModel", tweetSchema);

module.exports = TweetModel;
