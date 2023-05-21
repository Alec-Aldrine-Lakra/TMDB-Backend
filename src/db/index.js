"use strict";
const mongoose = require("mongoose");
class DBConnector {
  static connection;
  constructor() {
    mongoose.set("strictQuery", false);
  }

  connectDB() {
    this.connectionURI = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@logistics.m5zfw.mongodb.net/?retryWrites=true&w=majority`;
    DBConnector.connection =
      DBConnector.connection ??
      mongoose.connect(this.connectionURI, {
        autoIndex: true,
      });
  }
}

const dbConnection = new DBConnector();
module.exports = dbConnection;
