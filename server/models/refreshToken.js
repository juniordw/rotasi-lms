export default (sequelize, DataTypes) => {
    /**
     * Model untuk menyimpan refresh token
     * Digunakan untuk implementasi JWT refresh token
     */
    const RefreshToken = sequelize.define('RefreshToken', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      token: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        comment: 'Token string yang digunakan untuk refresh'
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'ID user yang memiliki token ini'
      },
      expires_at: {
        type: DataTypes.DATE,
        allowNull: false,
        comment: 'Tanggal kadaluarsa token'
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
      tableName: 'refresh_tokens',
      timestamps: false,
      indexes: [
        {
          name: 'refresh_token_user_id_idx',
          fields: ['user_id']
        },
        {
          name: 'refresh_token_expires_at_idx',
          fields: ['expires_at']
        }
      ]
    });
  
    // Definisi relasi
    RefreshToken.associate = (models) => {
      RefreshToken.belongsTo(models.User, {
        foreignKey: 'user_id',
        onDelete: 'CASCADE',
        as: 'user'
      });
    };
  
    return RefreshToken;
  };