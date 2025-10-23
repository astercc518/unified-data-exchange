/**
 * 美国号码归属数据模型
 */
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const USPhoneCarrier = sequelize.define('USPhoneCarrier', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: 'ID'
    },
    npa: {
      type: DataTypes.CHAR(3),
      allowNull: false,
      comment: '区号(Area Code / NPA)'
    },
    nxx: {
      type: DataTypes.CHAR(3),
      allowNull: false,
      comment: '前缀(Exchange / NXX)'
    },
    start_range: {
      type: DataTypes.CHAR(4),
      allowNull: false,
      comment: '起始号段(XXXX)'
    },
    end_range: {
      type: DataTypes.CHAR(4),
      allowNull: false,
      comment: '结束号段(XXXX)'
    },
    carrier_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: '运营商名称'
    },
    carrier_type: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: '运营商类型(Wireless/Landline/VoIP)'
    },
    ocn: {
      type: DataTypes.STRING(10),
      allowNull: true,
      comment: '运营商识别码(Operating Company Number)'
    },
    state: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: '州名'
    },
    city: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: '城市'
    },
    lata: {
      type: DataTypes.STRING(10),
      allowNull: true,
      comment: 'LATA代码'
    },
    rate_center: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: '费率中心'
    },
    last_update: {
      type: DataTypes.BIGINT,
      allowNull: false,
      comment: '最后更新时间戳'
    },
    data_source: {
      type: DataTypes.STRING(100),
      defaultValue: 'FCC',
      comment: '数据来源'
    }
  }, {
    tableName: 'us_phone_carrier',
    timestamps: false,
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci',
    indexes: [
      {
        unique: true,
        fields: ['npa', 'nxx', 'start_range', 'end_range'],
        name: 'uk_number_range'
      },
      {
        fields: ['npa'],
        name: 'idx_npa'
      },
      {
        fields: ['npa', 'nxx'],
        name: 'idx_npa_nxx'
      },
      {
        fields: ['carrier_name'],
        name: 'idx_carrier_name'
      },
      {
        fields: ['carrier_type'],
        name: 'idx_carrier_type'
      },
      {
        fields: ['state'],
        name: 'idx_state'
      }
    ]
  });

  return USPhoneCarrier;
};
