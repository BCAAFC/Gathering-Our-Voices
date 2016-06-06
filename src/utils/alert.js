'use strict';

module.exports = {
  error: function error(req, message) {
    req.session.alert = {
      type: "danger",
      message: message,
    };
    return;
  },
  success: function success(req, message) {
    req.session.alert = {
      type: "success",
      message: message,
    };
    return;
  },
};
