const { default: axios } = require("axios");
const User = require("../models/User");

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
  client_id = process.env.CLIENT_ID;
  client_secret = process.env.CLIENT_SECRET;

  const code = req.body.code;
  // console.log(code);

  const url = `https://auth.monday.com/oauth2/token`;

  const response = await axios.post(url, {
    code: code,
    client_id: client_id,
    client_secret: client_secret,
  });

  const apiKey = response.data.access_token;
  console.log(apiKey);

  const id = req.body.id;
  const account_id = req.body.account_id;

  console.log(`ID: ${id}, Account_ID: ${account_id}`);

  const user1 = await User.findOne({ id: id, account_id: account_id });

  if (user1) {
    user1.set({ apiKey: apiKey });
    await user1.save();
    res.json({
      message: `User updated with id ${id}`,
    });
  } else {
    console.log(`New user with id ${id} and account_id ${account_id}`);
    const user = new User({
      id: id,
      account_id: account_id,
      apiKey: apiKey,
    });
    await user.save();
    res.json({
      message: `User created with id ${id}`,
    });
  }
};
