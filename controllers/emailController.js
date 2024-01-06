const nodemailer = require("nodemailer");
const asyncHandler = require("express-async-handler");

// send email controller
const sendEmail = asyncHandler(async (data, req, res) => {
  // create reusable transporter object using the default SMTP transport
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.MAIL_ID,
      pass: process.env.MP,
    },
  });
  // send mail with defined transport object
  const info = await transporter.sendMail({
    from: data.from, // sender address
    to: data.to, // list of receivers
    subject: data.subject, // Subject line
    text: data.text, // plain text body
    html: data.html, // html body
  });

  console.log("Message sent: %s", info.messageId);
});

// export all controllers
module.exports = { sendEmail };
