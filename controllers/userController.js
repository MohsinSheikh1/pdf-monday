const { default: axios } = require("axios");
const User = require("../models/User");

exports.getUser = async (req, res) => {
  // find user if user is not found send user not found if found send api_key
  const id = req.params.id;
  const user = await User.findOne({ id: id });
  if (user) {
    res.status(200).json({
      hasKey: true,
    });
  } else {
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

  const url = `https://auth.monday.com/oauth2/token`;

  const response = await axios.post(url, {
    code: code,
    client_id: client_id,
    client_secret: client_secret,
  });

  const apiKey = response.data.access_token;

  const id = req.body.id;

  const user1 = await User.findOne({ id: id });

  if (user1) {
    user1.set({ apiKey: apiKey });
    await user1.save();
    res.json({
      message: `User created with id ${id}`,
    });
  } else {
    const user = new User({
      id: id,
      apiKey: apiKey,
    });
    await user.save();
    res.json({
      message: `User updated with id ${id}`,
    });
  }
};
