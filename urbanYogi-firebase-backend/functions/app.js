
  module.exports = (app) => {
    require("./donation.js")(app);
    require("./payment.js")(app);
    require("./mailer.js")(app);
    require("./subscription.js")(app);
    require("./stripe_payout.js")(app);

  }