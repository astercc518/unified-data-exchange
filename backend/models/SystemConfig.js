/**
 * 系统配置模型
 */
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const SystemConfig = sequelize.define('SystemConfig', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: '配置ID'
    },
    config_key: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      comment: '配置键'
    },
    config_value: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: '配置值(JSON格式)'
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: '配置描述'
    },
    create_time: {
      type: DataTypes.BIGINT,
      allowNull: false,
      comment: '创建时间戳'
    },
    update_time: {
      type: DataTypes.BIGINT,
      allowNull: true,
      comment: '更新时间戳'
    }
  }, {
    tableName: 'system_config',
    timestamps: false,
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci'
  });

  return SystemConfig;
};
