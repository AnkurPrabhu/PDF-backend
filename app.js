require("dotenv").config();

const mongoose = require("mongoose");
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const User = require("./models/user");

//session
const store = new MongoDBStore({
  uri: process.env.MONGO_URI,
  collection: "sessions",
});

app.use(
  session({
    secret: "process.env.SECRET",
    resave: false,
    saveUninitialized: false,
    store: store,
    cookie: {
    secure: false,
    httpOnly: true,
      
    SameSite: 'none',
  }
  })
);

app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then((user) => {
      req.user = user;
      next();
    })
    .catch((err) => console.log(err));
});

//Port
const port = process.env.Port || 3001;

//Middlewares
app.use(bodyParser.json());
app.use(cookieParser());

app.use(
  cors({
    origin: process.env.ORIGIN,
    credentials: true,
  })
);
//routes
const authRoutes = require("./routes/auth");
const fileRoutes = require("./routes/file");
const commentRoutes = require("./routes/comment");
const shareRoutes = require("./routes/share");
const accessRoutes = require("./routes/access");

app.use("/api", authRoutes);
app.use("/api", fileRoutes);
app.use("/api", commentRoutes);
app.use("/api", shareRoutes);
app.use("/api", accessRoutes);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("DB CONNECTED");
    app.listen(port, () => {
      console.log(`app is running at ${port}`);
    });
  })
  .catch((err) => {
    console.log(err);
  });
