require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const path = require('path');
const cookieParser = require('cookie-parser');

const authRoutes = require("./routes/authRoutes");
const eventRoutes = require("./routes/eventRoutes");
const registrationRoutes = require("./routes/registrationRoutes");
const viewRoutes = require("./routes/viewRoutes");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Set EJS as view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/event_management")
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB error", err));

app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/registrations", registrationRoutes);
app.use("/", viewRoutes);

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
