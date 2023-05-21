"use strict";
const express = require("express");
require("dotenv").config();
const dbConnection = require("./db");
const helmet = require("helmet");
const cors = require("cors");
const { authMiddleware } = require("./middleware");
const routes = require("./routes");

const app = express();
const port = process.env.PORT;

app.use(express.json());
app.use(helmet());
app.use(
  cors({
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(authMiddleware);

// Start the server
app.listen(port, async () => {
  try {
    await dbConnection.connectDB();
    console.log(`Server is running on http://localhost:${port}`);
    routes(app);
  } catch (err) {
    console.log(`Server failed to start`, err);
  }
});
