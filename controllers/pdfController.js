const { generateHTML } = require("../utils/generateHtml");
const { generatePDF } = require("../utils/generatePDF");
const { getRequiredData } = require("../utils/apiCalls");
const { sendEmail } = require("../utils/sendEmail");
const schedule = require("node-schedule");

exports.createPDF = async (req, res) => {
  const includeSubitems = req.query.includeSubitems === "true" ? true : false;
  const includeUpdates = req.query.includeUpdates === "true" ? true : false;

  const { boardName, columns, groups, items, statusColumns } =
    await getRequiredData(req.body, includeSubitems, includeUpdates);
  const html = generateHTML(boardName, columns, groups, items, statusColumns);

  const pdf = await generatePDF(html);
  res.contentType("application/pdf");
  res.send(pdf);
};

exports.schedulePDF = async (req, res) => {
  const time = req.body.time;
  schedule.scheduleJob(time, async () => {
    const includeSubitems = req.query.includeSubitems === "true" ? true : false;
    const includeUpdates = req.query.includeUpdates === "true" ? true : false;
    const { boardName, columns, groups, items, statusColumns } =
      await getRequiredData(req.body.context, includeSubitems, includeUpdates);
    const html = generateHTML(boardName, columns, groups, items, statusColumns);

    const pdf = await generatePDF(html);
    sendEmail(pdf);
  });
  res.send("Job Scheduled");
};
