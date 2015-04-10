'use strict';

var async = require('async'),
      _ = require('lodash'),
      Facilitator = require('../schema/Facilitator'),
      util        = require('./util');

module.exports = function(data) {
    var router = require('express').Router();

    router.get('/facilitator', function (req, res) {
        res.render('facilitator-application', {
            title    : "Facilitator Application",
            session  : req.session,
            lastForm : req.session.lastForm || {}
        });
    });

    /**
     * Parses a form into a JSON that matches a facilitator.
     * @param {Object} facilitator
     */
    function facilitatorParser(body) {
        var audience = [],
            type = [];
        _.forEach(['youth', 'youngAdult', 'chaperone'], function (val) {
            if (body['audience-' + val]) { audience.push(val); }
        });
        _.forEach(['presentation', 'exercise', 'roleplay', 'qa', 'other'], function (val) {
            if (body['type-' + val]) { type.push(val); }
        });
        return {
            name             : body.name,
            affiliation      : body.affiliation,
            phone            : body.phone,
            fax              : body.fax,
            email            : body.email,
            mailing          : body.mailing,
            workshop         : body.workshop,
            length           : body.length,
            category         : body.category,
            categoryReason   : body.categoryReason,
            audience         : audience,
            type             : type,
            description      : body.description,
            summary          : body.summary,
            interactionLevel : body.interactionLevel,
            equipment        : {
                flipchart : (body['equipment-flipchart'])? (body['equipment-flipchartNumber'] || 1) : 0,
                projector : (body['equipment-projector'] === 'on'),
                screen    : (body['equipment-screen'] === 'on'),
                player    : (body['equipment-player'] === 'on')
            },
            roomRequirement : body.roomRequirement,
            capacity        : body.capacity,
            biography       : body.biography,
            compensation    : {
                meal          : (body['compensation-meal'] === 'on'),
                accommodation : (body['compensation-accommodation'] === 'on'),
                travel        : (body['compensation-travel'])? (body['compensation-travelAmount'] || 'Marked, but unspecified') : '',
                honorarium    : (body['compensation-honorarium'])? (body['compensation-honorariumAmount'] || 'Marked, but unspecified') : ''
            },
            notes            : body.notes,
        };
    }

    router.route('/facilitator')
        .post(function (req, res) {
            Facilitator.create(facilitatorParser(req.body), function (err, facilitator) {
                var message;
                if (err) {
                    req.session.lastForm = req.body;
                    message              = "Something went wrong, sorry! Did you forget a field? All are required. Is your 'Capacity' a word? It must be a number! If you're still struggling, please call us. **Note: You can just hit the 'Back' button in your browser and you will not loose your data in the form.";
                    res.redirect('/facilitator?message=' + message);
                } else {
                    req.session.lastForm = {};
                    message              = "Thank you for your facilitator application for Gathering Our Voices 2015. Workshop Selection will occur in early December and you should be notified about the status of your application by mid-December 2015. If you have any questions or require any further information please contact Gregory Forsberg at gatheringourvoices@bcaafc.com or 1-800-990-2432.";
                    res.redirect('/?message=' + message);
                    // Send an email to Greg.
                    util.mail({
                        email: 'gatheringourvoices@bcaafc.com',
                        name: 'Greg Forsberg',
                        affiliation: 'BCAAFC'
                    }, 'GOV2015 New Facilitator Application', './mails/facilitator.md', [{
                        name: 'workshop',
                        content: facilitator.workshop
                    }], function (err, result) {
                        if (err) {
                            console.log(err);
                        }
                        return; // Discard.
                    });
                }
            });
        })
        .put(util.admin, function (req, res) {
            if (!req.body.id) { return; } // ignore it.
            Facilitator.findByIdAndUpdate(req.body.id, facilitatorParser(req.body)).exec(function (err, facilitator) {
                if (!err && facilitator) {
                    res.redirect('/admin/facilitators?message=Success!');
                } else {
                    res.send('There was an odd error, sorry.');
                }
            });
        });

    router.route('/facilitator/:id')
        .get(util.admin, function (req, res) {
            Facilitator.findById(req.params.id).exec(function (err, facilitator) {
                if (!err && facilitator) {
                    var form = {
                        "_id"              : facilitator._id,
                        "name"             : facilitator.name,
                        "affiliation"      : facilitator.affiliation,
                        "phone"            : facilitator.phone,
                        "fax"              : facilitator.fax,
                        "email"            : facilitator.email,
                        "mailing"          : facilitator.mailing,
                        "workshop"         : facilitator.workshop,
                        "length"           : facilitator.length,
                        "category"         : facilitator.category,
                        "categoryReason"   : facilitator.categoryReason,
                        /* Parse out Audience */
                        "audience-youth"       : (facilitator.audience.indexOf('youth') !== -1)? 'on' : 'off',
                        "audience-youngAdult"  : (facilitator.audience.indexOf('youngAdult') !== -1)? 'on' : 'off',
                        "audience-chaperone"   : (facilitator.audience.indexOf('chaperone') !== -1)? 'on' : 'off',
                        /* Parse out Type */
                        "type-presentation" : (facilitator.type.indexOf('presentation') !== -1)? 'on' : 'off',
                        "type-exercise"     : (facilitator.type.indexOf('exercise') !== -1)? 'on' : 'off',
                        "type-roleplay"     : (facilitator.type.indexOf('roleplay') !== -1)? 'on' : 'off',
                        "type-qa"           : (facilitator.type.indexOf('qa') !== -1)? 'on' : 'off',
                        "type-other"        : (facilitator.type.indexOf('other') !== -1)? 'on' : 'off',
                        /* */
                        "description"      : facilitator.description,
                        "summary"          : facilitator.summary,
                        "interactionLevel" : facilitator.interactionLevel,
                        /* Parse out Equipment */
                        "equipment-flipchart"       : (facilitator.equipment.flipchart > 0)? 'on' : 'off',
                        "equipment-flipchartNumber" : facilitator.equipment.flipchart,
                        "equipment-projector"       : facilitator.equipment.projector? 'on' : 'off',
                        "equipment-screen"          : facilitator.equipment.screen? 'on' : 'off',
                        "equipment-player"          : facilitator.equipment.player? 'on' : 'off',
                        /* */
                        "roomRequirement" : facilitator.roomRequirement,
                        "capacity"        : facilitator.capacity,
                        "biography"       : facilitator.biography,
                        /* Parse out Compensation */
                        "compensation-meal"             : facilitator.compensation.meal? 'on' : 'off',
                        "compensation-accommodation"    : facilitator.compensation.accommodation? 'on' : 'off',
                        "compensation-travel"           : facilitator.compensation.travel? 'on' : 'off',
                        "compensation-travelAmount"     : facilitator.compensation.travel,
                        "compensation-honorarium"       : facilitator.compensation.honorarium? 'on' : 'off',
                        "compensation-honorariumAmount" : facilitator.compensation.honorarium,
                        /* */
                        "notes"            : facilitator.notes
                    };
                    res.render('facilitator-application', {
                        title    : "Facilitator Application",
                        session  : req.session,
                        lastForm : form
                    });
                }
            });
        });

    return router;
};
