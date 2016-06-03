'use strict';

var moment = require('moment');

module.exports = function (hbs) {

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
        return new hbs.handlebars.SafeString("<img class=\"" + classes + "\" src=\"/api/image/" + keyword + ".jpg\">");
    });

    hbs.registerHelper("flag", function (flag, flags, options) {
        var out;
        if (flags[flag] === null || flags[flag] === undefined) {
            out = "<a class=\"btn btn-default\" href=\"/admin/flag/" + flag + "/true\">Create: " + flag + "</a>";
        } else if (flags[flag] === true) {
            out = "<a class=\"btn btn-success\" href=\"/admin/flag/" + flag + "/" + !flags[flag] + "\">Unset:" + flag + "</a>";
        } else {
            out = "<a class=\"btn btn-danger\" href=\"/admin/flag/" + flag + "/" + !flags[flag] + "\">Set:" + flag + "</a>";
        }
        return new hbs.handlebars.SafeString(out);
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

    hbs.registerHelper("member-option", function (options) {
        var member = options.hash.member,
            session = options.hash.session,
            workshop = options.hash.workshop,
            note = "",
            disabled = false,
            conflict = null;
        if (workshop.audience.indexOf(member.type) === -1) {
            disabled = true;
            note = "(Ineligible Member Type)";
        } else if (member.complete === false) {
            disabled = true;
            note = "(Incomplete Member)";
        } else {
            // Might have a conflict.
            disabled = member.Sessions.some(function (val) {
                if (session.id === val.id) {
                    note = "(Already attending)";
                    return true;
                } else if (session.start < val.start && session.end < val.start) {
                    // Starts before, ends before.
                    return false;
                } else if (session.start > val.end && session.end > val.end) {
                    // Starts after, ends after.
                    return false;
                } else {
                    note = "(Conflict)";
                    conflict = val.WorkshopId;
                    return false;
                }
            });
        }
        if (disabled) { disabled = "disabled"; }
        if (conflict !== null) {
            conflict = "conflict=\"" + conflict + "\"";
        } else { conflict = ""; }

        return new hbs.handlebars.SafeString("<option "+disabled+" "+conflict+" name=member value="+member.id+">"+member.name+" "+note+"</option>");
    });

    hbs.registerHelper("if-in-session", function (options) {
        var member = options.hash.member,
            session = options.hash.session;
        if (member.Sessions.some(function (v) { return v.id === session.id; })) {
            return options.fn(this);
        }
    });

    return hbs;
}
