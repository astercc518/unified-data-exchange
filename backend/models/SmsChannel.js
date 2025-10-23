/**
 * 短信通道模型
 */
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const SmsChannel = sequelize.define('SmsChannel', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    channel_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: '通道名称'
    },
    country: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: '国家（已废弃，使用sms_channel_countries表）'
    },
    country_code: {
      type: DataTypes.STRING(10),
      allowNull: true,
      comment: '国家代码（已废弃）'
    },
    price_per_sms: {
      type: DataTypes.DECIMAL(10, 4),
      allowNull: true,
      defaultValue: 0,
      comment: '每条短信价格（已废弃）'
    },
    max_chars: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 160,
      comment: '最大字符数（已废弃）'
    },
    gateway_url: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: '网关地址'
    },
    account: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: '账号'
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: '密码'
    },
    status: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      comment: '状态：0-禁用 1-启用'
    },
    platform_type: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: '平台类型（已废弃，通道支持多国家）'
    },
    protocol_type: {
      type: DataTypes.STRING(20),
      defaultValue: 'http',
      comment: '协议类型：http, https, smpp'
    },
    smpp_host: {
      type: DataTypes.STRING(255),
      comment: 'SMPP服务器地址'
    },
    smpp_port: {
      type: DataTypes.INTEGER,
      comment: 'SMPP端口'
    },
    smpp_system_id: {
      type: DataTypes.STRING(100),
      comment: 'SMPP系统ID'
    },
    smpp_system_type: {
      type: DataTypes.STRING(50),
      comment: 'SMPP系统类型'
    },
    smpp_ton: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: 'SMPP源地址TON (Type of Number)'
    },
    smpp_npi: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: 'SMPP源地址NPI (Numbering Plan Indicator)'
    },
    http_method: {
      type: DataTypes.STRING(10),
      defaultValue: 'POST',
      comment: 'HTTP请求方法：GET, POST'
    },
    http_headers: {
      type: DataTypes.TEXT,
      comment: 'HTTP请求头（JSON格式）'
    },
    request_template: {
      type: DataTypes.TEXT,
      comment: '请求模板（JSON格式）'
    },
    response_success_pattern: {
      type: DataTypes.STRING(255),
      comment: '成功响应匹配模式（正则或JSON路径）'
    },
    extno: {
      type: DataTypes.STRING(20),
      defaultValue: '10690',
      comment: 'SMS57接入码'
    },
    api_key: {
      type: DataTypes.STRING(255),
      comment: 'API密钥（如需要）'
    },
    extra_params: {
      type: DataTypes.TEXT,
      comment: '额外参数（JSON格式）'
    },
    daily_limit: {
      type: DataTypes.INTEGER,
      comment: '每日发送限额'
    },
    // 速率控制相关字段
    rate_limit_enabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: '是否启用速率控制'
    },
    rate_limit_per_second: {
      type: DataTypes.INTEGER,
      defaultValue: 100,
      comment: '每秒最大请求数'
    },
    rate_limit_per_minute: {
      type: DataTypes.INTEGER,
      defaultValue: null,
      comment: '每分钟最大请求数'
    },
    rate_limit_per_hour: {
      type: DataTypes.INTEGER,
      defaultValue: null,
      comment: '每小时最大请求数'
    },
    rate_limit_concurrent: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      comment: '最大并发请求数'
    },
    success_rate: {
      type: DataTypes.DECIMAL(5, 2),
      comment: '成功率（%）'
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
    tableName: 'sms_channels',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return SmsChannel;
};
