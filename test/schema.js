process.env.DATABASE_URL = "postgres://localhost/test";

var assert = require("assert"),
    chai = require("chai"),
    Promise = require("bluebird"),
    moment = require("moment"),
    schemas = require("../pg_schema/");

// Init
var expect = chai.expect,
    assert = chai.assert,
    should = chai.should();

// Start
describe("Schemas", function () {
    before("Drop & Sync", function () {
        // Drop all tables.
        return schemas.sequelize.drop().then(function () {
            return schemas.sequelize.sync();
        }).catch(function (error) {
            should.not.exist(error);
        });
    });

    describe("Account", function () {
        it("should permit registration with all information", function () {
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
            }).then(function (account) {
                account.should.be.an.instanceOf(schemas.Account.Instance);
            }).catch(function (error) {
                should.not.exist(error);
            });
        });
        it("should complain if information is incomplete", function () {
            return schemas.Account.create({
                // Deliberately nothing here.
            }).then(function (account) {
                account.should.not.exist();
            }).catch(function (error) {
                should.exist(error);
            });
        });
        it("should complain if information is wrong", function () {
            return schemas.Account.create({
                email: "test.test.ca", // Not an email.
                password: "hunter2",
                name: "Testy Mc. Testerton",
                affiliation: "Testers Inc.",
                phone: "(123) 123-1234",
                fax: "(123) 123-12345",
                address: "123 Tester Way",
                city: "Testerville",
                province: "British Columbia",
                postalCode: "A1B 2C3",
            }).then(function (account) {
                account.should.be.an.instanceOf(schemas.Account.Instance);
            }).catch(function (error) {
                should.exist(error);
            });
        });
        it("should be able to be removed", function () {
            return schemas.Account.create({
                email: "delete@test.ca",
                password: "hunter",
                name: "Delete Me",
                affiliation: "Deleters Inc.",
                phone: "(123) 123-1234",
                fax: "(123) 123-1234",
                address: "123 Deleter War",
                city: "Deleterville",
                province: "British Columbia",
                postalCode: "A1B 2C3",
            }).then(function (account) {
                return account.destroy();
            }).then(function () {
                return schemas.Account.findOne({ where: { email: "delete@test.ca" }});
            }).then(function (account) {
                should.not.exist(account);
            }).catch(function (error) {
                should.exist(error);
            });
        });
    });

    describe("Group", function () {
        it("can be created with all information", function () {
            return schemas.Group.create({
                affiliationType: "Friendship Centre",
                youthInCare: 0,
                youthInCareSupport: 0,
                notes: "Blah blah blah.",
                tags: ["Blah", "Blurp", "Bleep"],
            }).then(function (group) {
                group.should.be.an.instanceOf(schemas.Group.Instance);
            }).catch(function (error) {
                should.not.exist(error);
            });
        });
        it ("cannot be created with lacking information", function () {
            schemas.Group.create({
                youthInCareSupport: 0,
                notes: "Blah blah blah.",
                tags: ["Blah", "Blurp", "Bleep"],
            }).then(function (group) {
                should.not.exist(group);
            }).catch(function (error) {
                should.exist(error);
            });
        });
        it ("cannot be created with wrong information", function () {
            return schemas.Group.create({
                affiliationType: "Centre", // Not a valid option.
                youthInCare: 0,
                youthInCareSupport: 0,
                notes: "Blah blah blah.",
                tags: ["Blah", "Blurp", "Bleep"],
            }).then(function (group) {
                should.not.exist(group);
            }).catch(function (error) {
                should.exist(error);
            });
        });
        it("can be associated", function () {
            return schemas.Account.find({
                where: { email: "test@test.ca" }
            }).then(function (account) {
                return account.createGroup({
                    affiliationType: "Friendship Centre",
                    youthInCare: 0,
                    youthInCareSupport: 0,
                    notes: "Blah blah blah.",
                    tags: ["Blah", "Blurp", "Bleep"],
                });
            }).catch(function (error) {
                should.not.exist(error);
            });
        });
        it("can find related account", function () {
            return schemas.Account.findOne({ where: { email: "test@test.ca" } }).then(function (account) {
                return account.getGroup();
            }).then(function (group) {
                group.should.be.an.instanceOf(schemas.Group.Instance);
                group.affiliationType.should.equal("Friendship Centre");
            }).catch(function (error) {
                should.not.exist(error);
            });
        });
        it("calculates empty group's cost correctly", function () {
            return schemas.Account.findOne({ where: { email: "test@test.ca" } }).then(function (account) {
                return account.cost().then(function (cost) {
                    cost.should.equal(0);
                });
            });
        });
        it("calculates empty group's paid correctly", function () {
            return schemas.Account.findOne({ where: { email: "test@test.ca" } }).then(function (account) {
                return account.paid().then(function (paid) {
                    paid.should.equal(0);
                });
            });
        });
        it("calculates empty group's balance correctly", function () {
            return schemas.Account.findOne({ where: { email: "test@test.ca" } }).then(function (account) {
                return account.balance().then(function (balance) {
                    balance.should.equal(0);
                });
            });
        });
    });

    describe("Member", function () {
        it("can be created with minimal information", function () {
            return schemas.Member.create({
                name: "Incomplete Tester",
                type: "Youth",
            }).then(function (member) {
                should.exist(member, "Should have been able to create member.");
                should.equal(member.complete, false, "Should not be complete.");
            });
        });
        it("can be created with full information and marked complete", function () {
            return schemas.Member.create({
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
            }).then(function (member) {
                member.should.be.an.instanceOf(schemas.Member.Instance);
                member.complete.should.equal(true);
            });
        });
        it("cannot be created if too young to attend", function () {
            return schemas.Member.create({
                name: "Testy Tester",
                type: "Youth",
                birthDate: moment("2010-01-01").toDate(),
            }).then(function (member) {
                should.not.exist(member);
            }).catch(function (error) {
                should.exist(error);
            });
        });
        it("cannot be created with lacking information", function () {
            return schemas.Member.create({
                name: "Testy Incomplete",
            }).then(function (member) {
                should.not.exist(member);
            }).catch(function (error) {
                should.exist(error);
            });
        });
        it("can be associated with a group", function () {
            return schemas.Account.find({
                where: { email: "test@test.ca" },
                include: [ schemas.Group ],
            }).then(function (account) {
                return account.getGroup();
            }).then(function (group) {
                return group.createMember({
                    name: "Associated Tester",
                    type: "Chaperone",
                });
            }).then(function (member) {
                member.should.be.an.instanceOf(schemas.Member.Instance);
            }).catch(function (error) {
                should.not.exist(error);
            });
        });
        it("can be retrieved after association", function () {
            return schemas.Account.find({
                where: { email: "test@test.ca" },
                include: [{ all: true }],
            }).then(function (account) {
                return account.getGroup();
            }).then(function (group) {
                return group.getMembers();
            }).then(function (members) {
                members[0].should.be.an.instanceOf(schemas.Member.Instance);
            }).catch(function (error) {
                should.not.exist(error);
            });
        });
        it("calculates cost correctly", function () {
            return schemas.Member.create({
                name: "Cost Tester",
                type: "Youth",
            }).then(function (member) {
                member.ticketType = "Early";
                member.cost().should.equal(125);
                member.ticketType = "Regular";
                member.cost().should.equal(175);
            }).catch(function (error) {
                should.not.exist(error);
            });
        });
    });

    describe("Workshop", function () {
        it("can be created with correct information", function () {
            return schemas.Workshop.create({
                title: "Tester Workshop Application",
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
                workshop.should.be.an.instanceOf(schemas.Workshop.Instance);
            }).catch(function (error) {
                should.not.exist(error);
            });
        });
        it("cannot be created with incorrect information", function () {
            return schemas.Workshop.create({
                title: "Tester Workshop Application",
                length: "1.5 hour",
                category: "Cultural",
                categoryReason: "Because I feel like it.",
                audience: ["Teeth", "Young Adult"], // Invalid.
                type: ["Q/A", "Teeth"], // Invalid.
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
                should.not.exist(workshop);
            }).catch(function (error) {
                should.exist(error);
            });
        });
        it("can be associated with an account", function () {
            return schemas.Account.find({
                where: { email: "test@test.ca", },
                include: [{ all: true }],
            }).then(function (account) {
                return account.createWorkshop({
                    title: "Tester Workshop Application 2",
                    length: "Full day",
                    category: "Mental",
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
                });
            }).then(function (workshop) {
                workshop.should.be.an.instanceOf(schemas.Workshop.Instance);
                workshop.approved.should.equal(false);
            }).catch(function (error) {
                should.not.exist(error);
            });
        });
        it("can be approved", function () {
            return schemas.Workshop.findOne({
                where: { title: "Tester Workshop Application 2" },
            }).then(function (workshop) {
                workshop.approved = true;
                return workshop.save();
            }).then(function () {
                return schemas.Workshop.findOne({
                    where: { approved: true },
                });
            }).then(function (approved) {
                approved.should.be.an.instanceOf(schemas.Workshop.Instance);
                approved.approved.should.equal(true);
            }).catch(function (error) {
                console.error(error);
                error.should.not.exist();
            });
        });
    });

    describe("Session", function () {
        it("can be created with correct information", function () {
            return schemas.Workshop.find({
                where: { approved: true }
            }).then(function (workshop) {
                workshop.should.exist.and.be.an.instanceOf(schemas.Workshop.Instance);
                return workshop.createSession({
                    start: moment("2016-03-18 09:00").toDate(),
                    end: moment("2016-03-18 10:30").toDate(),
                    room: "Test",
                    venue: "Test",
                    capacity: 200,
                });
            }).then(function (session) {
                session.should.exist.and.be.an.instanceOf(schemas.Session.Instance);
            }).catch(function (error) {
                should.not.exist(error);
            });
        });
        it("can not be created with incorrect information", function () {
            return schemas.Workshop.find({

            }).then(function (workshop) {

            }).catch(function (error) {
                should.exist(error);
            });
        });
    });

});
