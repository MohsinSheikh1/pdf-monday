const puppeteer = require("puppeteer");

async function generatePDF(html) {
  const browser = await puppeteer.launch({
    executablePath:
      process.env.NODE_ENV == "production"
        ? process.env.PUPPETEER_EXECUTABLE_PATH
        : puppeteer.executablePath(),
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--single-process",
      "--no-zygote",
    ],
  });

  const page = await browser.newPage();

  await page.setContent(html);

  await page.emulateMediaType("screen");

  const pdf = await page.pdf({
    format: "A2",
    printBackground: true,
  });

  await browser.close();

  return pdf;
}

module.exports = { generatePDF };
