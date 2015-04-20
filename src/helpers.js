module.exports = function (hbs) {
    hbs.registerHelper("JSON", function (val) {
        return JSON.stringify(val, null, 2);
    });
    hbs.registerHelper("form_input", function (options) {
        var params = options.hash,
            output = [];
        // Defaults
        if (!params.value) { params.value = ""; }
        if (params.required) { params.required = " required"; }
        else { params.required = ""; }
        // Build
        output.push("<div class=form-group>");
        output.push("<label for=" + params.name + ">" + params.title + "</label>");
        if (params.description) {
            output.push("<p>" + params.description + "</p>");
        }
        output.push("<input class=form-control type=" + params.type + " name=" + params.name + params.required + " value=\"" + params.value + "\">");
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
        // Build
        output.push("<div class=form-group>");
        output.push("<label for=" + params.name + ">" + params.title + "</label>");
        if (params.description) {
            output.push("<p>" + params.description + "</p>");
        }
        output.push("<select class=form-control name=" + params.name + " " + params.required + ">");
        // Selected Worker
        var child = options.fn(this);
        if (params.selected) {
            child = child.replace(
                "<option>" + params.selected + "</option>",
                "<option selected='selected'>" + params.selected + "</option>"
            );
        }
        output.push(child);
        // Closes
        output.push("</select>");
        output.push("</div>");
        // Return
        return output.join("");
    });
};
