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
    res.status(404).json({
      hasKey: false,
    });
  }
};

exports.createUser = async (req, res) => {
  // create user if user is created send api_key
  console.log(req.params.code);
  console.log(req.params.state);
  // const id = req.body.id;
  // const apiKey = req.body.apiKey;
  // const user = new User({
  //   id: id,
  //   apiKey: apiKey,
  // });
  // await user.save();
  // res.send(apiKey);
};
