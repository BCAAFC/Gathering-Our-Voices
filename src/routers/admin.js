"use strict";

var Promise = require("bluebird"),
    fs = require("fs"),
    sequelize = require("sequelize"),
    alert = require("../utils/alert"),
    moment = require("moment");

// These all look the same, but expect them to differ later.

module.exports = function (db, redis) {
    var router = require("express").Router();

    router.route("/").get(function (req, res) { res.redirect("/admin/accounts"); });

    router.route("/accounts")
    .get(function (req, res) {
        db.Account.findAll({
            include: [
                { model: db.Group, attributes: ["id"] },
                { model: db.Workshop, attributes: ["id"] },
                { model: db.Exhibitor, attributes: ["id"] },
                { model: db.Volunteer, attributes: ["id"] },
            ],
            order: [ "affiliation", ],
        }).map(function (account) {
            return account.balance().then(function (balance) {
                var acc = account.get({plain: true});
                acc.balance = balance;
                return acc;
            });
        }).then(function (accounts) {
            var columns = Object.keys(db.Account.attributes)
                .filter(function (v) { return v !== "password"; })
                .map(function (v) {
                    var val = v[0].toUpperCase() + v.slice(1);
                    return { title: val, data: v, className: v };
                });
            columns.push({ title: "Balance", data: "balance", className: "Balance", });
            columns.push({ title: "Group", data: "Group", className: "Group", });
            columns.push({ title: "Exhibitor", data: "Exhibitor", className: "Exhibitor", });
            columns.push({ title: "Workshop", data: "Workshop", className: "Workshop", });
            columns.push({ title: "Volunteer", data: "Volunteer", className: "Volunteer", });
            // columns.push({ title: "Delete", data: null, className: "Delete", });

            res.render("admin/accounts", {
                title: "Administration - Accounts",
                account: req.session.account,
                admin: req.session.isAdmin,
                alert: req.alert,
                flags: db.Flag.cache,
                // Admin Table
                data: accounts,
                columns: columns,
            });
        }).catch(function (error) {
            console.warn(error.message);
            res.status(404).send(error.message);
        });
    });

    router.route("/groups")
    .get(function (req, res) {
        db.Group.findAll({
            include: [{
                model: db.Member,
                attributes: ['type', ],
            }, {
                model: db.Account,
                attributes: ['affiliation', 'email', 'misc'],
            }],
            order: [ "Group.AccountId", ],
        }).then(function (groups) {
            var columns = Object.keys(db.Group.attributes)
                .map(function (v) {
                    var val = v[0].toUpperCase() + v.slice(1);
                    return { title: val, data: v, className: v };
                });
            columns.splice(1, 0, { title: "Checkin", data: "Account.misc", className: "Checkin" });
            columns.splice(2, 0, { title: "Affiliation", data: "Account.affiliation", className: "Affiliation" });
            columns.splice(3, 0, { title: "Email", data: "Account.email", className: "Email" });
            columns.splice(4, 0, { title: "Size", data: "", className: "Size" });
            columns.splice(5, 0, { title: "Members", data: "Members", className: "Members" });
            columns.push({ title: "Delete", data: null, className: "Delete", });

            res.render("admin/groups", {
                title: "Administration - Groups",
                account: req.session.account,
                admin: req.session.isAdmin,
                alert: req.alert,
                flags: db.Flag.cache,
                // Admin Table
                data: groups,
                columns: columns
            });
        }).catch(function (error) {
            console.warn(error.message);
            res.status(404).send(error.message);
        });
    });

    router.route("/members")
    .get(function (req, res) {
        db.Member.findAll({
            order: [ "name", ],
            include: [{
                model: db.Group,
                attributes: [ "AccountId" ],
            }],
        }).then(function (members) {
            var columns = Object.keys(db.Member.attributes)
                .map(function (v) {
                    var val = v[0].toUpperCase() + v.slice(1);
                    return { title: val, data: v, className: v };
                });
            columns.push({ title: "Delete", data: null, className: "Delete", });

            res.render("admin/members", {
                title: "Administration - Members",
                account: req.session.account,
                admin: req.session.isAdmin,
                alert: req.alert,
                flags: db.Flag.cache,
                // Admin Table
                data: members,
                columns: columns
            });
        }).catch(function (error) {
            console.warn(error.message);
            res.status(404).send(error.message);
        });
    });

    router.route("/workshops")
    .get(function (req, res) {
        db.Workshop.findAll({
            include: [
                db.Session,
                { model: db.Account, attributes: ["id", "affiliation"] },
            ],
            order: [ "title", ],
        }).then(function (workshops) {
            var columns = Object.keys(db.Workshop.attributes)
                .map(function (v) {
                    var val = v[0].toUpperCase() + v.slice(1);
                    return { title: val, data: v, className: v };
                });
            columns.splice(1, 0, { title:"Sessions", data: "Sessions", className: "sessions" });
            columns.splice(3, 0, { title:"Affiliation", data: "Account.affiliation", className: "affiliation" });
            columns.push({ title: "Delete", data: null, className: "Delete", });

            res.render("admin/workshops", {
                title: "Administration - Workshops",
                account: req.session.account,
                admin: req.session.isAdmin,
                alert: req.alert,
                flags: db.Flag.cache,
                data: workshops,
                columns: columns,
            });
        }).catch(function (error) {
            console.warn(error.message);
            res.status(404).send(error.message);
        });
    });

    router.route("/workshops/selection_printout")
    .get(function (req, res) {
        db.Workshop.findAll({
            order: [ "title", ],
            include: [{
                model: db.Account,
                attributes: ["affiliation"]
            }],
        }).then(function (workshops) {
            workshops = workshops.map(function (workshop) {
                workshop.description = workshop.description.replace(/\n/g, "<br>");
                workshop.biography = workshop.biography.replace(/\n/g, "<br>");
                workshop.interactionLevel = workshop.interactionLevel.replace(/\n/g, "<br>");
                return workshop;
            });
            res.render("admin/workshop_selection_printout", {
                title: "Administration - Selection",
                account: req.session.account,
                admin: req.session.isAdmin,
                alert: req.alert,
                flags: db.Flag.cache,
                workshops: workshops,
            });
        }).catch(function (error) {
            console.warn(error.message);
            res.status(404).send(error.message);
        });
    });

    router.route("/workshops/approved_printout")
    .get(function (req, res) {
        db.Workshop.findAll({
            order: [ "title", ],
            include: [{
                model: db.Account,
                attributes: ["affiliation"]
            }, {
                model: db.Session
            }],
            where: {
                approved: true
            }
        }).then(function (workshops) {
            workshops = workshops.map(function (workshop) {
                workshop.description = workshop.description.replace(/\n/g, "<br>");
                workshop.biography = workshop.biography.replace(/\n/g, "<br>");
                workshop.interactionLevel = workshop.interactionLevel.replace(/\n/g, "<br>");
                return workshop;
            });
            res.render("admin/workshop_approved_printout", {
                title: "Administration - Approved Workshops",
                account: req.session.account,
                admin: req.session.isAdmin,
                alert: req.alert,
                flags: db.Flag.cache,
                workshops: workshops,
            });
        }).catch(function (error) {
            console.warn(error.message);
            res.status(404).send(error.message);
        });
    });

    router.route("/exhibitors")
    .get(function (req, res) {
        db.Exhibitor.findAll({
            order: [ "AccountId", ],
            include: [{
                model: db.Account,
                select: "affiliation",
            }],
        }).map(function (exhibitor) {
            var exhib_plain = exhibitor.get({plain: true});
            return exhibitor.Account.balance().then(function (balance) {
                exhib_plain.balance = balance;
                return exhib_plain;
            });
        }).then(function (exhibitors) {
            var columns = Object.keys(db.Exhibitor.attributes)
                .map(function (v) {
                    var val = v[0].toUpperCase() + v.slice(1);
                    return { title: val, data: v, className: v };
                });
            columns.splice(1, 0, { title:"Affiliation", data: "Account.affiliation", className: "affiliation" });
            columns.splice(7, 0, { title:"Balance", data: "balance", className: "Balance" });
            columns.push({ title: "Delete", data: null, className: "Delete", });

            res.render("admin/exhibitors", {
                title: "Administration - Exhibitors",
                account: req.session.account,
                admin: req.session.isAdmin,
                alert: req.alert,
                flags: db.Flag.cache,
                data: exhibitors,
                columns: columns,
            });
        }).catch(function (error) {
            console.warn(error.message);
            res.status(404).send(error.message);
        });
    });

    router.route("/payments")
    .get(function (req, res) {
        db.Payment.findAll().then(function (payments) {
            var columns = Object.keys(db.Payment.attributes)
                .map(function (v) {
                    var val = v[0].toUpperCase() + v.slice(1);
                    return { title: val, data: v, className: v };
                });
            columns.push({ title: "Delete", data: null, className: "Delete", });

            res.render("admin/payments", {
                title: "Administration - Payments",
                account: req.session.account,
                admin: req.session.isAdmin,
                flags: db.Flag.cache,
                alert: req.alert,
                data: payments,
                columns: columns,
            });
        }).catch(function (error) {
            console.warn(error.message);
            res.status(404).send(error.message);
        });
    });

    router.route("/volunteers")
    .get(function (req, res) {
        db.Volunteer.findAll({
            include: [db.Account, ],
        }).then(function (volunteers) {
            var columns = Object.keys(db.Volunteer.attributes)
                .map(function (v) {
                    var val = v[0].toUpperCase() + v.slice(1);
                    return { title: val, data: v, className: v };
                });
            columns.splice(1, 0, { title: "Name", data: "Account.name", className: "name", });
            columns.splice(2, 0, { title: "Affiliation", data: "Account.affiliation", className: "affiliation", });
            columns.push({ title: "Delete", data: null, className: "Delete", });

            res.render("admin/volunteers", {
                title: "Administration - Volunteers",
                account: req.session.account,
                admin: req.session.isAdmin,
                alert: req.alert,
                flags: db.Flag.cache,
                data: volunteers,
                columns: columns,
            });
        }).catch(function (error) {
            console.log(error.message);
            res.status(404).send(error.message);
        });
    });

    router.route("/images")
    .get(function (req, res) {
        fs.readdir(process.env.UPLOAD_DIR + "images/", function (err, files) {
            if (err) {
                alert.error(req, err.message);
                console.log(err);
                return res.redirect("back");
            }
            files = files
                .filter(function (val) { return val[0] !== '.'; })
                .map(function (val) { return val.split(".").shift(); });
            res.render("admin/images", {
                title: "Administration - Images",
                account: req.session.account,
                admin: req.session.isAdmin,
                flags: db.Flag.cache,
                alert: req.alert,
                files: files,
            });
        });
    });

    router.route("/editor")
    .get(function (req, res) {
        db.Page.findAll({}).then(function (pages) {
            res.render("editor", {
                layout: null,
                pages: pages,
                admin: req.session.isAdmin,
                flags: db.Flag.cache,
            });
        });
    });

    router.route("/manage/:id/*?")
    .get(function (req, res) {
        db.Account.findOne({
            where: { id: req.params.id, },
        }).then(function (account) {
            if (!account) { throw new Error("Account does not exist."); }
            req.session.account = account;
            if (req.params[0]) {
                res.redirect("/account/" + req.params[0]);
            } else {
                res.redirect("/account/");
            }
        }).catch(function (error) {
            res.format({
                'text/html': function () { alert.error(req, error.message); res.redirect('back'); },
                'default': function () { res.status(401).json({ error: error.message }); },
            });
        });
    });

    router.route("/emails")
    .get(function (req, res) {
        Promise.join(
            // All accounts
            db.Account.findAll({
                attributes: ['name', 'email', ],
            }),
            // All groups
            db.Group.findAll({
                attributes: [],
                include: [{ model: db.Account, attributes: [ 'name', 'email', ], }],
            }),
            db.Exhibitor.findAll({
                where: { approved: true, },
                attributes: [],
                include: [{ model: db.Account, attributes: [ 'name', 'email', ], }],
            }),
            db.Workshop.findAll({
                where: { approved: true, },
                attributes: [],
                include: [{ model: db.Account, attributes: [ 'name', 'email', ], }],
            }),
            db.Volunteer.findAll({
                where: { approved: true, },
                attributes: [],
                include: [{ model: db.Account, attributes: [ 'name', 'email', ], }],
            }),
            function (accounts, groups, appExhibitors, appFacilitators, appVolunteers) {
                res.render("admin/emails", {
                    title: "Administration - Emails",
                    account: req.session.account,
                    admin: req.session.isAdmin,
                    alert: req.alert,
                    flags: db.Flag.cache,
                    // Page specific
                    accounts: accounts,
                    groups: groups,
                    appExhibitors: appExhibitors,
                    appFacilitators: appFacilitators,
                    appVolunteers: appVolunteers,
                });
            }
        );
    });

    router.route("/flags")
    .get(function (req, res) {
        res.render("admin/flags", {
            title: "Administration - Flags",
            account: req.session.account,
            admin: req.session.isAdmin,
            alert: req.alert,
            flags: db.Flag.cache,
        });
    });

    router.route("/flag/:keyword/:value")
    .get(function (req, res) {
        db.Flag.findOrCreate({ where: { keyword: req.params.keyword, }
        }).spread(function (flag, created) {
            if (req.params.value === "true") {
                flag.value = true;
            } else {
                flag.value = false;
            }
            return flag.save();
        }).then(function () {
            res.format({
                'text/html': function () { alert.success(req, "Flag set."); res.redirect('back'); },
                'default': function () { res.status(200).json({ message: "Flag set." }); },
            });
        }).catch(function (error) {
            res.format({
                'text/html': function () { alert.error(req, error.message); res.redirect('back'); },
                'default': function () { res.status(401).json({ error: error.message }); },
            });
        });
    });

    router.route("/statistics")
    .get(function (req, res) {
        Promise.props({
            // Province of Origin
            account_province: db.Account.findAll({
                attributes: [
                    "province",
                    sequelize.fn("count", sequelize.col("province"))
                ],
                group: ["province"],
                raw: true,
            }).then(function (result) {
                return result.map(function (x) {
                    return { name: x["province"], y: Number(x["count"]) };
                });
            }),

            // Affiliation Types
            group_type: db.Group.findAll({
                attributes: [
                    "affiliationType",
                    sequelize.fn("count", sequelize.col("affiliationType"))
                ],
                group: ["affiliationType"],
                raw: true,
            }).then(function (result) {
                return result.map(function (x) {
                    return { name: x["affiliationType"], y: Number(x["count"]) };
                });
            }),

            // Group size counts.
            group_size: db.Group.findAll({
                attributes: ['id'],
                group: ['Group.id'],
                raw: true,
                include: [{
                    model: db.Member,
                    attributes: [
                        [sequelize.fn('count', sequelize.col("Members.id")), "Count"],
                    ]
                }]
            }).then(function (groups) {
                var histogram = {},
                    max = 0;
                groups.map(function (x) {
                    if (x["Members.Count"] > max) {
                        max = x["Members.Count"];
                    }
                    if (histogram[x['Members.Count']]) {
                        histogram[x['Members.Count']] += 1;
                    } else {
                        histogram[x['Members.Count']] = 1;
                    }
                });
                var arr = new Array(Number(max));

                Object.keys(histogram).forEach(function(key) {
                    arr[key] = histogram[key];
                });
                return arr;
            }),

            // Affiliation Types
            group_care: db.Group.findAll({
                attributes: [
                    "youthInCare",
                    "youthInCareSupport",
                ],
                raw: true,
            }).then(function (result) {
                return result.reduce(function (acc, item) {
                    acc.youthInCare += item.youthInCare;
                    acc.youthInCareSupport += item.youthInCareSupport;
                    return acc;
                }, { youthInCare: 0, youthInCareSupport: 0 });
            }),


            // Member type
            member_type: db.Member.findAll({
                attributes: [
                    "type",
                    sequelize.fn("count", sequelize.col("type"))
                ],
                group: ["type"],
                raw: true,
            }).then(function (result) {
                return result.map(function (x) {
                    return { name: x["type"], y: Number(x["count"]) };
                });
            }),

            // Optional member background.
            member_background: db.Member.findAll({
                attributes: [
                    "background",
                    sequelize.fn("count", sequelize.col("background"))
                ],
                group: ["background"],
                raw: true,
            }).then(function (result) {
                return result.map(function (x) {
                    var background = x["background"];
                    if (background === null) { background = "N/A"; }
                    return { name: background, y: Number(x["count"]) };
                });
            }),

            // Gender Breakdown
            member_gender: db.Member.findAll({
                attributes: [
                    "gender",
                    sequelize.fn("count", sequelize.col("gender"))
                ],
                group: ["gender"],
                raw: true,
            }).then(function (result) {
                return result.map(function (x) {
                    var gender = x["gender"];
                    if (gender === null) { gender = "N/A"; }
                    return { name: gender, y: Number(x["count"]) };
                });
            }),

            // Member ages
            member_age: db.Member.findAll({
                attributes: [
                    "birthDate",
                ],
                raw: true,
            }).then(function (result) {
                var ageSet = {};
                result.map(function (x) {
                    var age = moment('2016-03-21').diff(x["birthDate"], 'years');
                    if (isNaN(age)) { age = "Unspecified"; }
                    if (ageSet[age]) {
                        ageSet[age] += 1;
                    } else {
                        ageSet[age] = 1;
                    }
                });
                var arr = [];
                Object.keys(ageSet).forEach(function(key) {
                    arr.push({ name: key, y: ageSet[key] });
                });
                return arr;
            }),

            // Show members over time.
            member_timeline: db.Member.findAll({
                attributes: [
                    "createdAt",
                ],
                raw: true,
            }).then(function (result) {
                // Postgres seems to sort wrong.
                result = result.sort(function (a, b) { return a.createdAt - b.createdAt });
                var item = result.shift(),
                    currDate = moment(item.createdAt).startOf('day'),
                    acc = 0,
                    out = [];
                while (item !== null && item !== undefined) {
                    // Chomp it!
                    var newDate = moment(item.createdAt).startOf('day');
                    while (currDate < newDate) {
                        var push = currDate.valueOf();
                        out.push([push, acc]);
                        currDate = currDate.clone().add(1, 'days').startOf('day');
                    }
                    acc += 1;

                    // Next item.
                    item = result.shift();
                }
                return out;
            }),

            // Payment information
            waived_fees: db.Payment.find({
                where: {
                    type: "Waived"
                },
                attributes: [ [sequelize.fn('SUM', sequelize.col('amount')), "total"] ],
                raw: true
            }).then(function (result) {
                return result;
            })
        }).then(function (stats) {
                res.render("admin/statistics", {
                    title: "Administration - Statistics",
                    account: req.session.account,
                    admin: req.session.isAdmin,
                    alert: req.alert,
                    flags: db.Flag.cache,
                    // Stats
                    stats: stats,
                });
            }
        );
    });

    return router;
};
