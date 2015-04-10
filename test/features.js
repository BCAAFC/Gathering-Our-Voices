process.env.DATABASE_URL = "postgres://localhost/test";

var assert = require("assert"),
    chai = require("chai"),
    Promise = require("bluebird"),
    moment = require("moment"),
    schemas = require("../schema/");

// Init
var expect = chai.expect,
    assert = chai.assert,
    should = chai.should();

// Start
describe("Features", function () {
    before("Scaffold", function () {
        // Drop all tables.
        return schemas.sequelize.drop().then(function () {
            return schemas.sequelize.sync();
        }).then(function () {
            return schemas.Account.create({
                email: "test@test.ca",
                password: "hunter2",
                name: "Testy Mc. Testerton",
                affiliation: "Testers Inc.",
                phone: "(123) 123-1234",
                fax: "(123) 123-12345",
                address: "123 Tester Way",
                city: "Testerville",
                province: "British Columbia",
                postalCode: "A1B 2C3",
            });
        }).then(function (account) {
            account.should.be.an.instanceOf(schemas.Account.Instance);
            return account.createWorkshop({
                title: "Tester Workshop",
                length: "1.5 hour",
                category: "Cultural",
                categoryReason: "Because I feel like it.",
                audience: ["Youth", "Young Adult", "Young Chaperone"],
                type: ["Q/A", "Presentation"],
                description: "A test.",
                summary: "A summary of testing.",
                interactionLevel: "Just a test.",
                capacity: 200,
                mailing: false,
                flipchart: 10,
                projector: false,
                screen: false,
                player: false,
                room: "Circle",
                biography: "A test.",
                meals: true,
                accomodation: false,
                travel: false,
                honorarium: "Please pay me some money.",
                notes: "Just some notes.",
            }).then(function (workshop) {
                return workshop.createSession({
                    start: moment("2016-03-18 09:00").toDate(),
                    end: moment("2016-03-18 10:30").toDate(),
                    room: "Test",
                    venue: "Test",
                    capacity: 1,
                });
            }).then(function () { return account; });
        }).then(function (account) {
            account.should.be.an.instanceOf(schemas.Account.Instance);
            return account.createGroup({
                affiliationType: "Friendship Centre",
                youthInCare: 0,
                youthInCareSupport: 0,
                notes: "Blah blah blah.",
                tags: ["Blah", "Blurp", "Bleep"],
            });
        }).then(function (group) {
            group.should.be.an.instanceOf(schemas.Group.Instance);
            return group.createMember({
                name: "Complete Tester",
                type: "Youth",
                gender: "Male",
                birthDate: moment("1999-01-01").toDate(),
                phone: "(123) 123-1234",
                email: "test@test.ca",
                contactName: "Testy Contact",
                contactRelation: "Relationship",
                contactPhone: "(123) 123-1234",
                medicalNumber: "1234567890",
                allergies: ["Hair", "Bear", "Lice"],
                conditions: ["Tester"],
            });
        }).catch(function (error) {
            console.log(error);
            should.not.exist(error);
        });
    });

    it("allows members to join workshops and reflects that bi-directionally", function () {
        return Promise.join(
            schemas.Member.findOne({ where: { name: "Complete Tester" }}),
            schemas.Session.findOne({ where: { room: "Test" }}),
            function (member, session) {
                member.should.be.an.instanceOf(schemas.Member.Instance);
                session.should.be.an.instanceOf(schemas.Session.Instance);
                return member.addSession(session).then(function () { return session; });
        }).then(function (session) {
            session.should.be.an.instanceOf(schemas.Session.Instance);
            return session.getMembers().then(function (members) {
                members.length.should.equal(1);
                members[0].name.should.equal("Complete Tester");
                return members[0];
            });
        }).then(function (member) {
            member.should.be.an.instanceOf(schemas.Member.Instance);
            return member.getSessions().then(function (sessions) {
                sessions.length.should.equal(1);
                sessions[0].room.should.equal("Test");
                return sessions[0];
            });
        }).catch(function (error) {
            should.not.exist(error);
        });
    });

    it("prevents double joining", function () {
        return Promise.join(
            schemas.Member.findOne({ where: { name: "Complete Tester" }}),
            schemas.Session.findOne({ where: { room: "Test" }}),
            function (member, session) {
                member.should.be.an.instanceOf(schemas.Member.Instance);
                session.should.be.an.instanceOf(schemas.Session.Instance);
                return member.addSession(session).then(function (nothing) {
                    should.not.exist(nothing); // How we know there was something already there.
                    return session;
                });
        }).then(function (session) {
            session.should.be.an.instanceOf(schemas.Session.Instance);
            return session.getMembers().then(function (members) {
                members.length.should.equal(1);
                members[0].name.should.equal("Complete Tester");
                return members[0];
            });
        }).then(function (member) {
            member.should.be.an.instanceOf(schemas.Member.Instance);
            return member.getSessions().then(function (sessions) {
                sessions.length.should.equal(1);
                sessions[0].room.should.equal("Test");
                return sessions[0];
            });
        }).catch(function (error) {
            console.log(error);
            should.not.exist(error);
        });
    });

    it("allows members to be removed from workshops and reflects that bi-directionally", function () {
        return Promise.join(
            schemas.Member.findOne({ where: { name: "Complete Tester" }}),
            schemas.Session.findOne({ where: { room: "Test" }}),
            function (member, session) {
                member.should.be.an.instanceOf(schemas.Member.Instance);
                session.should.be.an.instanceOf(schemas.Session.Instance);
                return member.removeSession(session).then(function () {
                    return [member, session];
                });
        }).then(function (vec) {
            var member = vec[0], session = vec[1];
            session.should.be.an.instanceOf(schemas.Session.Instance);
            return session.getMembers().then(function (members) {
                members.length.should.equal(0);
                return member;
            });
        }).then(function (member) {
            member.should.be.an.instanceOf(schemas.Member.Instance);
            return member.getSessions().then(function (sessions) {
                sessions.length.should.equal(0);
                return;
            });
        }).catch(function (error) {
            should.not.exist(error);
        });
    });

    it("allows members to be added to workshops and reflects that bi-directionally", function () {
        return Promise.join(
            schemas.Member.findOne({ where: { name: "Complete Tester" }}),
            schemas.Session.findOne({ where: { room: "Test" }}),
            function (member, session) {
                member.should.be.an.instanceOf(schemas.Member.Instance);
                session.should.be.an.instanceOf(schemas.Session.Instance);
                return session.addMember(member).then(function () { return session; });
        }).then(function (session) {
            session.should.be.an.instanceOf(schemas.Session.Instance);
            return session.getMembers().then(function (members) {
                members.length.should.equal(1);
                members[0].name.should.equal("Complete Tester");
                return members[0];
            });
        }).then(function (member) {
            member.should.be.an.instanceOf(schemas.Member.Instance);
            return member.getSessions().then(function (sessions) {
                sessions.length.should.equal(1);
                sessions[0].room.should.equal("Test");
                return sessions[0];
            });
        });
    });

});
