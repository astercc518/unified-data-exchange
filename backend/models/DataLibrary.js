/**
 * 数据列表模型
 * 按时效性分类：3天内、30天内、30天以上
 */
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const DataLibrary = sequelize.define('DataLibrary', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: '数据ID'
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
    validity: {
      type: DataTypes.STRING(20),
      allowNull: false,
      comment: '时效性分类：within_3_days, within_30_days, over_30_days'
    },
    validity_name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: '时效性名称'
    },
    total_quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: '总数量'
    },
    available_quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: '可用数量'
    },
    data_type: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: '数据类型（手机号码、邮箱地址等）'
    },
    source: {
      type: DataTypes.STRING(200),
      allowNull: true,
      comment: '数据来源'
    },
    sell_price: {
      type: DataTypes.DECIMAL(10, 5),
      allowNull: true,
      defaultValue: 0,
      comment: '销售价格'
    },
    cost_price: {
      type: DataTypes.DECIMAL(10, 5),
      allowNull: true,
      defaultValue: 0,
      comment: '成本价格'
    },
    remark: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '备注'
    },
    file_name: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: '原始文件名'
    },
    file_path: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: '文件存储路径'
    },
    file_size: {
      type: DataTypes.BIGINT,
      allowNull: true,
      comment: '文件大小（字节）'
    },
    file_hash: {
      type: DataTypes.STRING(64),
      allowNull: true,
      comment: '文件MD5哈希值'
    },
    file_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: '关联的客户数据文件ID'
    },
    operators: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '运营商分配情况(JSON格式存储)',
      get() {
        const value = this.getDataValue('operators')
        if (!value) return null
        try {
          return JSON.parse(value)
        } catch (error) {
          console.error('JSON解析错误:', error)
          return null
        }
      },
      set(value) {
        this.setDataValue('operators', JSON.stringify(value))
      }
    },
    upload_time: {
      type: DataTypes.BIGINT,
      allowNull: false,
      comment: '上传时间戳'
    },
    upload_by: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: '上传人账号'
    },
    publish_time: {
      type: DataTypes.BIGINT,
      allowNull: true,
      comment: '发布时间戳'
    },
    publish_status: {
      type: DataTypes.STRING(20),
      defaultValue: 'pending',
      comment: '发布状态：pending-待发布，published-已发布'
    },
    status: {
      type: DataTypes.STRING(20),
      defaultValue: 'uploaded',
      comment: '数据状态：uploaded-已上传，available-可用，sold_out-售罄'
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
    tableName: 'data_library',
    timestamps: false,
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci'
  });

  return DataLibrary;
};