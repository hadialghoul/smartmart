import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import MobPurshaseTransaction from './MobPurshaseTransaction.js';

const PurshaseData = sequelize.define('PurshaseData', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  datetime: {
    type: DataTypes.DATE,
    allowNull: false
  },
  barcode: {
    type: DataTypes.STRING,
    allowNull: true
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  cost: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  transaction_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: MobPurshaseTransaction,
      key: 'id'
    }
  }
}, {
  tableName: 'mob_purshase_data',
  timestamps: false,
  freezeTableName: true
});

// Define associations
PurshaseData.belongsTo(MobPurshaseTransaction, {
  foreignKey: 'transaction_id',
  as: 'transaction'
});

MobPurshaseTransaction.hasMany(PurshaseData, {
  foreignKey: 'transaction_id',
  as: 'purshaseData' 
});

export default PurshaseData;