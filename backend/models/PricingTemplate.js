/**
 * 定价模板模型
 */
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const PricingTemplate = sequelize.define('PricingTemplate', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  template_name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: '模板名称'
  },
  country: {
    type: DataTypes.STRING(10),
    allowNull: false,
    comment: '国家代码'
  },
  country_name: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: '国家名称'
  },
  data_type: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: '数据类型'
  },
  data_source: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: '数据来源'
  },
  validity: {
    type: DataTypes.STRING(10),
    allowNull: true,
    comment: '时效性(3,30,30+)'
  },
  validity_name: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: '时效性名称'
  },
  cost_price: {
    type: DataTypes.DECIMAL(10, 4),
    allowNull: false,
    defaultValue: 0,
    comment: '成本价(U/条)'
  },
  sell_price: {
    type: DataTypes.DECIMAL(10, 4),
    allowNull: false,
    defaultValue: 0,
    comment: '销售价(U/条)'
  },
  is_default: {
    type: DataTypes.TINYINT(1),
    defaultValue: 0,
    comment: '是否默认模板'
  },
  status: {
    type: DataTypes.TINYINT(1),
    defaultValue: 1,
    comment: '状态(0禁用,1启用)'
  },
  remark: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: '备注'
  },
  create_time: {
    type: DataTypes.BIGINT,
    allowNull: false,
    comment: '创建时间'
  },
  update_time: {
    type: DataTypes.BIGINT,
    allowNull: true,
    comment: '更新时间'
  },
  created_by: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: '创建人'
  }
}, {
  tableName: 'pricing_templates',
  timestamps: false,
  indexes: [
    { fields: ['country'] },
    { fields: ['country', 'data_type'] },
    { fields: ['country', 'validity'] }
  ]
});

module.exports = PricingTemplate;
