exports.encryptToken = function (token) {
  const crypto = require("crypto");
  const iv = crypto.randomBytes(16).toString("hex").substring(0, 16);
  const cipher = crypto.createCipheriv(
    "aes-256-cbc",
    process.env.CLIENT_SECRET,
    iv
  );
  let encrypted = cipher.update(token, "utf-8", "hex");
  encrypted += cipher.final("hex");

  return {
    iv,
    encrypted,
  };
};

exports.decryptToken = function (token, iv) {
  const crypto = require("crypto");
  const decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    process.env.CLIENT_SECRET,
    iv
  );

  let decrypted = decipher.update(token, "hex", "utf-8");
  decrypted += decipher.final("utf-8");

  return decrypted;
};
