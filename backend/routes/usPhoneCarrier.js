/**
 * 美国号码归属查询路由
 */
const express = require('express');
const router = express.Router();
const { sequelize } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const USPhoneCarrier = require('../models/USPhoneCarrier')(sequelize);
const USCarrier = require('../models/USCarrier')(sequelize);
const USCarrierUpdateLog = require('../models/USCarrierUpdateLog')(sequelize);
const { QueryTypes } = require('sequelize');

/**
 * 单号码查询运营商
 */
router.post('/query-single', authenticateToken, async (req, res) => {
  try {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        message: '请提供电话号码'
      });
    }

    // 调用存储过程查询
    const results = await sequelize.query(
      'CALL sp_get_phone_carrier(:phoneNumber)',
      {
        replacements: { phoneNumber },
        type: QueryTypes.SELECT
      }
    );

    if (results && results.length > 0) {
      const result = results[0];
      if (result.error_message) {
        return res.json({
          success: false,
          message: result.error_message
        });
      }

      return res.json({
        success: true,
        data: {
          phoneNumber,
          carrierName: result.carrier_name,
          carrierType: result.carrier_type,
          state: result.state,
          city: result.city,
          ocn: result.ocn,
          rateCenter: result.rate_center
        }
      });
    }

    return res.json({
      success: false,
      message: '未找到该号码的运营商信息'
    });

  } catch (error) {
    console.error('查询号码归属失败:', error);
    res.status(500).json({
      success: false,
      message: '查询失败',
      error: error.message
    });
  }
});

/**
 * 批量查询号码运营商（用于文件分析）
 */
router.post('/query-batch', authenticateToken, async (req, res) => {
  try {
    const { phoneNumbers } = req.body;

    if (!phoneNumbers || !Array.isArray(phoneNumbers)) {
      return res.status(400).json({
        success: false,
        message: '请提供电话号码数组'
      });
    }

    // 清理并分解号码
    const phoneData = phoneNumbers.map(phone => {
      let cleaned = phone.replace(/[^\d]/g, '');
      
      // 如果是11位且以1开头，去除国码
      if (cleaned.length === 11 && cleaned[0] === '1') {
        cleaned = cleaned.substring(1);
      }
      
      if (cleaned.length === 10) {
        return {
          original: phone,
          npa: cleaned.substring(0, 3),
          nxx: cleaned.substring(3, 3),
          xxxx: cleaned.substring(6, 4)
        };
      }
      
      return null;
    }).filter(p => p !== null);

    if (phoneData.length === 0) {
      return res.json({
        success: false,
        message: '没有有效的电话号码'
      });
    }

    // 批量查询
    const results = [];
    for (const phone of phoneData) {
      const carrier = await USPhoneCarrier.findOne({
        where: {
          npa: phone.npa,
          nxx: phone.nxx
        },
        attributes: ['carrier_name', 'carrier_type', 'state', 'city'],
        raw: true
      });

      results.push({
        phoneNumber: phone.original,
        carrierName: carrier ? carrier.carrier_name : 'Unknown',
        carrierType: carrier ? carrier.carrier_type : null,
        state: carrier ? carrier.state : null,
        city: carrier ? carrier.city : null
      });
    }

    return res.json({
      success: true,
      data: results
    });

  } catch (error) {
    console.error('批量查询失败:', error);
    res.status(500).json({
      success: false,
      message: '批量查询失败',
      error: error.message
    });
  }
});

/**
 * 分析文件中号码的运营商分布
 */
router.post('/analyze-distribution', authenticateToken, async (req, res) => {
  try {
    const { phoneNumbers } = req.body;

    if (!phoneNumbers || !Array.isArray(phoneNumbers)) {
      return res.status(400).json({
        success: false,
        message: '请提供电话号码数组'
      });
    }

    // 清理并分解号码
    const phoneData = phoneNumbers.map(phone => {
      let cleaned = phone.replace(/[^\d]/g, '');
      
      if (cleaned.length === 11 && cleaned[0] === '1') {
        cleaned = cleaned.substring(1);
      }
      
      if (cleaned.length === 10) {
        return {
          npa: cleaned.substring(0, 3),
          nxx: cleaned.substring(3, 3)
        };
      }
      
      return null;
    }).filter(p => p !== null);

    // 构建NPA-NXX组合的唯一值
    const uniqueCombos = [...new Set(phoneData.map(p => `${p.npa}-${p.nxx}`))];

    // 批量查询运营商分布
    const distribution = {};
    let unmatchedCount = 0;

    for (const combo of uniqueCombos) {
      const [npa, nxx] = combo.split('-');
      const count = phoneData.filter(p => p.npa === npa && p.nxx === nxx).length;
      
      const carrier = await USPhoneCarrier.findOne({
        where: { npa, nxx },
        attributes: ['carrier_name', 'carrier_type'],
        raw: true
      });

      if (carrier) {
        const key = carrier.carrier_name;
        if (!distribution[key]) {
          distribution[key] = {
            name: key,
            type: carrier.carrier_type,
            count: 0
          };
        }
        distribution[key].count += count;
      } else {
        unmatchedCount += count;
      }
    }

    // 转换为数组格式
    const distributionArray = Object.values(distribution).map(item => ({
      name: item.name,
      count: item.count,
      percentage: ((item.count / phoneNumbers.length) * 100).toFixed(2)
    }));

    return res.json({
      success: true,
      data: {
        totalCount: phoneNumbers.length,
        distribution: distributionArray,
        unmatchedCount,
        unmatchedPercentage: ((unmatchedCount / phoneNumbers.length) * 100).toFixed(2)
      }
    });

  } catch (error) {
    console.error('分析运营商分布失败:', error);
    res.status(500).json({
      success: false,
      message: '分析失败',
      error: error.message
    });
  }
});

