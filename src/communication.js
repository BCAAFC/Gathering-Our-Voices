"use strict";

var fs = require("fs"),
    marked = require("marked"),
    Promise = require("bluebird"),
    mandrill = require("mandrill-api/mandrill"),
    mandrill_client = new mandrill.Mandrill(process.env.MANDRILL_APIKEY);

var readFile = Promise.promisify(fs.readFile);

module.exports = {
    mail: function mail(options) {
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
                    reject(error);
                });
            });
        });
    }
}
