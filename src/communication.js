"use strict";

var fs = require("fs"),
    marked = require("marked"),
    Promise = require("bluebird"),
    Handlebars = require("handlebars"),
    nodemailer = require("nodemailer"),
    mail_transport = nodemailer.createTransport(process.env.MAILGUN_CREDS);

// Use sync stuff here because it's easy and it only happens once at startup.
var templates = {}
fs.readdirSync("mails/").forEach(function (mail_template) {
    var template_name = mail_template.split(".")[0], // Name without .hbs
        content = fs.readFileSync("mails/" + mail_template, 'utf-8');
    templates[template_name] = Handlebars.compile(content);
});

module.exports = {
    mail: function mail(options) {
        if (process.env.MAILGUN_CREDS == "undefined") { // Env variables are strings. :S
            console.log("Attempted to mail, but no credentials were present.")
            return new Promise(function (resolve, reject) { return resolve(); });
        } else {
            // If we can!
            var to = options.to,
                from = options.from,
                cc = options.cc,
                title = options.title,
                template = options.template,
                variables = options.variables;
            if (!to || !from || !title || !template || !variables) {
                throw new Error("Incorrect mailing parameters");
            }
            var content = templates[template](variables);
            return mail_transport.sendMail({
                from: from,
                cc: cc,
                to: to,
                subject: title,
                html: content
            });
        }
    }
};