/**
 * 获取运营商列表
 */
router.get('/carriers', authenticateToken, async (req, res) => {
  try {
    const carriers = await USCarrier.findAll({
      where: { status: 1 },
      order: [['market_share', 'DESC']],
      raw: true
    });

    return res.json({
      success: true,
      data: carriers
    });

  } catch (error) {
    console.error('获取运营商列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取运营商列表失败',
      error: error.message
    });
  }
});

/**
 * 获取运营商统计信息
 */
router.get('/carrier-stats', authenticateToken, async (req, res) => {
  try {
    const stats = await sequelize.query(
      'SELECT * FROM v_us_carrier_stats',
      { type: QueryTypes.SELECT }
    );

    return res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('获取运营商统计失败:', error);
    res.status(500).json({
      success: false,
      message: '获取统计信息失败',
      error: error.message
    });
  }
});

/**
 * 导入号码归属数据
 */
router.post('/import-data', authenticateToken, async (req, res) => {
  const transaction = await sequelize.transaction();
  const startTime = Date.now();
  
  try {
    const { data, dataSource = 'Manual Import', sourceFile = null } = req.body;

    if (!data || !Array.isArray(data)) {
      return res.status(400).json({
        success: false,
        message: '请提供数据数组'
      });
    }

    let addedCount = 0;
    let updatedCount = 0;

    // 批量插入或更新
    for (const item of data) {
      const [record, created] = await USPhoneCarrier.upsert({
        npa: item.npa,
        nxx: item.nxx,
        start_range: item.start_range || '0000',
        end_range: item.end_range || '9999',
        carrier_name: item.carrier_name,
        carrier_type: item.carrier_type,
        ocn: item.ocn,
        state: item.state,
        city: item.city,
        lata: item.lata,
        rate_center: item.rate_center,
        last_update: Date.now(),
        data_source: dataSource
      }, { transaction });

      if (created) {
        addedCount++;
      } else {
        updatedCount++;
      }
    }

    // 记录更新日志
    await USCarrierUpdateLog.create({
      update_type: 'manual',
      records_added: addedCount,
      records_updated: updatedCount,
      records_deleted: 0,
      data_source: dataSource,
      source_file: sourceFile,
      status: 'success',
      start_time: startTime,
      end_time: Date.now(),
      duration: Math.floor((Date.now() - startTime) / 1000),
      operator: req.user.login_account
    }, { transaction });

    await transaction.commit();

    return res.json({
      success: true,
      message: '数据导入成功',
      data: {
        addedCount,
        updatedCount,
        totalCount: data.length,
        duration: Math.floor((Date.now() - startTime) / 1000)
      }
    });

  } catch (error) {
    await transaction.rollback();
    
    // 记录失败日志
    await USCarrierUpdateLog.create({
      update_type: 'manual',
      records_added: 0,
      records_updated: 0,
      records_deleted: 0,
      data_source: req.body.dataSource || 'Manual Import',
      source_file: req.body.sourceFile,
      status: 'failed',
      error_message: error.message,
      start_time: startTime,
      end_time: Date.now(),
      duration: Math.floor((Date.now() - startTime) / 1000),
      operator: req.user.login_account
    });

    console.error('导入数据失败:', error);
    res.status(500).json({
      success: false,
      message: '数据导入失败',
      error: error.message
    });
  }
});

/**
 * 获取更新日志
 */
router.get('/update-logs', authenticateToken, async (req, res) => {
  try {
    const { page = 1, pageSize = 20 } = req.query;
    const offset = (page - 1) * pageSize;

    const { count, rows } = await USCarrierUpdateLog.findAndCountAll({
      order: [['start_time', 'DESC']],
      limit: parseInt(pageSize),
      offset: offset,
      raw: true
    });

    return res.json({
      success: true,
      data: {
        total: count,
        list: rows,
        page: parseInt(page),
        pageSize: parseInt(pageSize)
      }
    });

  } catch (error) {
    console.error('获取更新日志失败:', error);
    res.status(500).json({
      success: false,
      message: '获取日志失败',
      error: error.message
    });
  }
});

module.exports = router;
