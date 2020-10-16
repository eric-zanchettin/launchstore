const nodemailer = require('nodemailer');

module.exports = nodemailer.createTransport({
  host: "smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: "96f7cde80d8309",
    pass: "7ee4d6ab217096"
  }
});
