'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class Certificate extends Model {
    static associate(models) {
      // Define associations with User model
      Certificate.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      });
      
      // Define associations with Course model
      Certificate.belongsTo(models.Course, {
        foreignKey: 'course_id',
        as: 'course',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      });
    }
  }
  
  Certificate.init({
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    course_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Courses',
        key: 'id'
      }
    },
    issue_date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    expiration_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    certificate_url: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Certificate',
    hooks: {
      beforeSync: async (options) => {
        try {
          // Check if table exists before trying to drop constraints
          const tableExists = await sequelize.query(
            "SELECT to_regclass('public.\"Certificates\"')",
            { type: sequelize.QueryTypes.SELECT }
          );
          
          if (tableExists[0].to_regclass) {
            // Check if constraints already exist
            const constraints = await sequelize.query(
              "SELECT constraint_name FROM information_schema.table_constraints WHERE table_name = 'Certificates' AND constraint_type = 'FOREIGN KEY'",
              { type: sequelize.QueryTypes.SELECT }
            );
            
            // Create a list of all potential constraint names
            const potentialConstraints = [
              'Certificates_user_id_fkey',
              'Certificates_user_id_fkey1',
              'Certificates_course_id_fkey'
            ];
            
            // Check each potential constraint
            for (const constraint of potentialConstraints) {
              if (!constraints.some(c => c.constraint_name === constraint)) {
                console.log(`Warning: constraint ${constraint} not found, skipping drop constraint`);
                // Set option to skip dropping this constraint
                options[`skip${constraint}Drop`] = true;
              }
            }
          }
        } catch (error) {
          console.error('Error checking constraints:', error);
        }
      }
    }
  });
  
  return Certificate;
};