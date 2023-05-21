"use strict";
const { verifyJWT } = require("../service");
exports.authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization || "";
  if (!authHeader.includes("Bearer ")) {
    return next();
  }
  const token = authHeader.split(" ")[1];
  const { payload, expired } = verifyJWT(token);
  if (payload && !expired) {
    req.user = payload;
  }
  next();
};
