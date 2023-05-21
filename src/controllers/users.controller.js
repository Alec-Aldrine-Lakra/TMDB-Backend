"use strict";
const { body, validationResult } = require("express-validator");
const { User, TemporaryLink } = require("../model");
const { UserAccountStatus, HttpStatusCode } = require("../constants");
const { signJWT, sendVerificationMail, nanoid } = require("../service");

// register account
exports.registerAccountHandler = [
  body("email").isEmail(),
  body("password").isString(),
  body("username").isString(),
  body("contactNo").isNumeric(),
  async (req, res, next) => {
    if (req.user) {
      console.error(
        "Cannot register again when the token has not expired",
        req.user.userId
      );
      res
        .status(HttpStatusCode.BAD_REQUEST)
        .send({ errors: "Cannot login again when the token has not expired!" });
      return;
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/errors messages.
      res.status(HttpStatusCode.BAD_REQUEST).send({ errors: errors.array() });
      return;
    }
    const email = req.body.email;
    const password = req.body.password;
    const username = req.body.username;
    const contactNo = req.body.contactNo;
    try {
      const existingUser = await User.findOne(
        {
          email,
          contactNo,
        },
        { _id: 1 }
      );
      if (existingUser) {
        console.error("Email Id or Contact No. is already taken");
        res
          .status(HttpStatusCode.BAD_REQUEST)
          .send({ errors: "Email Id or Contact No. is already taken!" });
        return;
      }

      const user = new User({
        username,
        email,
        password,
        contactNo,
      });
      const link = nanoid();
      const temporaryLink = new TemporaryLink({
        email,
        link,
      });

      const result = await Promise.all([user.save(), temporaryLink.save()]);

      res
        .status(HttpStatusCode.OK)
        .send({ message: "User created successfully" });
      sendVerificationMail(email, link);
    } catch (err) {
      console.error("Failed registering a new user", err);
      res
        .status(HttpStatusCode.BAD_REQUEST)
        .send({ errors: "Failed registering a new user!" });
    }
  },
];

// login
exports.loginAccountHandler = [
  body("email").isEmail(),
  body("password").isString(),
  body("link").isString().optional(),
  async (req, res, next) => {
    if (req.user) {
      console.error(
        "Cannot login again when the token has not expired",
        req.user.userId
      );
      res
        .status(HttpStatusCode.BAD_REQUEST)
        .send({ errors: "Cannot login again when the token has not expired!" });
      return;
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/errors messages.
      res.status(HttpStatusCode.BAD_REQUEST).send({ errors: errors.array() });
      return;
    }
    const email = req.body.email;
    const password = req.body.password;
    const link = req.body.link;
    try {
      let user;
      if (link) {
        // // deleting the link generated
        const temporaryLink = await TemporaryLink.findOneAndDelete({ link });
        if (!temporaryLink || temporaryLink.email !== email) {
          console.error("Invalid Validation Link!");
          res
            .status(HttpStatusCode.BAD_REQUEST)
            .send({ errors: "Invalid Validation Link!" });
          return;
        }
        user = await User.findOne({
          email,
          status: UserAccountStatus.PENDING,
        });
      } else {
        user = await User.findOne({
          email,
          status: UserAccountStatus.ACTIVATED,
        });
      }
      if (!user?.comparePassword(password)) {
        console.error(
          "Invalid Email Id or Password:  Email Id: ",
          email,
          " and Password: ",
          password
        );
        res
          .status(HttpStatusCode.FORBIDDEN)
          .send({ errors: "Invalid Email Id or Password!" });
        return;
      }
      if (link) {
        // Updating inactive user to active
        await User.updateOne(
          { _id: user._id },
          { status: UserAccountStatus.ACTIVATED }
        );
      }
      const token = signJWT(
        {
          userId: user._id,
          admin: user.admin,
          email: user.email,
          username: user.username,
        },
        "30d"
      );
      res.status(HttpStatusCode.OK).send({ accessToken: token });
    } catch (err) {
      res
        .status(HttpStatusCode.BAD_REQUEST)
        .send({ errors: "Invalid Email Id or Password!" });
    }
  },
];

// logout
exports.logoutHandler = [
  async (req, res, next) => {
    res.status(HttpStatusCode.OK).send({ message: "Logged Out Successfully!" });
  },
];

// forgot password
exports.forgotPasswordHandler = [
  body("email").isEmail(),
  async (req, res, next) => {
    if (req.user) {
      console.error(
        "Cannot reset password when the user is logged in!",
        req.user.userId
      );
      res
        .status(HttpStatusCode.BAD_REQUEST)
        .send({ errors: "Cannot reset password when the user is logged in!" });
      return;
    }
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(HttpStatusCode.BAD_REQUEST).send({ errors: errors.array() });
      return;
    }
    const email = req.body.email;

    try {
      const user = await User.findOne({
        email,
        status: UserAccountStatus.ACTIVATED,
      });
      if (!user) {
        console.error("Invalid Email Id for Activation: ", email);
        res
          .status(HttpStatusCode.FORBIDDEN)
          .send({ errors: "Invalid Email Id!" });
        return;
      }
      res
        .status(HttpStatusCode.OK)
        .send({ message: "Please check your email for reset link!" });
      sendVerificationMail(email);
    } catch (err) {
      console.error(err);
      res
        .status(HttpStatusCode.BAD_REQUEST)
        .send({ errors: "User not validated please try after some time" });
    }
  },
];

// verify password
exports.verifyPasswordHandler = [
  body("link").isString(),
  body("password").isString(),
  body("confirmPassword").isString(),
  async (req, res, next) => {
    if (req.user) {
      console.error(
        "Cannot reset password when the user is logged in!",
        req.user.userId
      );
      res
        .status(HttpStatusCode.BAD_REQUEST)
        .send({ errors: "Cannot reset password when the user is logged in!" });
      return;
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(HttpStatusCode.BAD_REQUEST).send({ errors: errors.array() });
      return;
    }
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;
    if (!passwordValidator(password, confirmPassword)) {
      res.status(502).send({ errors: "Invalid Password!" });
      return;
    }
    const link = req.body.link;
    try {
      const temporaryLink = await TemporaryLink.findOneAndDelete({ link });
      if (!temporaryLink) {
        console.error("Invalid Reset Link");
        res
          .status(HttpStatusCode.FORBIDDEN)
          .send({ errors: "Invalid Reset Link!" });
        return;
      }
      await User.findOneAndUpdate({ email: temporaryLink.email }, { password });
      res
        .status(HttpStatusCode.OK)
        .send({ message: "Password Reset Successful!" });
    } catch (err) {
      console.error(err);
      res
        .status(HttpStatusCode.BAD_REQUEST)
        .send({ errors: "Error Updating Password!" });
    }
  },
];
