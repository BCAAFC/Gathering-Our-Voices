'use strict';

var marked = require('marked');

module.exports = function (hbs) {

  // Shorthand.
  var escape = hbs.handlebars.Utils.escapeExpression;

  hbs.registerHelper("form_input", function (options) {
    // Not all form elements are consistent. This attempts to help with some basics.
    var title = String(options.hash.title),
        name = escape(options.hash.name),
        description = options.hash.description,
        type = escape(options.hash.type),
        required = Boolean(options.hash.required),
        value = null; // Done later.

    // A main concern here is that checkboxes don't use `value` but instead the `checked` attribute.
    // The below conditional checks this and makes `value` the correct output.
    if (type === `checkbox`) {
      // If a checkbox is ticked it shows the `checked='checked'` attribute.
      if (options.hash.value === true) {
        value = `checked='checked'`
      }
    } else {
      // If it's anything else it uses `value='foo'`.
      value = `value="${escape(options.hash.value)}"`
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
    var title = String(options.hash.title),
        name = escape(options.hash.name),
        description = options.hash.description, // Optional
        type = escape(options.hash.type),
        required = Boolean(options.hash.required),
        value = options.hash.value;

    return new hbs.handlebars.SafeString(`
      <div class='form-group'>
        <label for='${name}'>
          ${title} ${required? '*' : ''}
        </label>
        ${description? '<p>' + marked(description) + '</p>' : ''}
        <textarea class='form-control' name='${name}' ${required? 'required' : ''}>${value? value : ''}</textarea>
      </div>
    `);
  });

  hbs.registerHelper("form_select", function (options) {
    var title = String(options.hash.title),
        name = escape(options.hash.name),
        description = options.hash.description, // Optional
        multiple = Number(options.hash.multiple), // Size
        required = Boolean(options.hash.required),
        selected = options.hash.selected, // String or Array
        inner = options.fn(this);

    if (selected && !multiple) {
      inner = inner.replace(
        `value='${selected}'`,
        `value='${selected}' selected='selected'`
      );
      // Handle both.
      inner = inner.replace(
        `value="${selected}"`,
        `value="${selected}" selected='selected'`
      );
    } else if (selected && multiple) {
      selected.map(function (item) {
        inner = inner.replace(
          `value='${item}'`,
          `value='${item}' selected='selected'`
        );
        // Handle both.
        inner = inner.replace(
          `value="${item}"`,
          `value="${item}" selected='selected'`
        );
      });
    }

    return new hbs.handlebars.SafeString(`
      <div class='form-group'>
        <label for='${name}'>
          ${title} ${required? '*' : ''}
        </label>
        ${description? '<p>' + marked(description) + '</p>' : ''}
        ${multiple? '<p><small>To select multiple items, use the CONTROL or COMMAND key and click.</small></p>' : ''}
        <select class='form-control' name='${name}' ${required? 'required' : ''} ${multiple? 'multiple size='+multiple : ''}>
          ${inner}
        </select>
      </div>
    `);
  });

  hbs.registerHelper("form_tags", function (options) {
    var required = Boolean(options.hash.required),
        description = options.hash.description,
        name = escape(options.hash.name),
        title = String(options.hash.title),
        inner = options.fn(this);

    return new hbs.handlebars.SafeString(`
      <div class='form-group'>
        <label for='${name}'>
          ${title} ${required? '*' : ''}
        </label>
        ${description? '<p>' + marked(description) + '</p>' : ''}
        <select multiple data-role='tagsinput' class='form-control' name='${name}' ${required? 'required' : ''}>
          ${inner}
        </select>
      </div>
    `);
  });

  hbs.registerHelper("form_boolean", function (options) {
    var required = Boolean(options.hash.required),
        name = escape(options.hash.name),
        title = String(options.hash.title),
        description = options.hash.description, // Optional
        value = options.hash.value; // True / False / Null

    return new hbs.handlebars.SafeString(`
      <div class='form-group'>
        <label for='${name}'>
          ${title} ${required? '*' : ''}
        </label>
        ${description? '<p>' + marked(description) + '</p>' : ''}
        <div class='radio-inline'>
          <label>
            <input type='radio' name='${name}' ${required? 'required' : ''} value='Yes' ${value === true? "checked='checked'" : ''}>
            Yes
          </label>
        </div>
        <div class='radio-inline'>
          <label>
            <input type='radio' name='${name}' ${required? 'required' : ''} value='No' ${value === false? "checked='checked'" : ''}>
            No
          </label>
        </div>
      </div>
    `);
  });

  return hbs;
}
