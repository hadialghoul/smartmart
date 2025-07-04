import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import Store from './Store.js';

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },

  user_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  phone_number: {
    type: DataTypes.STRING,
    allowNull: true
  },
  email_address: {
    type: DataTypes.STRING,
    allowNull: true
  },
  gender: {
    type: DataTypes.ENUM('male', 'female', 'other'),
    allowNull: true
  },
  disabled: {
    type: DataTypes.TINYINT,
    allowNull: false,
    defaultValue: 0
  },
  role: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  main_image: {
    type: DataTypes.STRING,
    allowNull: true
  },
  token: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  mobile_token: {
    type: DataTypes.STRING,
    allowNull: true
  },
  secret_key: {
    type: DataTypes.STRING,
    allowNull: true
  },
  language_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  last_seen: {
    type: DataTypes.DATE,
    allowNull: true
  },
  status: {
    type: DataTypes.STRING,
    allowNull: true
  },
  default_branch: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: Store,
      key: 'id'
    }
  }
}, {
  tableName: 'users', // corrected table name
  timestamps: false,
  freezeTableName: true
});

export default User;
