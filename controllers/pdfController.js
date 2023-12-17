const { generatePDF } = require("../utils/generatePDF");
const { getRequiredData } = require("../utils/apiCalls");
const { sendEmail } = require("../utils/sendEmail");
const { generateHTML, generateUpdtesHTML } = require("../utils/generateHtml");
const schedule = require("node-schedule");
const User = require("../models/User");
const { decryptToken } = require("../utils/encryptDecrypts");
const logger = require("../utils/logger");

exports.createPDF = async (req, res) => {
  try {
    // console.log(req.headers);
    //get User ip
    const ipware = require("ipware")().get_ip;
    const ipinfo = ipware(req);
    const ipaddress =
      ipinfo.clientIp !== "127.0.0.1"
        ? ipinfo.clientIp
        : "IP address not found";

    const includeSubitems = req.query.includeSubitems === "true" ? true : false;
    const includeUpdates = req.query.includeUpdates === "true" ? true : false;
    const wholeBoard = req.query.wholeBoard === "true" ? true : false;

    user_id = req.body.user.id;
    account_id = req.body.account.id;

    //Getting API key from database
    const user = await User.findOne({ id: user_id, account_id });
    if (!user) {
      return res.status(400).json({
        message: "User not found",
      });
    }
    const apiKey = user.apiKey;
    const iv = user.iv;
    const decryptedApiToken = decryptToken(apiKey, iv);

    const { boardName, columns, groups, items, statusColumns, updates } =
      await getRequiredData(
        req.body,
        includeSubitems,
        includeUpdates,
        wholeBoard,
        decryptedApiToken,
        apiKey
      );
    let html = generateHTML(boardName, columns, groups, items, statusColumns);
    if (includeUpdates) {
      const updatesHTML = generateUpdtesHTML(updates, boardName);
      html += updatesHTML;
    }
    html += "</body> </html>";
    const pdf = await generatePDF(html);

    logger.log(
      "info",
      `User ${user_id} on account ${account_id} exported a pdf.`,
      { account_id: account_id, user_id: user_id, ip_address: ipaddress }
    );

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
    const account_id = req.body.account.id;
    const user = await User.findOne({ id: user_id, account_id });
    if (!user) {
      return res.status(400).json({
        message: "User not found",
      });
    }
    const apiKey = user.apiKey;
    const iv = user.iv;
    const decryptedApiToken = decryptToken(apiKey, iv);
    const { boardName, columns, groups, items, statusColumns, updates } =
      await getRequiredData(
        req.body.context,
        includeSubitems,
        includeUpdates,
        wholeBoard,
        decryptedApiToken
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
    logger.log(
      "info",
      `User ${user_id} on account ${account_id} scheduled a pdf.`,
      { account_id: account_id, user_id: user_id, ip_address: ipaddress }
    );
    res.send("Job Scheduled");
  } catch (error) {
    res.status(400).json({
      message: "Server Error Occured",
    });
  }
};
