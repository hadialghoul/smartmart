import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import Store from './Store.js';

const MobPurshaseTransaction = sequelize.define('MobPurshaseTransaction', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  item_number: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
   image: {
    type: DataTypes.STRING,
    allowNull: true
  },
  branch_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Store,
      key: 'id'
    }
  }
}, {
  tableName: 'mob_purshase_transaction',
  timestamps: false, // Disable createdAt and updatedAt
  freezeTableName: true // Use exact table name, don't pluralize
});

// Define associations
MobPurshaseTransaction.belongsTo(Store, {
  foreignKey: 'branch_id',
  as: 'store'
});

Store.hasMany(MobPurshaseTransaction, {
  foreignKey: 'branch_id',
  as: 'purshaseTransactions'
});

export default MobPurshaseTransaction;