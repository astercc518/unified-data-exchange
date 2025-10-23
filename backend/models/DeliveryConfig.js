/**
 * 发货配置模型
 */
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const DeliveryConfig = sequelize.define('DeliveryConfig', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: '配置ID'
    },
    config_type: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
      comment: '配置类型：email-邮箱配置，tgbot-TGBot配置'
    },
    config_data: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: '配置数据(JSON格式)',
      get() {
        const value = this.getDataValue('config_data');
        if (!value) return null;
        try {
          return JSON.parse(value);
        } catch (error) {
          console.error('JSON解析错误:', error);
          return null;
        }
      },
      set(value) {
        this.setDataValue('config_data', JSON.stringify(value));
      }
    },
    status: {
      type: DataTypes.TINYINT,
      defaultValue: 1,
      comment: '状态：1-启用，0-禁用'
    },
    remark: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '备注'
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
    tableName: 'delivery_configs',
    timestamps: false,
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci'
  });

  return DeliveryConfig;
};
