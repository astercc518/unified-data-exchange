/**
 * 短信发送记录模型
 */
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const SmsRecord = sequelize.define('SmsRecord', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    task_id: {
      type: DataTypes.INTEGER,
      allowNull: true,  // 测试记录可以为NULL
      comment: '任务ID'
    },
    customer_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '客户ID'
    },
    channel_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '通道ID'
    },
    phone_number: {
      type: DataTypes.STRING(20),
      allowNull: false,
      comment: '手机号码'
    },
    country: {
      type: DataTypes.STRING(50),
      comment: '国家'
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: '短信内容'
    },
    status: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'pending',
      comment: '状态：pending-待发送 sending-发送中 success-成功 failed-失败'
    },
    cost: {
      type: DataTypes.DECIMAL(10, 4),
      defaultValue: 0,
      comment: '费用'
    },
    cost_price: {
      type: DataTypes.DECIMAL(10, 4),
      defaultValue: 0,
      comment: '成本价'
    },
    sale_price: {
      type: DataTypes.DECIMAL(10, 4),
      defaultValue: 0,
      comment: '销售价'
    },
    char_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '字符数'
    },
    message_id: {
      type: DataTypes.STRING(100),
      comment: '第三方消息ID'
    },
    response_code: {
      type: DataTypes.STRING(50),
      comment: '响应码'
    },
    response_message: {
      type: DataTypes.TEXT,
      comment: '响应消息'
    },
    send_time: {
      type: DataTypes.DATE,
      comment: '发送时间'
    },
    delivery_time: {
      type: DataTypes.DATE,
      comment: '送达时间'
    },
    sent_at: {
      type: DataTypes.DATE,
      comment: '发送时间（旧字段，保留兼容）'
    },
    delivered_at: {
      type: DataTypes.DATE,
      comment: '送达时间（旧字段，保留兼容）'
    },
    error_message: {
      type: DataTypes.TEXT,
      comment: '错误信息'
    },
    gateway_response: {
      type: DataTypes.TEXT,
      comment: '网关响应'
    },
    retry_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '重试次数'
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
    tableName: 'sms_records',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        fields: ['task_id']
      },
      {
        fields: ['customer_id']
      },
      {
        fields: ['phone_number']
      },
      {
        fields: ['status']
      },
      {
        fields: ['send_time']
      }
    ]
  });

  return SmsRecord;
};
