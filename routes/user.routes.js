// user.route.js
const express = require("express");
const router = express.Router();
const userController = require("../controller/user.controller");
const protect = require("../middleware/protect");
const multer = require("multer");
const upload = multer();

router.post("/signup", userController.signup);
router.post("/login", userController.login);
router.get("/users/:userId", userController.getProfileById);
router.put("/user/follow/:userId", protect, userController.followUser);
router.put("/user/unfollow/:userId", protect, userController.unfollowUser);
router.put("/profile/:userId", userController.updateProfile);
module.exports = router;
