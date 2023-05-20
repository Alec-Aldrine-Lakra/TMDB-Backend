"use strict";
const mongoose = require("mongoose");

const TemporaryLinkSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    link: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

// 20 minutes expiry
TemporaryLinkSchema.index({ createdAt: 1 }, { expireAfterSeconds: 1200 });

const TemporaryLink = mongoose.model("TemporaryLink", TemporaryLinkSchema);
module.exports = TemporaryLink;
