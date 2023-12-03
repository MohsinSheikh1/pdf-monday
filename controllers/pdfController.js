const { generatePDF } = require("../utils/generatePDF");
const { getRequiredData } = require("../utils/apiCalls");
const { sendEmail } = require("../utils/sendEmail");
const { generateHTML, generateUpdtesHTML } = require("../utils/generateHtml");
const schedule = require("node-schedule");
const User = require("../models/User");

exports.createPDF = async (req, res) => {
  try {
    // console.log(req.headers);
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
    res.status(400).json({
      message: "Server Error occured",
    });
  }
};

exports.schedulePDF = async (req, res) => {
  try {
    const time = req.body.time;
    const currentTime = new Date();
    if (time < currentTime.getTime() || !time) {
      return res.status(400).json({
        message: "Invalid Time",
      });
    }
    console.log("Time from front end: " + time);
    const email = req.body.email;

    const includeSubitems = req.query.includeSubitems === "true" ? true : false;
    const includeUpdates = req.query.includeUpdates === "true" ? true : false;
    const wholeBoard = req.query.wholeBoard === "true" ? true : false;

    const user_id = req.body.context.user.id;
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

    const date = new Date(time);
    console.log("Date created from time " + date);

    const job = schedule.scheduleJob(
      date,
      async function (pdf, email) {
        console.log("Inside Schedule");
        sendEmail(pdf, email);
      }.bind(null, pdf, email)
    );
    res.send("Job Scheduled");
  } catch (error) {
    res.status(400).json({
      message: "Server Error Occured",
    });
  }
};
