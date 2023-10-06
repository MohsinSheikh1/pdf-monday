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
  const email = req.body.email;
  console.log("req received");

  schedule.scheduleJob(
    {
      year: 2023,
      month: 10,
      date: 7,
      dayOfWeek: 6,
      hour: 3,
      minute: 3,
      tz: "Etc/GMT-5",
    },
    async () => {
      console.log("started");
      const includeSubitems =
        req.query.includeSubitems === "true" ? true : false;
      const includeUpdates = req.query.includeUpdates === "true" ? true : false;
      console.log("mid");
      const { boardName, columns, groups, items, statusColumns } =
        await getRequiredData(
          req.body.context,
          includeSubitems,
          includeUpdates
        );
      const html = generateHTML(
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
