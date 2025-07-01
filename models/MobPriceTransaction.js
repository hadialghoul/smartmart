import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import Store from './Store.js';

const MobPriceTransaction = sequelize.define('MobPriceTransaction', {
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
  branch_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Store,
      key: 'id'
    }
  }
}, {
  tableName: 'mob_price_transaction',
  timestamps: false, // Disable createdAt and updatedAt
  freezeTableName: true // Use exact table name, don't pluralize
});

// Define associations
MobPriceTransaction.belongsTo(Store, {
  foreignKey: 'branch_id',
  as: 'store'
});

Store.hasMany(MobPriceTransaction, {
  foreignKey: 'branch_id',
  as: 'priceTransactions'
});

export default MobPriceTransaction;
