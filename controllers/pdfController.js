const { generatePDF } = require("../utils/generatePDF");
const { getRequiredData } = require("../utils/apiCalls");
const { sendEmail } = require("../utils/sendEmail");
const { generateHTML, generateUpdtesHTML } = require("../utils/generateHTML");
const schedule = require("node-schedule");
const User = require("../models/User");

exports.createPDF = async (req, res) => {
  try {
    const includeSubitems = req.query.includeSubitems === "true" ? true : false;
    const includeUpdates = req.query.includeUpdates === "true" ? true : false;
    const wholeBoard = req.query.wholeBoard === "true" ? true : false;

    user_id = req.body.user.id;

    //Getting API key from database
    const user = await User.findOne({ id: user_id });
    if (!user) {
      return res.status(400).json({
        message: "User not found",
      });
    }
    const apiKey = user.apiKey;

    const { boardName, columns, groups, items, statusColumns, updates } =
      await getRequiredData(
        req.body,
        includeSubitems,
        includeUpdates,
        wholeBoard,
        apiKey
      );
    let html = generateHTML(boardName, columns, groups, items, statusColumns);
    if (includeUpdates) {
      const updatesHTML = generateUpdtesHTML(updates, boardName);
      html += updatesHTML;
    }
    html += "</body> </html>";
    const pdf = await generatePDF(html);
    res.contentType("application/pdf");
    res.send(pdf);
  } catch (err) {
    console.log(err);
    res.status(400).json({
      message: "Server Error occured",
    });
  }
};

exports.schedulePDF = async (req, res) => {
  try {
    const time = req.body.time;
    const email = req.body.email;

    const includeSubitems = req.query.includeSubitems === "true" ? true : false;
    const includeUpdates = req.query.includeUpdates === "true" ? true : false;
    const wholeBoard = req.query.wholeBoard === "true" ? true : false;
    const user = await User.findOne({ id: user_id });
    const apiKey = user.apiKey;
    const { boardName, columns, groups, items, statusColumns, updates } =
      await getRequiredData(
        req.body.context,
        includeSubitems,
        includeUpdates,
        wholeBoard,
        apiKey
      );
    let html = generateHTML(boardName, columns, groups, items, statusColumns);
    if (includeUpdates) {
      const updatesHTML = generateUpdtesHTML(updates, boardName);
      html += updatesHTML;
    }
    html += "</body> </html>";

    const pdf = await generatePDF(html);

    schedule.scheduleJob(
      time,
      async function (pdf, email) {
        sendEmail(pdf, email);
      }.bind(null, pdf, email)
    );
    res.send("Job Scheduled");
  } catch (error) {
    console.log(error);
    res.status(400).json({
      message: "Server Error Occured",
    });
  }
};
