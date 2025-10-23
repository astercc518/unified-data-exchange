/**
 * 订单数据记录模型
 * 用于记录订单对应的实际数据行
 */
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const OrderData = sequelize.define('OrderData', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: '记录ID'
    },
    order_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '订单ID'
    },
    order_number: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: '订单编号'
    },
    data_content: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: '数据内容（每行一条记录）'
    },
    data_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: '数据条数'
    },
    operator: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: '运营商名称'
    },
    create_time: {
      type: DataTypes.BIGINT,
      allowNull: false,
      comment: '创建时间戳'
    }
  }, {
    tableName: 'order_data',
    timestamps: false,
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci',
    indexes: [
      {
        fields: ['order_id']
      },
      {
        fields: ['order_number']
      }
    ]
  });

  return OrderData;
};
