const { default: axios } = require("axios");
const User = require("../models/User");
const { encryptToken } = require("../utils/encryptDecrypts");

exports.getUser = async (req, res) => {
  // find user if user is not found send user not found if found send api_key
  const id = req.query.user_id;
  const account_id = req.query.account_id;
  const user = await User.findOne({ id: id, account_id: account_id });
  if (user) {
    // console.log("user found");
    res.status(200).json({
      hasKey: true,
    });
  } else {
    // console.log("user found");
    res.status(200).json({
      hasKey: false,
    });
  }
};

exports.createUser = async (req, res) => {
  // create user

  const code = req.body.code;

  const url = `https://auth.monday.com/oauth2/token`;

  const response = await axios.post(url, {
    code: code,
    client_id: process.env.CLIENT_ID,
    client_secret: process.env.CLIENT_SECRET,
    redirect_uri: "https://xportpdfmonday.netlify.app/",
  });
  console.log("oauth done");

  let apiKey = response.data.access_token;
  console.log(apiKey);
  const { iv, encryptedApiKey } = encryptToken(response.data.access_token);
  console.log(iv, encryptedApiKey);

  const id = req.body.id;
  const account_id = req.body.account_id;

  console.log(`ID: ${id}, Account_ID: ${account_id}`);

  const user1 = await User.findOne({ id: id, account_id: account_id });

  if (user1) {
    user1.set({ apiKey: encryptedApiKey, iv: iv });
    await user1.save();
    res.json({
      message: `User updated with id ${id} and account id ${account_id}`,
    });
  } else {
    console.log(`New user with id ${id} and account_id ${account_id}`);
    const user = new User({
      id: id,
      account_id: account_id,
      apiKey: encryptedApiKey,
      iv: iv,
    });
    await user.save();
    res.json({
      message: `User created with id ${id} and account id ${account_id}`,
    });
  }
};
