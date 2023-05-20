"use strict";
const jwt = require("jsonwebtoken");

exports.signJWT = function (payload, expiresIn = "30d") {
  return jwt.sign(payload, process.env.PRIVATEKEY, {
    expiresIn,
    algorithm: "RS256",
  });
};

exports.verifyJWT = function (token) {
  try {
    const decoded = jwt.verify(token, process.env.PUBLICKEY);
    return { payload: decoded, expired: false };
  } catch (error) {
    return { payload: null, expired: error?.message?.includes("jwt expired") };
  }
};
