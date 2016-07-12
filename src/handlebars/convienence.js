'use strict';

var moment = require('moment');

module.exports = function (hbs) {
  hbs.registerHelper("eq", function (val, check, options) {
    if (val === check) {
      return options.fn(this);
    } else {
      return;
    }
  });

  hbs.registerHelper("JSON", function (val, indent) {
    return JSON.stringify(val, null, indent);
  });

  hbs.registerHelper("percent", function (dividend, divisor) {
    return new hbs.handlebars.SafeString((dividend / divisor) * 100);
  });

  hbs.registerHelper("initialize", function (val) {
    var tokens = val.split(" ");
    if (tokens.length > 1) {
      tokens[tokens.length - 1] = tokens[tokens.length - 1][0] + ".";
    }
    return tokens.join(" ");
  });

  hbs.registerHelper("date", function (val, options) {
    var formatting = options.hash.formatting || 'MM/DD/YYYY';
    if (!val) {
      return "";
    } else {
      return new hbs.handlebars.SafeString(moment(val).format(formatting));
    }
  });

  hbs.registerHelper("label-list", function (list) {
    return list.map(function (item) {
      return "<span class=\"label label-default\">"+ hbs.handlebars.Utils.escapeExpression(item) +"</span>";
    }).join(' ');
  });

  hbs.registerHelper("stringify-list", function (list) {
    if (list.length > 2) {
      list[list.length-1] = "and " + list[list.length-1]
      return list.join(", ");
    } else if (list.length === 2) {
      return list.join(" and ")
    } else {
      return String(list);
    }
  });

  return hbs;
}
