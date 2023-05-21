"use strict";
const {
  loginAccountHandler,
  logoutHandler,
  forgotPasswordHandler,
  verifyPasswordHandler,
  registerAccountHandler,
} = require("./users.controller");

module.exports = {
  loginAccountHandler,
  registerAccountHandler,
  logoutHandler,
  forgotPasswordHandler,
  verifyPasswordHandler,
};
