const formData = require("form-data");
const Mailgun = require("mailgun.js");
const { nanoid } = require("nanoid");
const { TemporaryLink } = require("#models");

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

  async sendMail({ from, to, subject, text }) {
    const client = this.getClient();
    return client.messages.create(process.env.MAILGUN_DOMAIN, {
      from,
      to,
      subject,
      text,
    });
  }
}

class VerificationEmail extends Email {
  constructor() {
    super();
  }

  async sendVerificationMail(email) {
    const from = "TMDB Mailgun";
    const subject = "Password Reset Link";
    const text = `<p>
        <h3> Click on the link below to verify your Email Id, this link will be invalid after 10 minutes</h3>
        <a href="${config.FRONTEND_APP_URL}/login/${link}" target="_blank" >Verify Your Email</a>
    </p>`;

    const link = nanoid();
    const temporaryLink = new TemporaryLink({
      email,
      link,
    });

    try {
      const linkResult = await temporaryLink.save();
      if (!linkResult) {
        throw new Error("Error saving temporary link to DB");
      }
      await this.sendMail({ from, subject, text, to });
    } catch (err) {
      console.error(err);
    }
  }
}

const verificationClient = new VerificationEmail();

module.exports = {
  verificationClient:
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
