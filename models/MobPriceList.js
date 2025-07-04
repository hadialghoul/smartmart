import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import PriceData from './PriceData.js';
import MobPriceTransaction from './MobPriceTransaction.js';

const MobPriceList = sequelize.define('MobPriceList', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
 
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  updated_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  branch_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'stores',
      key: 'id'
    }
  },
  transaction_id:{
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: MobPriceTransaction,
      key: 'id'
    }
  }
}, {
  tableName: 'mob_price_list',
  timestamps: false,
  freezeTableName: true
});

export default MobPriceList;
