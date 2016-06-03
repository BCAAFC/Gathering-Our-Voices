'use strict';

module.exports = {
    up: function (queryInterface, Sequelize) {
        return queryInterface.bulkInsert('Flags', [
            {
                keyword: "groupRegistration",
                value: true,
                createdAt: new Date(Date.now()),
                updatedAt: new Date(Date.now()),
            },
            {
                keyword: "memberRegistration",
                value: false,
                createdAt: new Date(Date.now()),
                updatedAt: new Date(Date.now()),
            },
            {
                keyword: "exhibitorRegistration",
                value: false,
                createdAt: new Date(Date.now()),
                updatedAt: new Date(Date.now()),
            },
            {
                keyword: "facilitatorRegistration",
                value: false,
                createdAt: new Date(Date.now()),
                updatedAt: new Date(Date.now()),
            },
            {
                keyword: "volunteerRegistration",
                value: false,
                createdAt: new Date(Date.now()),
                updatedAt: new Date(Date.now()),
            },
            {
                keyword: "workshopSignup",
                value: false,
                createdAt: new Date(Date.now()),
                updatedAt: new Date(Date.now()),
            },
        ]);
    },

    down: function (queryInterface, Sequelize) {
        return queryInterface.bulkDelete('Flags', {
            where: {
                keyword: [
                    "groupRegistration",
                    "memberRegistration",
                    "exhibitorRegistration",
                    "facilitatorRegistration",
                    "volunteerRegistration",
                    "workshopSignup"
                ]
            },
        }, {}, {});
    }
};
