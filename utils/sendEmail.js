const nodemailer = require("nodemailer");

async function sendEmail(pdf, email) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 465,
    auth: {
      user: "sheikhmohsin181@gmail.com",
      pass: "ebmj lpyz ocbb wbwk",
    },
  });

  const mailOptions = {
    from: "",
    to: email,
    subject: "PDF",
    text: "PDF",
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
