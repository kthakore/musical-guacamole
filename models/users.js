/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('users', {
    id: {
      type: DataTypes.UUIDV4,
      allowNull: false,
      defaultValue: 'uuid_generate_v4()',
      primaryKey: true
    },
    email: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    password: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    created_at: {
      type: DataTypes.TIME,
      allowNull: false,
      defaultValue: sequelize.fn('now')
    },
    updated_at: {
      type: DataTypes.TIME,
      allowNull: false,
      defaultValue: sequelize.fn('now')
    },
    deleted_at: {
      type: DataTypes.TIME,
      allowNull: true
    }
  }, {
    tableName: 'users'
  });
};
