"use strict";
const crypto = require("crypto");
const { customAlphabet } = require("nanoid");
const nanoid = customAlphabet("1234567890pqrstuvwxyzABCDEFGHIJKLMNO", 16);
exports.saltAndSecretGenerator = (secret, salt) => {
  salt = salt || nanoid();
  salt = salt.trim();
  secret = secret.trim();
  secret = crypto
    .pbkdf2Sync(secret, salt, 1000, 64, `sha512`)
    .toString("base64");
  return { secret, salt };
};
