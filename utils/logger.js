const { createLogger, transports, format } = require("winston");
require("winston-mongodb");

const logger = createLogger({
  transports: [
    // new transports.MongoDB({
    //   level: "info",
    //   db: process.env.MONGO_URI,
    //   format: format.combine(format.timestamp(), format.json()),
    //   collection: "logs",
    // }),
    new transports.Console({
      format: format.combine(format.timestamp(), format.json()),
    }),
  ],
});

module.exports = logger;
