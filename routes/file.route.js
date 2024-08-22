const express = require("express");
const router = express.Router();
const UserModel = require("../model/user.model");
const multer = require("multer");
const protect = require("../middleware/protect");
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 23,
  },
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype == "image/png" ||
      file.mimetype == "image/jpg" ||
      file.mimetype == "image/jpeg"
    ) {
      cb(null, true);
    } else {
      cb(new Error("File types allowed are.jpeg,.png,.jpg"));
    }
  },
});

router.post("/uploadFile", upload.single("file"), function (req, res) {
  res.json({ fileName: req.file.filename });
});

router.put("/uploadDp", protect, upload.single("file"), async (req, res) => {
  try {
    const userId = req.user._id;
    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      { profileImg: req.file.path },
      { new: true }
    );
    res.json({
      fileName: req.file.filename,
      profileImg: updatedUser.profileImg,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "File upload failed", error: error.message });
  }
});

const downloadFile = (req, res) => {
  const fileName = req.params.filename;
  const path = __basedir + "/uploads/";
  res.download(path + fileName, (error) => {
    if (error) {
      res.status(500).send({ message: "File cannot be downloaded " + error });
    }
  });
};
router.get("/files/:filename", downloadFile);

module.exports = router;
