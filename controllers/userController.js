const { default: axios } = require("axios");
const User = require("../models/User");
const { encryptToken } = require("../utils/encryptDecrypts");
const logger = require("../utils/logger");
const jwt = require("jsonwebtoken");
const Account = require("../models/Account");

exports.getUser = async (req, res) => {
  /*
  - This function is to check if there is a user with a specific account id
  - If user exists then we already have his api key
  - Send response back that user has api key
  */
  //get User ip
  const ipware = require("ipware")().get_ip;
  const ipinfo = ipware(req);
  const ipaddress =
    ipinfo.clientIp !== "127.0.0.1" ? ipinfo.clientIp : "IP address not found";

  // find user if user is not found send user not found if found send user has api_key
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
  /* 
  - This function is to create a user with a specific account
  - The function also implements oauth, to get the api_key of the user
  */

  //get User ip
  const ipware = require("ipware")().get_ip;
  const ipinfo = ipware(req);
  const ipaddress =
    ipinfo.clientIp !== "127.0.0.1" ? ipinfo.clientIp : "IP address not found";

  //perform oauth
  const code = req.body.code;

  const url = `https://auth.monday.com/oauth2/token`;

  const response = await axios.post(url, {
    code: code,
    client_id: process.env.CLIENT_ID,
    client_secret: process.env.CLIENT_SECRET,
    redirect_uri: "https://xportpdfmonday.netlify.app/",
  });

  //encrypt usere api token
  const { iv, encrypted } = encryptToken(response.data.access_token);

  //get parameters of user
  const id = req.body.id;
  const account_id = req.body.account_id;

  //check if user exists
  const user1 = await User.findOne({ id: id, account_id: account_id });

  //if user exists update the user else create a new user
  if (user1) {
    user1.set({ apiKey: encrypted, iv: iv });
    await user1.save();
    res.json({
      message: `User updated with id ${id} and account id ${account_id}`,
    });
  } else {
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
  /* 
  - This function is used to handle various life cycle events of monday app.
  */
  console.log("webhook received");
  res.status(200).send({});

  const token = req.headers.authorization;
  const decoded = jwt.verify(token, process.env.CLIENT_SECRET);

  if (decoded) {
    const type = req.body.type;
    if (type == "uninstall") {
      /* 
      - App has been uninstalled by a user on an account.
      - Delete all of the users info from that account.
      */
      const account_id = req.body.data.account_id;
      const id = req.body.data.user_id;
      const user = await User.deleteMany({ account_id });

      if (user.acknowledged) {
        logger.log(
          "info",
          `User ${id} on account ${account_id} uninstalled the app.`,
          {
            account_id: account_id,
            user_id: id,
            ip_address: "IP address not found",
          }
        );
      } else {
        console.log("No users found");
      }
    } else if (type == "install") {
      /* 
      - User installs our app on an account.
      - Create a new Account Object for that particular account_id
      */
      console.log("install webhook started");
      const account_id = req.body.data.account_id;
      const account = await Account.findOne({ account_id: account_id });

      if (!account) {
        const account = new Account({
          account_id: account_id,
        });
        await account.save();
        logger.log("info", `New account ${account_id}`, {
          account_id: account_id,
        });
      } else {
        console.log("Account exists");
      }
    }
    // else if (type == "app_subscription_changed") {
    //   //Account has changed our subscription type

    //   //get the account
    //   const account_id = req.body.data.account_id;
    //   const account = Account.findOne({ account_id: account_id });

    //   //get new subscription data
    //   const { plan_id, renewal_date } = req.body.data.subscription;

    //   //update the account with new info
    //   if (account) {
    //     let new_exports;

    //     if (plan_id === "1001") {
    //       new_exports = "30";
    //     } else if (plan_id === "1002") {
    //       new_exports = "70";
    //     } else if (plan_id === "1003") {
    //       new_exports = "100";
    //     }

    //     account.set({
    //       plan_id,
    //       renewal_date,
    //       exports_remaining: new_exports,
    //     });

    //     await account.save();

    //     logger.log(
    //       "info",
    //       `User ${decoded.dat.user_id} on account ${account_id} changed subscription.`,
    //       {
    //         account_id: account_id,
    //         user_id: decoded.dat.user_id,
    //         ip_address: "IP address not found",
    //       }
    //     );
    //   }
    // } else if (type == "app_subscription_renewed") {
    //   //code for app subscription renewed

    //   //find the account
    //   const account_id = req.body.data.account_id;
    //   const account = Account.findOne({ account_id: account_id });

    //   //get subscription data
    //   const { plan_id, renewal_date } = req.body.data.subscription;

    //   if (account) {
    //     if (plan_id == "1001") {
    //       account.set({
    //         plan_id,
    //         renewal_date,
    //         exports_remaining: 30,
    //       });
    //     } else if (plan_id == "1002") {
    //       account.set({
    //         plan_id,
    //         renewal_date,
    //         exports_remaining: 70,
    //       });
    //     } else if (plan_id == "1003") {
    //       account.set({
    //         plan_id,
    //         renewal_date,
    //         exports_remaining: 100,
    //       });
    //     }
    //     await account.save();
    //   }
    // } else if (type == "app_subscription_cancelled_by_user") {
    //   //code for app subscription cancelled by user (paid period is not ended)
    // } else if (type == "app_subscription_cancelled") {
    //   //code for app subscription cancelled (paid period is ended)

    //   //here we delete the account
    //   const account_id = req.body.data.account_id;
    //   await Account.deleteOne({ account_id });
    // } else if (type == "app_subscription_cancellation_revoked_by_user") {
    //   //code for app subscription cancelled revoked by user
    // } else if (type == "app_trial_subscription_started") {
    //   //code for app subscription trial started
    //   const account_id = req.body.data.account_id;
    //   const { plan_id, renewal_date } = req.body.data.subscription;
    //   const exports_remaining = 20;

    //   const account = Account.findOne({ account_id: account_id });
    //   if (!account) {
    //     const account = new Account({
    //       account_id,
    //       plan_id,
    //       renewal_date,
    //       exports_remaining,
    //     });
    //     await account.save();
    //   }

    //   logger.log(
    //     "info",
    //     `User ${decoded.dat.user_id} on account ${account_id} started trial.`,
    //     {
    //       account_id: account_id,
    //       user_id: decoded.dat.user_id,
    //       ip_address: "IP address not found",
    //     }
    //   );
    // } else if (type == "app_trial_subscription_ended") {
    //   //code for app subscription trial ended
    //   const account_id = req.body.data.account_id;
    //   const { plan_id, renewal_date } = req.body.data.subscription;
    //   const exports_remaining = 0;
    //   let accountData = await Account.findOneAndUpdate(
    //     { account_id },
    //     {
    //       plan_id,
    //       renewal_date,
    //       exports_remaining,
    //     }
    //   );
    //   if (!accountData) {
    //     const account = new Account({
    //       account_id,
    //       plan_id,
    //       renewal_date,
    //       exports_remaining,
    //     });
    //     await account.save();
    //   }
    //   logger.log("info", `Trial expired for account ${account_id}`);
    // } else if (type == "app_subscription_created") {
    //   //code for app subscription created (new)

    //   //getting subscription attributes
    //   const account_id = req.body.data.account_id;
    //   const { plan_id, renewal_date } = req.body.data.subscription;
    //   let exports_remaining;
    //   //Create a new account
    //   if (plan_id === "1001") {
    //     exports_remaining = 30;
    //   } else if (plan_id === "1002") {
    //     exports_remaining = 70;
    //   } else if (plan_id === "1002") {
    //     exports_remaining = 100;
    //   }

    //   const account = Account.findOne({ account_id });

    //   if (account) {
    //     account.set({
    //       plan_id,
    //       renewal_date,
    //       exports_remaining,
    //     });
    //     await account.save();
    //   } else {
    //     //if there was no trial before
    //     const account = new Account({
    //       account_id,
    //       plan_id,
    //       renewal_date,
    //       exports_remaining,
    //     });
    //     await account.save();
    //   }
    // }
  }
};
