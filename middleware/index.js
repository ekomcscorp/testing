// AGGREGATE MIDDLEWARE

module.exports = {
    auth: require("./auth"),
    injectUser: require("./injectUser"),
    loadSidebar: require("./loadSidebar"),
    loadNotification: require("./loadNotification"),
  };