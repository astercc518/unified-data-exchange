/**
 * 通道结算明细模型
 */
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const SmsChannelSettlementDetail = sequelize.define('SmsChannelSettlementDetail', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    settlement_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '通道结算ID'
    },
    record_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '发送记录ID'
    },
    phone_number: {
      type: DataTypes.STRING(20),
      comment: '手机号'
    },
    country: {
      type: DataTypes.STRING(50),
      comment: '国家'
    },
    cost_price: {
      type: DataTypes.DECIMAL(10, 4),
      defaultValue: 0,
      comment: '成本价'
    },
    sent_at: {
      type: DataTypes.DATE,
      comment: '发送时间'
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'sms_channel_settlement_details',
    timestamps: false,
    underscored: true,
    createdAt: 'created_at',
    indexes: [
      {
        fields: ['settlement_id']
      },
      {
        fields: ['record_id']
      }
    ]
  });

  return SmsChannelSettlementDetail;
};
