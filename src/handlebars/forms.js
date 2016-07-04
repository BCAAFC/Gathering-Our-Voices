'use strict';

var marked = require('marked');

module.exports = function (hbs) {

  // Shorthand.
  var escape = hbs.handlebars.Utils.escapeExpression;

  hbs.registerHelper("form_input", function (options) {
    // Not all form elements are consistent. This attempts to help with some basics.
    var title = escape(options.hash.title),
        name = escape(options.hash.name),
        description = options.hash.description,
        type = options.hash.type,
        required = options.hash.required,
        value = null;

    // A main concern here is that checkboxes don't use `value` but instead the `checked` attribute.
    // The below conditional checks this and makes `value` the correct output.
    if (type === `checkbox`) {
      // If a checkbox is ticked it shows the `checked='checked'` attribute.
      if (options.hash.value === true) {
        value = `checked='checked'`
      }
    } else {
      // If it's anything else it uses `value='foo'`.
      value = `value=${escape(options.hash.value)}`
    }

    return new hbs.handlebars.SafeString(`
      <div class='form-group'>
        <label for='${name}'>
          ${title} ${required? '*' : ''}
        </label>
        ${description? '<p>' + marked(description) + '</p>' : ''}
        ${type === 'number'? '<p><small>This input will only accept numeric values.</small></p>' : ''}
        <input class='form-control' type='${type}' name='${name}' ${required? 'required' : ''} ${value}>
      </div>
    `);
  });

  hbs.registerHelper("form_textarea", function (options) {
    var title = escape(options.hash.title),
        name = escape(options.hash.name),
        description = escape(options.hash.description),
        type = escape(options.hash.type),
        required = options.hash.required,
        value = escape(options.hash.value);

    return new hbs.handlebars.SafeString(`
      <div class='form-group'>
        <label for='${name}'>
          ${title} ${required? '*' : ''}
        </label>
        ${description? '<p>' + marked(description) + '</p>' : ''}
        <textarea class='form-control' name='${name}' ${required? 'required' : ''}>${value}</textarea>
      </div>
    `);
  });

  hbs.registerHelper("form_select", function (options) {
    var params = options.hash,
    output = [];
    // Defaults
    if (params.required) { params.required = " required"; }
    else { params.required = ""; }
    if (params.multiple) { params.multiple = " multiple size=" + params.multiple; }
    else { params.multiple = ""; }
    // Build
    output.push("<div class=form-group>");
    output.push("<label for=" + params.name + ">" + params.title);
    if (params.required) { output.push("*"); }
    output.push("</label>");
    if (params.description) {
      output.push("<p>" + params.description + "</p>");
    }
    if (params.multiple) {
      output.push("<p><small>To select multiple items, use the CONTROL or COMMAND key and click.</small></p>");
    }
    output.push("<select class=form-control name=" + params.name + " " + params.required + params.multiple + ">");
    // Selected Worker
    var child = options.fn(this);
    if (params.selected && !params.multiple) {
      child = child.replace(
        "value=\"" + params.selected + "\"",
        "value=\"" + params.selected + "\" selected='selected'"
      );
    } else if (params.selected && params.multiple) {
      params.selected.map(function (item) {
        child = child.replace(
          "value=\"" + item + "\"",
          "value=\"" + item + "\" selected='selected'"
        );
      });
    }
    output.push(child);
    // Closes
    output.push("</select>");
    output.push("</div>");
    // Return
    return new hbs.handlebars.SafeString(output.join(""));
  });

  hbs.registerHelper("form_tags", function (options) {
    var params = options.hash,
    output = [];
    // Defaults
    if (params.required) { params.required = " required"; }
    else { params.required = ""; }
    // Build
    output.push("<div class=form-group>");
    output.push("<label for=" + params.name + ">" + params.title);
    if (params.required) { output.push("*"); }
    output.push("</label>");
    if (params.description) {
      output.push("<p>" + params.description + "</p>");
    }
    output.push("<select multiple data-role=\"tagsinput\" class=form-control name=" + params.name + " " + params.required + ">");
    output.push(options.fn(this));
    // Closes
    output.push("</select>");
    output.push("</div>");
    // Return
    return new hbs.handlebars.SafeString(output.join(""));
  });

  hbs.registerHelper("form_boolean", function (options) {
    var params = options.hash,
    output = [];
    // Defaults
    if (params.required) { params.required = " required"; }
    else { params.required = ""; }
    // Build
    output.push("<div class=form-group>");
    output.push("<label for=" + params.name + ">" + params.title);
    if (params.required) { output.push("*"); }
    output.push("</label>");
    if (params.description) {
      output.push("<p>" + params.description + "</p>");
    }
    // Radios
    if (params.value === true) {
      output.push("<div class=\"radio-inline\"><label>" +
      "<input type=\"radio\" name=\"" + params.name + "\" value=\"Yes\" checked=\"checked\"" + params.required + ">" +
      "Yes" +
      "</label></div>");
      output.push("<div class=\"radio-inline\"><label>" +
      "<input type=\"radio\" name=\"" + params.name + "\" value=\"No\"" + params.required + ">" +
      "No" +
      "</label></div>");
    } else if (params.value === false) {
      output.push("<div class=\"radio-inline\"><label>" +
      "<input type=\"radio\" name=\"" + params.name + "\" value=\"Yes\"" + params.required + ">" +
      "Yes" +
      "</label></div>");
      output.push("<div class=\"radio-inline\"><label>" +
      "<input type=\"radio\" name=\"" + params.name + "\" value=\"No\" checked=\"checked\"" + params.required + ">" +
      "No" +
      "</label></div>");
    } else {
      output.push("<div class=\"radio-inline\"><label>" +
      "<input type=\"radio\" name=\"" + params.name + "\" value=\"Yes\"" + params.required + ">" +
      "Yes" +
      "</label></div>");
      output.push("<div class=\"radio-inline\"><label>" +
      "<input type=\"radio\" name=\"" + params.name + "\" value=\"No\"" + params.required + ">" +
      "No" +
      "</label></div>");
    }
    output.push("</div>");

    return new hbs.handlebars.SafeString(output.join(""));
  });

  return hbs;
}
