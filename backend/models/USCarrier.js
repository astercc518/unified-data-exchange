/**
 * 美国运营商主表模型
 */
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const USCarrier = sequelize.define('USCarrier', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: 'ID'
    },
    carrier_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      comment: '运营商名称'
    },
    carrier_code: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: '运营商代码'
    },
    carrier_type: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: '运营商类型'
    },
    parent_company: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: '母公司'
    },
    website: {
      type: DataTypes.STRING(200),
      allowNull: true,
      comment: '官网'
    },
    market_share: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0.00,
      comment: '市场份额(%)'
    },
    total_numbers: {
      type: DataTypes.BIGINT,
      defaultValue: 0,
      comment: '拥有号码总数'
    },
    status: {
      type: DataTypes.TINYINT,
      defaultValue: 1,
      comment: '状态：0-停用，1-启用'
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
    tableName: 'us_carriers',
    timestamps: false,
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci',
    indexes: [
      {
        fields: ['carrier_type'],
        name: 'idx_carrier_type'
      },
      {
        fields: ['status'],
        name: 'idx_status'
      }
    ]
  });

  return USCarrier;
};
