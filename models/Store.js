import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Store = sequelize.define('Store', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false
  },
  address: {
    type: DataTypes.STRING,
    allowNull: true,
  },
   status: {
    type: DataTypes.STRING,
    allowNull: true,
  },
   phone_number: {
    type: DataTypes.STRING,
    allowNull: true,
  },
   fax: {
    type: DataTypes.STRING,
    allowNull: true,
  },
   latitude: {
    type: DataTypes.STRING,
    allowNull: true,
  },
   longitude: {
    type: DataTypes.STRING,
    allowNull: true,
  },
   manager_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
   description: {
    type: DataTypes.STRING,
    allowNull: true,
  }, main_image: {
    type: DataTypes.STRING,
    allowNull: true,
  }, createdAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  }
}, {
  tableName: 'stores',
  timestamps: false, 
  freezeTableName: true 
});

export default Store;