'use strict';

var mandrill        = require('mandrill-api/mandrill'),
    mandrill_client = new mandrill.Mandrill(process.env.MANDRILL_APIKEY),
    fs              = require('fs'),
    _               = require('lodash'),
    marked          = require('marked');

// For mailing.
marked.setOptions({
    gfm         : true,
    tables      : true,
    breaks      : true,
    smartLists  : true,
    smartypants : true
});

module.exports = {
    auth: function (req, res, next) {
        if (req.session && req.session.group) {
            next();
        } else {
            var message = "You're not authorized to visit this area, please log in.";
            console.error("User requested " + req.url + " and was not permitted by util.auth.");
            res.redirect('/register?message=' + message); // TODO: URL Encode?
        }
    },
    inGroup: function (req, res, next) {
        if (req.session && req.session.group &&
            (req.session.group._members.indexOf(req.params.id) !== -1 || req.session.isAdmin)) {
            next();
        } else {
            var message = "You're not authorized to visit this area, please log in.";
            console.error("User requested " + req.url + " and was not permitted by util.inGroup.");
            if (req.session && req.session.group) {
                console.error(req.session.group._members);
            }
            res.redirect('/register?message=' + message); // TODO: URL Encode?
        }
    },
    admin: function (req, res, next) {
        if (req.session && req.session.group && req.session.isAdmin) {
            next();
        } else {
            var message = "You're not an administrator, and thusly cannot do this action.";
            console.error("User requested " + req.url + " and was not permitted by util.admin.");
            res.redirect('/register?message=' + message); // TODO: URL Encode?
        }
    },
    /**
     * This is not a middleware. It sends email.
     * @param    {Object} group         The user session.
     * @param    {String} subject     The subject of the email.
     * @param    {String} file            The file path.
     * @param    {Array}    vars            Vars to include
     * @param    {Function} next
     */
    mail: function (group, subject, file, vars, next) {
        // https://mandrillapp.com/api/docs/messages.nodejs.html
        var content = fs.readFileSync(file, {encoding: 'UTF-8'});
        var message = {
            subject    : subject,
            html       : marked(content),
            text       : content,
            from_email : 'govcoordinator@bcaafc.com',
            from_name  : 'Gathering Our Voices',
            to: [{
                email : group.email,
                name  : group.name,
                type  : 'to'
            }, {
                email : 'govcoordinator@bcaafc.com',
                name  : 'Tara Skobel',
                type  : 'to'

            }],
            // http://help.mandrill.com/entries/21678522-How-do-I-use-merge-tags-to-add-dynamic-content-
            global_merge_vars: [{
                name    : 'group',
                content : group.affiliation
            }, {
                name    : 'name',
                content : group.name
            }, {
                name    : 'email',
                content : group.email
            }]
        };
        _.forEach(vars, function (variable) {
            message.global_merge_vars.push(variable);
        });
        mandrill_client.messages.send({message: message, async: false},
            function success(result) {
                next(null, result);
            }, function error(err) {
                next(err, null);
            });
    }
};
