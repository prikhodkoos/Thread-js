'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.sequelize
  .transaction(transaction => Promise.all([
    queryInterface.addColumn('posts', 'isArchived', {
      allowNull: false,
      type: Sequelize.BOOLEAN,
      defaultValue: false
    }),
  ])),

   down: (queryInterface, Sequelize) => queryInterface.sequelize
  .transaction(transaction => Promise.all([
    queryInterface.removeColumn('posts', 'isArchived', { transaction })
  ]))
};
