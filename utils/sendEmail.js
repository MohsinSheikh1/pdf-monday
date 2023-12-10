const nodemailer = require("nodemailer");

async function sendEmail(pdf, email) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 465,
    auth: {
      user: "notifications@beastical.com",
      pass: process.env.PASSWORD,
    },
  });

  const mailOptions = {
    from: "notifications@beastical.com",
    to: email,
    subject: "PDF",
    text: "Your requested pdf from monday.com",
    attachments: [
      {
        filename: "PDF.pdf",
        content: pdf,
        contentType: "application/pdf",
      },
    ],
  };

  await transporter.sendMail(mailOptions);
}

module.exports = { sendEmail };
