"use strict";
const crypto = require("crypto");
const { nanoid } = require("./nanoid");
exports.saltAndSecretGenerator = (secret, salt) => {
  salt = salt || nanoid();
  salt = salt.trim();
  secret = secret.trim();
  secret = crypto
    .pbkdf2Sync(secret, salt, 1000, 64, `sha512`)
    .toString("base64");
  return { secret, salt };
};
