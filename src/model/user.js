"use strict";
const mongoose = require("mongoose");
const { UserAccountStatus } = require("../constants");
const { saltAndSecretGenerator } = require("../service");

const UserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    username: { type: String, required: true },
    contactNo: { type: Number, required: true, unique: true },
    salt: { type: String, required: true },
    admin: { type: Boolean, default: false },
    status: {
      type: Number,
      default: UserAccountStatus.PENDING,
      enum: [
        UserAccountStatus.ACTIVATED,
        UserAccountStatus.DEACTIVATED,
        UserAccountStatus.PENDING,
      ],
    },
  },
  { timestamps: true }
);

UserSchema.pre("validate", function (next) {
  const user = this;
  if (!user.isModified("password") || !user.password) {
    return next();
  }
  const { secret, salt } = saltAndSecretGenerator(user.password);
  user.password = secret;
  user.salt = salt;
  next();
});

UserSchema.pre("findOneAndUpdate", function (next) {
  const user = this._update;
  if (!user.password) {
    return next();
  }
  const { secret, salt } = saltAndSecretGenerator(user.password);
  user.password = secret;
  user.salt = salt;
  next();
});

UserSchema.methods.comparePassword = function (password) {
  const user = this;
  const { secret } = saltAndSecretGenerator(password, user.salt);
  return user.password === secret;
};

const User = mongoose.model("User", UserSchema);
module.exports = User;
