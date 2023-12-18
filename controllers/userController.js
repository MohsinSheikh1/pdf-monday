const { default: axios } = require("axios");
const User = require("../models/User");
const { encryptToken } = require("../utils/encryptDecrypts");
const logger = require("../utils/logger");
const jwt = require("jsonwebtoken");
const Account = require("../models/Account");

exports.getUser = async (req, res) => {
  //get User ip
  const ipware = require("ipware")().get_ip;
  const ipinfo = ipware(req);
  const ipaddress =
    ipinfo.clientIp !== "127.0.0.1" ? ipinfo.clientIp : "IP address not found";

  // find user if user is not found send user not found if found send api_key
  const id = req.query.user_id;
  const account_id = req.query.account_id;
  const user = await User.findOne({ id: id, account_id: account_id });

  if (user) {
    // console.log("user found");
    logger.log("info", `New user ${id} with account ${account_id}`, {
      account_id: account_id,
      user_id: id,
      ip_address: ipaddress,
    });
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
  //get User ip
  const ipware = require("ipware")().get_ip;
  const ipinfo = ipware(req);
  const ipaddress =
    ipinfo.clientIp !== "127.0.0.1" ? ipinfo.clientIp : "IP address not found";

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
  const { iv, encrypted } = encryptToken(response.data.access_token);
  console.log(iv, encrypted);

  const id = req.body.id;
  const account_id = req.body.account_id;

  console.log(`ID: ${id}, Account_ID: ${account_id}`);

  const user1 = await User.findOne({ id: id, account_id: account_id });

  if (user1) {
    user1.set({ apiKey: encrypted, iv: iv });
    await user1.save();
    res.json({
      message: `User updated with id ${id} and account id ${account_id}`,
    });
  } else {
    console.log(`New user with id ${id} and account_id ${account_id}`);
    const user = new User({
      id: id,
      account_id: account_id,
      apiKey: encrypted,
      iv: iv,
    });
    await user.save();
    logger.log("info", `New user ${id} with account ${account_id}`, {
      account_id: account_id,
      user_id: id,
      ip_address: ipaddress,
    });
    res.json({
      message: `User created with id ${id} and account id ${account_id}`,
    });
  }
};

exports.handleEvent = async function (req, res) {
  res.status(200).send({});

  const token = req.headers.authorization;
  const decoded = jwt.verify(token, process.env.CLIENT_SECRET);

  if (decoded) {
    const type = req.body.type;
    if (type == "uninstall") {
      //code to remove user data
    } else if (type == "install") {
      //code for install
    } else if (type == "app_subscription_changed") {
      //code for app subscription changed
    } else if (type == "app_subscription_renewed") {
      //code for app subscription renewed
    } else if (type == "app_subscription_cancelled_by_user") {
      //code for app subscription cancelled by user (paid period is not ended)
    } else if (type == "app_subscription_cancelled") {
      //code for app subscription cancelled (paid period is ended)
    } else if (type == "app_subscription_cancellation_revoked_by_user") {
      //code for app subscription cancelled revoked by user
    } else if (type == "app_trial_subscription_started") {
      //code for app subscription trial started
    } else if (type == "app_trial_subscription_ended") {
      //code for app subscription trial ended
    } else if (type == "app_subscription_created") {
      //code for app subscription created (new)

      //getting subscription attributes
      const account_id = req.body.data.account_id;
      const { plan_id, renewal_date } = req.body.data.subscription;
      let exports_remaining;
      //Create a new account
      if (plan_id === "1001") {
        exports_remaining = 30;
      } else if (plan_id === "1002") {
        exports_remaining = 70;
      } else if (plan_id === "1002") {
        exports_remaining = 100;
      }
      const account = new Account({
        account_id,
        plan_id,
        renewal_date,
        exports_remaining,
      });
      await account.save();
    }
  }
};
