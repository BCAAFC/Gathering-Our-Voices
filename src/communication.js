"use strict";

var fs = require("fs"),
    marked = require("marked"),
    Promise = require("bluebird"),
    mandrill = require("mandrill-api/mandrill"),
    mandrill_client = new mandrill.Mandrill(process.env.MANDRILL_APIKEY);

var readFile = Promise.promisify(fs.readFile);

module.exports = {
    mail: function mail(options) {
        console.log(process.env.MANDRILL_APIKEY);
        console.log(!process.env.MANDRILL_APIKEY);
        console.log(typeof process.env.MANDRILL_APIKEY);
        console.log(process.env.MANDRILL_APIKEY == "undefined");
        if (process.env.MANDRILL_APIKEY == "undefined") {
            console.log("To: " + options.to[0].email);
            console.log("From: " + options.from.email);
            console.log("CC: " + options.cc[0].email);
            console.log("Title: " + options.title);
            return new Promise(function (resolve, reject) { return resolve(); });
        } else {
            // If we can!
            var to = options.to,
                from = options.from,
                cc = options.cc,
                title = options.title,
                file = options.file,
                variables = options.variables;
            if (!to || !from || !cc || !title || !file || !variables) {
                throw new Error("Incorrect mailing parameters");
            }
            return readFile("mails/" + file + ".hbs", "UTF-8").then(function (contents) {
                return new Promise(function (resolve, reject) {
                    mandrill_client.messages.send({
                        message: {
                            subject: "[GOV2016] " + title,
                            html: contents,
                            from_email: from.email,
                            from_name: from.name,
                            // [{ email: $EMAIL, name: $NAME, }]
                            to: to,
                            cc: cc,
                            merge: true,
                            merge_language: "handlebars",
                            // [{ name: $NAME, content: $CONTENT, }]
                            global_merge_vars: variables,
                        },
                        async: false,
                    }, function (result) {
                        resolve();
                    }, function (error) {
                        console.log(error);
                        reject(error);
                    });
                });
            });
        }
    }
};
