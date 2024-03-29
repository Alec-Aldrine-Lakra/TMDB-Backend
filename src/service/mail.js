"use strict";
const formData = require("form-data");
const Mailgun = require("mailgun.js");

class Email {
  static client;

  getClient() {
    if (Email.client) {
      return Email.client;
    }
    const mailgun = new Mailgun(formData);
    Email.client = mailgun.client({
      username: "api",
      key: process.env.MAILGUN_KEY,
    });
    return Email.client;
  }

  async sendMail({ from, to, subject, html }) {
    const client = this.getClient();
    return client.messages.create(process.env.MAILGUN_DOMAIN, {
      from,
      to,
      subject,
      html,
    });
  }
}

class VerificationEmail extends Email {
  constructor() {
    super();
  }

  async sendVerificationMail(email, link) {
    const from = `TMDB ${process.env.MAILGUN_FROM}`;
    const subject = "Password Reset Link";
    const html = `<p>
        <h3>Click on the link below to verify your Email Id, this link will be invalid after 20 minutes</h3>
        <a href="${process.env.FRONTEND_APP_URL}/login/${link}" target="_blank">Verify Your Email</a>
    </p>`;

    try {
      await this.sendMail({ from, subject, html, to: [email] });
    } catch (err) {
      console.error(err);
    }
  }
}

const verificationClient = new VerificationEmail();

module.exports = {
  sendVerificationMail:
    verificationClient.sendVerificationMail.bind(verificationClient),
};

// mg.messages
//   .create(process.env.MAILGUN_DOMAIN, {
//     from: "Mailgun Sandbox <postmaster@sandboxf8371f9a7a1345559ef2097ad0421d99.mailgun.org>",
//     to: ["lakraalec123@gmail.com"],
//     subject: "Hello",
//     text: "Testing some Mailgun awesomness!",
//   })
//   .then((msg) => console.log(msg)) // logs response data
//   .catch((err) => console.log(err)); // logs any error`;

// You can see a record of this email in your logs: https://app.mailgun.com/app/logs.

// You can send up to 300 emails/day from this sandbox server.
// Next, you should add your own domain so you can send 10000 emails/month for free.
