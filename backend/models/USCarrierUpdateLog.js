/**
 * 美国运营商数据更新日志模型
 */
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const USCarrierUpdateLog = sequelize.define('USCarrierUpdateLog', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: 'ID'
    },
    update_type: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: '更新类型：full/incremental'
    },
    records_added: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '新增记录数'
    },
    records_updated: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '更新记录数'
    },
    records_deleted: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '删除记录数'
    },
    data_source: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: '数据来源'
    },
    source_file: {
      type: DataTypes.STRING(200),
      allowNull: true,
      comment: '源文件名'
    },
    status: {
      type: DataTypes.STRING(20),
      defaultValue: 'success',
      comment: '状态：success/failed'
    },
    error_message: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '错误信息'
    },
    start_time: {
      type: DataTypes.BIGINT,
      allowNull: false,
      comment: '开始时间戳'
    },
    end_time: {
      type: DataTypes.BIGINT,
      allowNull: true,
      comment: '结束时间戳'
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: '耗时(秒)'
    },
    operator: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: '操作人'
    }
  }, {
    tableName: 'us_carrier_update_log',
    timestamps: false,
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci',
    indexes: [
      {
        fields: ['update_type'],
        name: 'idx_update_type'
      },
      {
        fields: ['status'],
        name: 'idx_status'
      },
      {
        fields: ['start_time'],
        name: 'idx_start_time'
      }
    ]
  });

  return USCarrierUpdateLog;
};
