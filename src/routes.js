const { HttpStatusCode } = require("#constants");
const {
  loginAccountHandler,
  logoutHandler,
  forgotPasswordHandler,
  verifyPasswordHandler,
} = require("#controllers");
module.exports = function (app) {
  app.get("/api/health", (req, res) => {
    res.status(HttpStatusCode.OK).send("Server Healthy!");
  });

  app.post("/api/login", loginAccountHandler);
  app.post("/api/logout", logoutHandler);
  app.post("/api/forgotPassword", forgotPasswordHandler);
  app.post("/api/verifyPassword", verifyPasswordHandler);
};
