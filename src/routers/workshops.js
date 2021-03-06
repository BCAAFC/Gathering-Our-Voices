'use strict';

var Promise = require("bluebird"),
    alert = require("../utils/alert"),
    fs = require("fs");

module.exports = function (db) {
  var router = require("express").Router();

  router.route("/")
  .get(function (req, res) {
    db.Workshop.findAll({
      where: { approved: true, verified: true, },
      attributes: [
        'id',
        'title',
        'facilitators',
        'length',
        'audience',
      ],
      include: [{
        model: db.Session,
        include: [{
          model: db.Member,
          attributes: ["id"]
        }],
      }],
      order: [
        ["title"],
        [db.Session, "start"]
      ],
    }).then(function (workshops) {
      workshops = workshops.map(function (workshop) {
        workshop = workshop.toJSON();
        workshop.Sessions.map(function (session) {
          session.attending = session.Members.length;
          delete session.Members;
          return session;
        });
        return workshop;
      });
      var columns = [
        { title: "View", data: null, className: "view", },
        { title: 'Title', data: 'title', className: 'title' },
        { title: 'Facilitators', data: 'facilitators', className: 'facilitators' },
        { title: 'Length', data: 'length', className: 'length' },
        { title: 'Audience', data: 'audience', className: 'audience' },
        { title: 'Sessions', data: 'Sessions', className: 'sessions' },
      ];
      res.render("workshops/index", {
        title: "Workshop List",
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

  router.route("/:id")
  .get(function (req, res) {
    Promise.join(
      db.Workshop.findOne({
        where: { id: req.params.id, },
        include: [
          {
            model: db.Session,
            include: [{
              model: db.Member,
            }],
            order: [ db.Member, "name", ],
          },
          {
            model: db.Account,
            attributes: ["affiliation"],
          },
        ],
        order: [
          [ db.Session, "start", ],
          [ db.Session, db.Member, "name", ],
        ],
      }),
      new Promise(function (resolve, reject) {
        if (req.session.account) {
          // Refresh account information.
          return resolve(db.Account.findOne({
            where: { id: req.session.account.id, },
            include: [
              {
                model: db.Group,
                include: [
                  {
                    model: db.Member,
                    include: [db.Session],
                  },
                ],
              },
              {
                model: db.Workshop,
                attributes: ["id"],
              },
            ],
            order: [
              [ db.Group, db.Member, "name", ],
            ],
          }).then(function (account) {
            req.session.account = account;
            return account;
          }));
        } else {
          return resolve(null);
        }
      }),
      function (workshop, account) {
        workshop.description = workshop.description.replace(/\n/g, "<br>");
        var facilitatorList = false;
        if (account && account.Workshops.map(function (v) { return v.id; }).indexOf(workshop.id) !== -1) {
          facilitatorList = true;
        }
        res.render("workshops/id", {
          title: "Workshop Info",
          account: account,
          admin: req.session.isAdmin,
          alert: req.alert,
          flags: db.Flag.cache,
          workshop: workshop,
          facilitatorList: facilitatorList,
          backTo: req.query.backTo,
        });
      }
    ).catch(function (error) {
      console.warn(error.message);
      res.status(404).send(error.message);
    });
  });

  router.route("/member")
  .post(function (req, res) {;
    db.Member.findOne({
      where: {
        email: req.body.email,
        secret: req.body.secret,
      },
      include: [{
        model: db.Session,
        include: [db.Workshop],
      }, {
        model: db.Session,
        as: 'Interest',
        include: [{
          model: db.Workshop,
          attributes: ['title', 'id'],
        }],
      }],
    }).then(member => {
      if (!member) { throw new Error("Member either does not exist or the secret code was wrong."); }
      // Ensure we don't show interests already registered in.
      var sessions = member.Sessions.map(x => x.id);
      var interests = member.Interest.filter(x => {
        return sessions.indexOf(x.id) === -1;
      });

      res.render("workshops/member", {
        title: "Member - Workshops",
        // account: account,
        member: member,
        interests: interests,
        admin: req.session.isAdmin,
        flags: db.Flag.cache,
        alert: req.alert,
      });
    }).catch(function (error) {
      alert.error(req, error.message);
      res.redirect("/login");
    })
  });

  return router;
};
