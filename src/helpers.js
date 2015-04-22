var moment = require('moment');

module.exports = function (hbs) {
    hbs.registerHelper("JSON", function (val) {
        return JSON.stringify(val, null, 2);
    });

    hbs.registerHelper("date", function (val) {
        return moment(val).format("MM/DD/YYYY");
    });

    hbs.registerHelper("datetime", function (val) {
        return moment(val).format("MM/DD/YYYY HH:mm A");
    });

    hbs.registerHelper("form_input", function (options) {
        var params = options.hash,
            output = [];
        // Defaults
        if (params.type === "checkbox") {
            if (params.value === true) {
                params.value = " checked=\"checked\"";
            } else { params.value = ""; }
        } else if (params.value) { params.value = " value=\"" + params.value + "\"";
        } else { params.value = ""; }


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
        output.push("<input class=form-control type=" + params.type + " name=" + params.name + params.required + params.value + ">");
        output.push("</div>");
        // Return
        return output.join("");
    });

    hbs.registerHelper("form_textarea", function (options) {
        var params = options.hash,
            output = [];
        // Defaults
        if (!params.value) { params.value = ""; }
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
        output.push("<textarea class=form-control" + " name=" + params.name + params.required + ">");
        if (params.value) {
            output.push(params.value);
        }
        output.push("</textarea>");
        output.push("</div>");
        // Return
        return output.join("");
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
        return output.join("");
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
        return output.join("");
    });
};
