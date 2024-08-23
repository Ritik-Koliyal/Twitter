// // const express = require("express");
// // const cors = require("cors");
// // const mongoose = require("mongoose");
// // const userRoute = require("./routes/user.routes");
// // const tweetRoute = require("./routes/tweet.route");
// // const fileRoute = require("./routes/file.route");
// // const path = require("path");
// // const app = express();

// // global.__basedir = __dirname;
// // app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// // mongoose.connect(
// //   "mongodb+srv://koliyalritik50:cigwLDkqgxVqmruP@cluster0.5cq36.mongodb.net/"
// // );

// // mongoose.connection.on("connected", () => {
// //   console.log("Db connected ");
// // });
// // mongoose.connection.on("error", () => {
// //   console.log("not  connected ");
// // });

// // require("./model/user.model");
// // require("./model/tweet.model");

// // app.use(cors());
// // app.use(express.json());

// // app.use("/api", userRoute);
// // app.use("/api", tweetRoute);
// // app.use(fileRoute);

// // app.get("/", (req, res) => {
// //   app.use(express.static(path.resolve(__dirname, "frontend", "build")));
// //   res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
// // });

// // app.listen(2100, () => {
// //   console.log("server started on 2100");
// // });

// const express = require("express");
// const cors = require("cors");
// const mongoose = require("mongoose");
// const userRoute = require("./routes/user.routes");
// const tweetRoute = require("./routes/tweet.route");
// const fileRoute = require("./routes/file.route");
// const path = require("path");
// const app = express();

// global.__basedir = __dirname;
// app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// mongoose.connect(
//   "mongodb+srv://koliyalritik50:cigwLDkqgxVqmruP@cluster0.5cq36.mongodb.net/yourDatabaseName"
// );

// mongoose.connection.on("connected", () => {
//   console.log("Db connected ");
// });
// mongoose.connection.on("error", () => {
//   console.log("not connected ");
// });

// require("./model/user.model");
// require("./model/tweet.model");

// app.use(cors());
// app.use(express.json());

// // Serving static files for the frontend
// app.use(express.static(path.resolve(__dirname, "frontend", "dist")));

// app.use("/api", userRoute);
// app.use("/api", tweetRoute);
// app.use(fileRoute);

// app.get("/", (req, res) => {
//   res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
// });

// // Error handling for 404 and 500
// app.use((req, res, next) => {
//   res.status(404).send("Not Found");
// });

// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(500).send("Something went wrong!");
// });

// app.listen(2100, () => {
//   console.log("server started on 2100");
// });

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

// MongoDB connection using environment variables
mongoose.connect(
  "mongodb+srv://koliyalritik50:cigwLDkqgxVqmruP@cluster0.5cq36.mongodb.net/yourDatabaseName"
);
mongoose.connection.on("connected", () => {
  console.log("DB connected");
});
mongoose.connection.on("error", (err) => {
  console.log("DB connection error: ", err);
});

require("./model/user.model");
require("./model/tweet.model");

app.use(cors());
app.use(express.json());

// Serving static files from the frontend dist folder
app.use(express.static(path.resolve(__dirname, "frontend", "dist")));

// API Routes
app.use("/api", userRoute);
app.use("/api", tweetRoute);
app.use(fileRoute);

// Fallback to index.html for frontend routing
app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
});

// Error handling for 404 and 500
app.use((req, res, next) => {
  res.status(404).send("Not Found");
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something went wrong!");
});

// Use the port assigned by Vercel or default to 2100
const PORT = 2100;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
