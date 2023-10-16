const { generatePDF } = require("../utils/generatePDF");
const { getRequiredData } = require("../utils/apiCalls");
const { sendEmail } = require("../utils/sendEmail");
const { generateHTML, generateUpdtesHTML } = require("../utils/generateHTML");
const schedule = require("node-schedule");

exports.createPDF = async (req, res) => {
  const includeSubitems = req.query.includeSubitems === "true" ? true : false;
  const includeUpdates = req.query.includeUpdates === "true" ? true : false;
  const wholeBoard = req.query.wholeBoard === "true" ? true : false;

  const { boardName, columns, groups, items, statusColumns, updates } =
    await getRequiredData(
      req.body,
      includeSubitems,
      includeUpdates,
      wholeBoard
    );
  const html = generateHTML(boardName, columns, groups, items, statusColumns);
  const pdf = await generatePDF(html);
  let updatesPDF = false;
  if (includeUpdates) {
    const updatesHTML = generateUpdtesHTML(updates, boardName);
    updatesPDF = await generatePDF(updatesHTML);
  }
  res.contentType("application/pdf");
  res.send(pdf);
};

exports.schedulePDF = async (req, res) => {
  const time = req.body.time;
  const email = req.body.email;

  schedule.scheduleJob(
    {
      year: 2023,
      month: 10,
      date: 7,
      dayOfWeek: 6,
      hour: 3,
      minute: 3,
      second: 30,
      tz: "Etc/GMT-5",
    },
    async () => {
      const includeSubitems =
        req.query.includeSubitems === "true" ? true : false;
      const includeUpdates = req.query.includeUpdates === "true" ? true : false;
      const wholeBoard = req.query.wholeBoard === "true" ? true : false;

      const { boardName, columns, groups, items, statusColumns, updates } =
        await getRequiredData(
          req.body.context,
          includeSubitems,
          includeUpdates,
          wholeBoard
        );
      const html = generateHtml(
        boardName,
        columns,
        groups,
        items,
        statusColumns
      );

      const pdf = await generatePDF(html);
      sendEmail(pdf, email);
    }
  );
  res.send("Job Scheduled");
};
