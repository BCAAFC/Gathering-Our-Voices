'use strict';

module.exports = {
    up: function(queryInterface, Sequelize) {
        return queryInterface.createTable('Accounts', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            // Info
            email: {
                type: Sequelize.STRING,
                allowNull: false,
                index: true,
                unique: true,
                validate: {
                    isEmail: true,
                },
            },
            password: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            name: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            affiliation: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            // Phone/Fax
            phone: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            fax: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            // Mailing information.
            address: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            city: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            province: {
                type: Sequelize.ENUM,
                values: [
                    "British Columbia",
                    "Alberta",
                    "Saskatchewan",
                    "Manitoba",
                    "Ontario",
                    "Quebec",
                    "New Brunswick",
                    "Nova Scotia",
                    "Prince Edward Island",
                    "Newfoundland and Labrador",
                    "Nunavut",
                    "Northwest Territories",
                    "Yukon",
                    "Other (Outside Canada)",
                ],
                allowNull: false,
            },
            postalCode: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            notes: {
                type: Sequelize.TEXT,
                allowNull: true,
                defaultValue: "",
            },
            misc: {
                type: Sequelize.JSON,
                allowNull: false,
                defaultValue: {},
            },
            //
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE
            }
        });
    },
    down: function(queryInterface, Sequelize) {
        return queryInterface.dropTable('Accounts');
    }
};
