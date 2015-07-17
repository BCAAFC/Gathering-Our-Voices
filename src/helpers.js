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

    hbs.registerHelper("date", function (val) {
        if (!val) { return ""; }
        else { return moment(val).format("MM/DD/YYYY"); }
    });

    hbs.registerHelper("datetime", function (val) {
        if (!val) { return ""; }
        else { return moment(val).format("MM/DD/YYYY HH:mm A"); }
    });
    hbs.registerHelper("time", function (val) {
        if (!val) { return ""; }
        else { return moment(val).format("HH:mm A"); }
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
        if (params.type === "number") {
            output.push("<p><small>This input will only accept numeric values.</small></p>");
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

        return output.join("");
    });

    hbs.registerHelper("balance", function (account, options) {
        var total = 0;
        if (account.Group && account.Group.Members) {
            total += account.Group.Members.reduce(function (acc, item) {
                return acc + item.cost;
            }, 0);
        }
        if (account.Exhibitor) {
            total += account.Exhibitor.cost;
        }
        if (account.Payments) {
            total -= account.Payments.reduce(function (acc, item) {
                return acc + item.amount;
            }, 0);
        }
        return total;
    });

    hbs.registerHelper("img", function (classes, keyword, options) {
        return "<img class=\"" + classes + "\" src=\"/api/image/" + keyword + ".jpg\">";
    });

    hbs.registerHelper("flag", function (flag, flags, options) {
        if (flags[flag] === null || flags[flag] === undefined) {
            return "<a class=\"btn btn-default\" href=\"/admin/flag/" + flag + "/true\">Create: " + flag + "</a>";
        } else if (flags[flag] === true) {
            return "<a class=\"btn btn-success\" href=\"/admin/flag/" + flag + "/" + !flags[flag] + "\">Unset:" + flag + "</a>";
        } else {
            return "<a class=\"btn btn-danger\" href=\"/admin/flag/" + flag + "/" + !flags[flag] + "\">Set:" + flag + "</a>";
        }
    });

    hbs.registerHelper("count", function (options) {
        var params = options.hash;
        if (!params.set || !params.field || !params.value) { return "Malform params."; }
        return String(params.set.reduce(function (acc, item) {
            if (item[params.field] === params.value) {
                return acc+1;
            } else {
                return acc;
            }
        }, 0));
    });

    hbs.registerHelper("label-list", function (list) {
        return list.map(function (item) {
            return "<span class=\"label label-default\">"+item+"</span>";
        }).join(' ');
    });

    hbs.registerHelper("member-option", function (options) {
        var member = options.hash.member,
            session = options.hash.session,
            workshop = options.hash.workshop,
            note = "",
            disabled = false;
        if (workshop.audience.indexOf(member.type) === -1) {
            disabled = true;
            note = "(Ineligible)";
        } else if (member.complete === false) {
            disabled = true;
            note = "(Incomplete)";
        } else {
            // Might have a conflict.
            disabled = member.Sessions.some(function (val) {
                if (session.id === val.id) {
                    note = "(Already attending)"
                    return true;
                } else if (session.start < val.start && session.end < val.start) {
                    // Starts before, ends before.
                    return false;
                } else if (session.start > val.end && session.end > val.end) {
                    // Starts after, ends after.
                    return false;
                } else {
                    note = "(Conflict)";
                    return true;
                }
            });
        }
        if (disabled) { disabled = "disabled"; }
        return "<option "+disabled+" name=member value="+member.id+">"+member.name+" "+note+"</option>";
    });

    hbs.registerHelper("if-in-session", function (options) {
        var member = options.hash.member,
            session = options.hash.session;
        if (member.Sessions.some(function (v) { return v.id === session.id; })) {
            return options.fn(this);
        }
    });

};
