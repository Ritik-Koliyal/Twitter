const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config");
const mongoose = require("mongoose");
const UserModel = mongoose.model("UserModel");

module.exports = (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization) {
    return res.status(401).json({ error: "user not logged in " });
  }

  const token = authorization.replace("JWT ", "");
  jwt.verify(token, JWT_SECRET, (error, payload) => {
    if (error) {
      return res.status(401).json({ error: "user not logged in " });
    }

    const { _id } = payload;
    UserModel.findById(_id)
      .then((dbUser) => {
        if (!dbUser) {
          return res.status(404).json({ error: "User not found" });
        }
        req.user = dbUser;
        next();
      })
      .catch((err) => {
        res.status(500).json({ error: "Internal server error" });
      });
  });
};
