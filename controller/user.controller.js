// user.controller.js
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const { JWT_SECRET } = require("../config");
const UserModel = require("../model/user.model");
exports.signup = (req, res) => {
  const { name, username, password, email, profileImg } = req.body;
  if (!name || !username || !password || !email) {
    return res.status(400).json({ err: "fields are empty" });
  }
  UserModel.findOne({ email: email })
    .then((userInDB) => {
      if (userInDB) {
        return res
          .status(500)
          .json({ error: "user with this email already exists" });
      } else {
        UserModel.findOne({ username: username })
          .then((userInDB) => {
            if (userInDB) {
              return res
                .status(500)
                .json({ error: "username not available, try something else" });
            } else {
              bcrypt.hash(password, 16).then((hashedPassword) => {
                const user = new UserModel({
                  name,
                  username,
                  email,
                  password: hashedPassword,
                  profileImg,
                });
                user.save().then((newUser) => {
                  res
                    .status(201)
                    .json({ result: "user signed up successfully" });
                });
              });
            }
          })
          .catch((err) => {
            console.error("Error finding username:", err);
            res.status(500).json({ error: "Internal server error" });
          });
      }
    })
    .catch((err) => {
      console.error("Error finding email:", err);
      res.status(500).json({ error: "Internal server error" });
    });
};

exports.login = (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ err: "fields are empty" });
  }

  UserModel.findOne({ username: username })
    .then((userInDB) => {
      if (!userInDB) {
        return res
          .status(400)
          .json({ error: "user with this username not exists" });
      }

      bcrypt
        .compare(password, userInDB.password)
        .then((match) => {
          if (match) {
            try {
              const jwtToken = jwt.sign({ _id: userInDB._id }, JWT_SECRET);
              const userInfo = {
                id: userInDB._id,
                name: userInDB.name,
                email: userInDB.email,
                username: userInDB.username,
              };
              res
                .status(200)
                .json({ result: { token: jwtToken, user: userInfo } });
            } catch (err) {
              console.error("Error signing token:", err);
              res.status(500).json({ error: "Internal server error" });
            }
          } else {
            return res.status(400).json({ error: "incorrect password" });
          }
        })
        .catch((err) => {
          console.error("Error comparing passwords:", err);
          res.status(500).json({ error: "Internal server error" });
        });
    })
    .catch((err) => {
      console.error("Error finding user:", err);
      res.status(500).json({ error: "Internal server error" });
    });
};

exports.getProfileById = async (req, res) => {
  try {
    const user = await UserModel.findById(req.params.userId).select(
      "-password"
    );
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.followUser = async (req, res) => {
  const { userId } = req.params;
  const currentUser = req.user; // Assuming current user ID is available in req.user

  try {
    // Update currentUser's following list
    if (!currentUser.following.includes(userId)) {
      currentUser.following.push(userId);
      await currentUser.save();
    }

    // Update target user's followers list
    const targetUser = await UserModel.findById(userId);
    if (targetUser && !targetUser.followers.includes(currentUser._id)) {
      targetUser.followers.push(currentUser._id);
      await targetUser.save();
    }

    res.status(200).json({ message: "User followed successfully" });
  } catch (error) {
    console.error("Error following user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.unfollowUser = async (req, res) => {
  const { userId } = req.params;
  const currentUser = req.user; // Assuming current user ID is available in req.user

  try {
    // Remove userId from currentUser's following list
    currentUser.following = currentUser.following.filter(
      (id) => id.toString() !== userId.toString()
    );
    await currentUser.save();

    // Remove currentUser's ID from target user's followers list
    const targetUser = await UserModel.findById(userId);
    targetUser.followers = targetUser.followers.filter(
      (id) => id.toString() !== currentUser._id.toString()
    );
    await targetUser.save();

    res.status(200).json({ message: "User unfollowed successfully" });
  } catch (error) {
    console.error("Error unfollowing user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.updateProfile = async (req, res) => {
  const { userId } = req.params;
  const { name, location, dateOfBirth } = req.body;

  try {
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (name) user.name = name;
    if (location) user.location = location;
    if (dateOfBirth) user.dateOfBirth = dateOfBirth;

    await user.save();
    res.status(200).json({ message: "Profile updated successfully", user });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Server error" });
  }
};
