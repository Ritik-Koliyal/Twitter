const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const userRoute = require("./routes/user.routes");
const tweetRoute = require("./routes/tweet.route");
const fileRoute = require("./routes/file.route");
const path = require("path");
const app = express();

global.__basedir = __dirname;
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

mongoose.connect(
  "mongodb+srv://koliyalritik50:cigwLDkqgxVqmruP@cluster0.5cq36.mongodb.net/"
);

mongoose.connection.on("connected", () => {
  console.log("Db connected ");
});
mongoose.connection.on("error", () => {
  console.log("not  connected ");
});

require("./model/user.model");
require("./model/tweet.model");

app.use(cors());
app.use(express.json());

app.use("/api", userRoute);
app.use("/api", tweetRoute);
app.use(fileRoute);

app.listen(2100, () => {
  console.log("server started on 2100");
});
