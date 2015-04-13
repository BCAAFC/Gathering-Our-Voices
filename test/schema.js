process.env.DATABASE_URL = "postgres://localhost/test";

var assert = require("assert"),
    chai = require("chai"),
    Promise = require("bluebird"),
    moment = require("moment"),
    db = require("../src/db/")({ POSTGRES_URL: "postgres://localhost/test" });

// Init
var expect = chai.expect,
    assert = chai.assert,
    should = chai.should();

// Start
describe("db", function () {
    before("Drop & Sync", function () {
        // Drop all tables.
        return db.sequelize.drop().then(function () {
            return db.sequelize.sync();
        }).catch(function (error) {
            should.not.exist(error);
        });
    });

    describe("Account", function () {
        it("should permit registration with all information", function () {
            return db.Account.create({
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
                account.should.be.an.instanceOf(db.Account.Instance);
            }).catch(function (error) {
                should.not.exist(error);
            });
        });
        it("should complain if information is incomplete", function () {
            return db.Account.create({
                // Deliberately nothing here.
            }).then(function (account) {
                account.should.not.exist();
            }).catch(function (error) {
                should.exist(error);
            });
        });
        it("should complain if information is wrong", function () {
            return db.Account.create({
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
                account.should.be.an.instanceOf(db.Account.Instance);
            }).catch(function (error) {
                should.exist(error);
            });
        });
        it("should be able to be removed", function () {
            return db.Account.create({
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
                return db.Account.findOne({ where: { email: "delete@test.ca" }});
            }).then(function (account) {
                should.not.exist(account);
            }).catch(function (error) {
                should.exist(error);
            });
        });
        it("should be able to auth valid users", function () {
            return db.Account.auth("test@test.ca", "hunter2").then(function (account) {
                should.exist(account);
            });
        });
        it("should not auth invalid users", function () {
            return db.Account.auth("doesnt@exist.ca", "hunter2").then(function (account) {
                should.not.exist(account);
            }).catch(function (error) {
                should.exist(error);
            });
        });
        it("should not auth with invalid passwords", function () {
            return db.Account.auth("test@test.ca", "asdasd").then(function (account) {
                should.not.exist(account);
            }).catch(function (error) {
                should.exist(error);
            });
        });
    });

    describe("Group", function () {
        it("can be created with all information", function () {
            return db.Group.create({
                affiliationType: "Friendship Centre",
                youthInCare: 0,
                youthInCareSupport: 0,
                notes: "Blah blah blah.",
                tags: ["Blah", "Blurp", "Bleep"],
            }).then(function (group) {
                group.should.be.an.instanceOf(db.Group.Instance);
            }).catch(function (error) {
                should.not.exist(error);
            });
        });
        it ("cannot be created with lacking information", function () {
            db.Group.create({
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
            return db.Group.create({
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
            return db.Account.find({
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
            return db.Account.findOne({ where: { email: "test@test.ca" } }).then(function (account) {
                return account.getGroup();
            }).then(function (group) {
                group.should.be.an.instanceOf(db.Group.Instance);
                group.affiliationType.should.equal("Friendship Centre");
            }).catch(function (error) {
                should.not.exist(error);
            });
        });
        it("calculates empty group's cost correctly", function () {
            return db.Account.findOne({ where: { email: "test@test.ca" } }).then(function (account) {
                return account.cost().then(function (cost) {
                    cost.should.equal(0);
                });
            });
        });
        it("calculates empty group's paid correctly", function () {
            return db.Account.findOne({ where: { email: "test@test.ca" } }).then(function (account) {
                return account.paid().then(function (paid) {
                    paid.should.equal(0);
                });
            });
        });
        it("calculates empty group's balance correctly", function () {
            return db.Account.findOne({ where: { email: "test@test.ca" } }).then(function (account) {
                return account.balance().then(function (balance) {
                    balance.should.equal(0);
                });
            });
        });
    });

    describe("Member", function () {
        it("can be created with minimal information", function () {
            return db.Member.create({
                name: "Incomplete Tester",
                type: "Youth",
            }).then(function (member) {
                should.exist(member, "Should have been able to create member.");
                should.equal(member.complete, false, "Should not be complete.");
            });
        });
        it("can be created with full information and marked complete", function () {
            return db.Member.create({
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
                member.should.be.an.instanceOf(db.Member.Instance);
                member.complete.should.equal(true);
            });
        });
        it("cannot be created if too young to attend", function () {
            return db.Member.create({
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
            return db.Member.create({
                name: "Testy Incomplete",
            }).then(function (member) {
                should.not.exist(member);
            }).catch(function (error) {
                should.exist(error);
            });
        });
        it("can be associated with a group", function () {
            return db.Account.find({
                where: { email: "test@test.ca" },
                include: [ db.Group ],
            }).then(function (account) {
                return account.getGroup();
            }).then(function (group) {
                return group.createMember({
                    name: "Associated Tester",
                    type: "Chaperone",
                });
            }).then(function (member) {
                member.should.be.an.instanceOf(db.Member.Instance);
            }).catch(function (error) {
                should.not.exist(error);
            });
        });
        it("can be retrieved after association", function () {
            return db.Account.find({
                where: { email: "test@test.ca" },
                include: [{ all: true }],
            }).then(function (account) {
                return account.getGroup();
            }).then(function (group) {
                return group.getMembers();
            }).then(function (members) {
                members[0].should.be.an.instanceOf(db.Member.Instance);
            }).catch(function (error) {
                should.not.exist(error);
            });
        });
        it("calculates cost correctly", function () {
            return db.Member.create({
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
            return db.Workshop.create({
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
                workshop.should.be.an.instanceOf(db.Workshop.Instance);
            }).catch(function (error) {
                console.log(error);
                should.not.exist(error);
            });
        });
        it("accepts specific attendee types", function () {
            return db.Workshop.findOne({
                where: { title: "Tester Workshop Application", },
            }).then(function (workshop) {
                workshop.accepts("Youth").should.equal(true);
                workshop.accepts("Young Adult").should.equal(true);
                workshop.accepts("Young Chaperone").should.equal(true);
                workshop.accepts("Chaperone").should.equal(false);
            }).catch(function (error) {
                should.not.exist(error);
            });
        });
        it("cannot be created with incorrect information", function () {
            return db.Workshop.create({
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
            return db.Account.find({
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
                workshop.should.be.an.instanceOf(db.Workshop.Instance);
                workshop.approved.should.equal(false);
            }).catch(function (error) {
                should.not.exist(error);
            });
        });
        it("can be approved", function () {
            return db.Workshop.findOne({
                where: { title: "Tester Workshop Application 2" },
            }).then(function (workshop) {
                workshop.approved = true;
                return workshop.save();
            }).then(function () {
                return db.Workshop.findOne({
                    where: { approved: true },
                });
            }).then(function (approved) {
                approved.should.be.an.instanceOf(db.Workshop.Instance);
                approved.approved.should.equal(true);
            }).catch(function (error) {
                console.error(error);
                error.should.not.exist();
            });
        });
    });

    describe("Session", function () {
        it("can be created with correct information", function () {
            return db.Workshop.find({
                where: { approved: true }
            }).then(function (workshop) {
                workshop.should.exist.and.be.an.instanceOf(db.Workshop.Instance);
                return workshop.createSession({
                    start: moment("2016-03-18 09:00").toDate(),
                    end: moment("2016-03-18 10:30").toDate(),
                    room: "Test",
                    venue: "Test",
                    capacity: 1,
                });
            }).then(function (session) {
                session.should.exist.and.be.an.instanceOf(db.Session.Instance);
            }).catch(function (error) {
                should.not.exist(error);
            });
        });
        it("can not be created with incorrect information", function () {
            return db.Workshop.find({
                where: { approved: true }
            }).then(function (workshop) {
                return workshop.createSession({
                    start: "Foo",
                    end: "Bar",
                });
            }).catch(function (error) {
                should.exist(error);
            });
        });
        it("can have members added to it", function () {
            return Promise.join(
                db.Session.findOne({ where: { room: "Test" } }),
                db.Member.findOne({ where: { name: "Complete Tester" } }),
                function done(session, member) {
                    session.should.be.an.instanceOf(db.Session.Instance);
                    member.should.be.an.instanceOf(db.Member.Instance);
                    return session.addMember(member);
            }).then(function () {
                return db.Session.findOne({
                    where: { room: "Test" },
                    include: [ db.Member ]
                });
            }).then(function (session) {
                return session.getMembers();
            }).then(function (members) {
                members.should.be.an.instanceOf(Array);
                members.length.should.equal(1);
                members.forEach(function (member) {
                    member.should.be.an.instanceOf(db.Member.Instance);
                });
            }).catch(function (error) {
                console.log(error);
                should.not.exist(error);
            });
        });
        it("can add conditionally based on capacity", function () {
            return Promise.join(
                db.Session.findOne({ where: { room: "Test" } }),
                db.Member.findOne({ where: { name: "Complete Tester" } }),
                function done(session, member) {
                    session.should.be.an.instanceOf(db.Session.Instance);
                    member.should.be.an.instanceOf(db.Member.Instance);
                    return session.getMembers().then(function (members) {
                        if (members.length < session.capacity) {
                            session.addMember(member);
                        } else {
                            throw new Error("Over capacity.");
                        }
                    });
            }).catch(function (error) {
                should.exist(error);
            });
        });
    });

    describe("Exhibitor", function () {
        it("can be created with valid information", function () {
            return db.Exhibitor.create({
                representatives: [ "Test", "Test 2" ],
                categories: [ "Post-Secondary", "Industry" ],
                provides: [ "Giveaway items", "Other" ],
                electrical: false,
                delegateBags: false,
                payment: "Cheque",
            }).then(function (exhibitor) {
                exhibitor.should.be.an.instanceOf(db.Exhibitor.Instance);
                exhibitor.paid.should.equal(false);
            }).catch(function (error) {
                should.not.exist(error);
            });
        });
        it("cannot be created with valid information", function () {
            return db.Exhibitor.create({
                representatives: [ "Test", "Test 2" ],
                categories: [ "Biking" ], // Invalid
                provides: [ "Nothing", "Other" ], // Invalid
                electrical: false,
                delegateBags: false,
                payment: "Cheque",
            }).then(function (exhibitor) {
                should.not.exist(exhibitor);
            }).catch(function (error) {
                should.exist(error);
            });
        });
        it("can be associated", function () {
            return db.Account.find({
                where: { email: "test@test.ca" }
            }).then(function (account) {
                return account.createExhibitor({
                    representatives: [ "Test", "Test 2" ],
                    categories: [ "Post-Secondary", "Industry" ],
                    provides: [ "Giveaway items", "Other" ],
                    electrical: false,
                    delegateBags: false,
                    payment: "Cheque",
                });
            });
        });
        it("can be set to paid", function () {
            return db.Account.find({
                where: { email: "test@test.ca" }
            }).then(function (account) {
                return account.getExhibitor();
            }).then(function (exhibitor) {
                exhibitor.paid = true;
                return exhibitor.save();
            });
        });
    });

    describe("Page", function () {
        it("can be rendered", function () {
            return db.Page.create({
                path: "/test",
                title: "Test",
                content: "Test **test**",
            }).then(function (page) {
                page.title.should.equal("Test");
                page.render().should.equal("<p>Test <strong>test</strong></p>\n");
            }).catch(function (error) {
                console.log(error);
                should.not.exist(error);
            });
        });
    });

    describe("Image", function () {
        it("can be created and retrieved", function () {
            var buffer = require("fs").readFileSync("./test/assets/bear.jpg");
            return db.Image.create({
                caption: "Test bear",
                data: buffer,
            }).then(function (image) {
                image.caption.should.equal("Test bear");
                image.data.should.deep.equal(buffer);
            }).catch(function (error) {
                console.log(error);
                should.not.exist(error);
            });
        });
    });
});
