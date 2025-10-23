/**
 * 通道国家定价模型
 */
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const SmsChannelCountry = sequelize.define('SmsChannelCountry', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    channel_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '通道ID'
    },
    country: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: '国家名称'
    },
    country_code: {
      type: DataTypes.STRING(10),
      allowNull: false,
      comment: '国家代码'
    },
    cost_price: {
      type: DataTypes.DECIMAL(10, 4),
      allowNull: false,
      defaultValue: 0,
      comment: '成本价/条'
    },
    sale_price: {
      type: DataTypes.DECIMAL(10, 4),
      allowNull: false,
      defaultValue: 0,
      comment: '销售价/条'
    },
    max_chars: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 160,
      comment: '最大字符数'
    },
    status: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      comment: '状态：0-禁用 1-启用'
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'sms_channel_countries',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        fields: ['channel_id']
      },
      {
        fields: ['country']
      },
      {
        unique: true,
        fields: ['channel_id', 'country']
      }
    ]
  });

  return SmsChannelCountry;
};
