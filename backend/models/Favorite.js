/**
 * 收藏记录模型
 * 记录客户收藏的数据资源
 */
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Favorite = sequelize.define('Favorite', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: '收藏ID'
    },
    customer_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '客户ID'
    },
    customer_name: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: '客户名称'
    },
    data_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '数据资源ID'
    },
    country: {
      type: DataTypes.STRING(10),
      allowNull: true,
      comment: '国家代码'
    },
    country_name: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: '国家名称'
    },
    data_type: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: '数据类型'
    },
    validity: {
      type: DataTypes.STRING(20),
      allowNull: true,
      comment: '时效性'
    },
    available_quantity: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: '可用数量（收藏时的快照）'
    },
    sell_price: {
      type: DataTypes.DECIMAL(10, 5),
      allowNull: true,
      comment: '销售价格（收藏时的快照）'
    },
    create_time: {
      type: DataTypes.BIGINT,
      allowNull: false,
      comment: '收藏时间戳'
    },
    update_time: {
      type: DataTypes.BIGINT,
      allowNull: true,
      comment: '更新时间戳'
    }
  }, {
    tableName: 'favorites',
    timestamps: false,
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci',
    indexes: [
      {
        name: 'idx_customer_id',
        fields: ['customer_id']
      },
      {
        name: 'idx_data_id',
        fields: ['data_id']
      },
      {
        name: 'idx_customer_data',
        unique: true,
        fields: ['customer_id', 'data_id']
      }
    ]
  });

  return Favorite;
};
