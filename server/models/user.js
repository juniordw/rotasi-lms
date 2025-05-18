import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      // Course yang dibuat user (sebagai instructor)
      User.hasMany(models.Course, {
        foreignKey: 'instructor_id',
        as: 'courses'
      });
      
      // Enrollment user
      User.hasMany(models.Enrollment, {
        foreignKey: 'user_id',
        as: 'enrollments'
      });
      
      // Certificate user
      User.hasMany(models.Certificate, {
        foreignKey: 'user_id',
        as: 'certificates'
      });
      
      // Discussion user
      User.hasMany(models.Discussion, {
        foreignKey: 'user_id',
        as: 'discussions'
      });
      
      // Comment user
      User.hasMany(models.Comment, {
        foreignKey: 'user_id',
        as: 'comments'
      });
      
      // Notification user
      User.hasMany(models.Notification, {
        foreignKey: 'user_id',
        as: 'notifications'
      });
      
      // RefreshToken user
      User.hasMany(models.RefreshToken, {
        foreignKey: 'user_id',
        as: 'refreshTokens'
      });
    }
  }
  
  User.init({
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    full_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    role: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'student',
      validate: {
        isIn: [['admin', 'instructor', 'student']]
      }
    },
    department: {
      type: DataTypes.STRING,
      allowNull: false
    },
    avatar_url: {
      type: DataTypes.STRING,
      allowNull: true
    },
    last_login: {
      type: DataTypes.DATE,
      allowNull: true
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    sequelize,
    modelName: 'User',
    tableName: 'Users',
    timestamps: false
  });
  
  return User;
};