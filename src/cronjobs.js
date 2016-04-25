var client = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN),
    cron = require('cron').CronJob,
    moment = require("moment"),
    _ = require("lodash");

module.exports = function(db) {
    // Sends an SMS to the delegate.
    function sendSMS(phone, msg) {
        // We don't want to get multiple charges per message. Truncate anything over 155.
        if (msg.length > 153) {
            msg = String(msg.slice(0, 153) + "..");
        }

        // console.log("   To: ", phone, "Msg("+ msg.length + "): ", msg);

        client.sendMessage({
            to: phone,
            from: '(778) 402-1767',
            body: msg,
        }, function(err, data) {
            if (err) { console.log(err); }
            else { console.log("Done sending to ", phone); }
        });
    }

    // Pass in like `new Date("Thu Sep 14 2015")`
    function notifyDelegates(day) {
        // The start time of day for workshops to notify for.
        var start = new Date(day.getTime());
        start.setHours(0);
        start.setMinutes(0);
        start.setSeconds(0);
        // The end time, which is the end of the day.
        var end = new Date(day.getTime());
        end.setHours(23);
        end.setMinutes(59);
        end.setSeconds(59);
        // Lookup sessions.
        db.Session.findAll({
            where: {
                start: { gte: start, },
                end: { lte: end, },
            },
            include: [{
                model: db.Member,
                // It's opt-in.
                where: {
                    // notifications: true,
                    phone: { $ne: null },
                }
            }, {
                model: db.Workshop,
                attributes: ["title", "approved"],
                where: { approved: true, },
            }],
        }).then(function (sessions) {
            // console.log(sessions);
            _.each(sessions, function (session) {
                console.log("On session of ", session.Workshop.title);
                var startTime = moment(session.start).format('h:mm a');
                _.each(session.Members, function (member) {
                    if (member.phone) {
                        console.log("   Sending message to", member.name);
                        var msg = "Start: " + startTime + ", At: " + session.room + " " + session.venue +  ", Wkshp: " + session.Workshop.title;
                        sendSMS(member.phone, msg);
                    } else {
                        console.log("   Skipping message to", member.name);
                    }
                });
            });
        }).catch(function (err) {
            console.log(err);
        });
    }

    function setupCron(time) {
        var date = new Date(time);
        new cron(date, function() {
            /* runs once at the specified date. */
                console.log("Running job to send messages for ", time, "...");
                notifyDelegates(date);
            },
            function () {
                /* This function is executed when the job stops */
                console.log("Done job ", time, "...");
            },
            true, /* Start the job right now */
            "America/Vancouver" /* Time zone of this job. */
        );
    }

    console.log("Hooking cronjobs...");
    return [
        setupCron("Mar 22 2017 07:11:00"),
        setupCron("Mar 23 2017 07:30:00"),
    ];
};
