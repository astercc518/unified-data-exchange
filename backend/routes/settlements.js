const express = require('express');
const router = express.Router();
const SettlementService = require('../services/settlementService');
const { models } = require('../config/database');
const { SmsSettlement, SmsSettlementDetail, User, SmsChannel } = models;
const { Op } = require('sequelize');
const moment = require('moment');

/**
 * 获取结算列表
 * GET /api/sms/settlements
 */
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      start_date,
      end_date,
      customer_id,
      channel_id,
      country,
      settlement_status
    } = req.query;

    const where = {};
    
    // 日期范围
    if (start_date && end_date) {
      where.settlement_date = {
        [Op.between]: [start_date, end_date]
      };
    } else if (start_date) {
      where.settlement_date = { [Op.gte]: start_date };
    } else if (end_date) {
      where.settlement_date = { [Op.lte]: end_date };
    }

    // 客户筛选
    if (customer_id) {
      where.customer_id = customer_id;
    }

    // 通道筛选
    if (channel_id) {
      where.channel_id = channel_id;
    }

    // 国家筛选
    if (country) {
      where.country = country;
    }

    // 结算状态筛选
    if (settlement_status) {
      where.settlement_status = settlement_status;
    }

    const offset = (page - 1) * limit;

    const { count, rows } = await SmsSettlement.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'customer',
          attributes: ['id', 'customer_name', 'email']
        },
        {
          model: SmsChannel,
          as: 'channel',
          attributes: ['id', 'channel_name', 'protocol_type']
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['settlement_date', 'DESC'], ['id', 'DESC']]
    });

    res.json({
      code: 200,
      message: '获取成功',
      data: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        list: rows
      }
    });
  } catch (error) {
    console.error('获取结算列表失败:', error);
    res.status(500).json({
      code: 500,
      message: '获取结算列表失败',
      error: error.message
    });
  }
});

/**
 * 获取结算详情
 * GET /api/sms/settlements/:id
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const settlement = await SmsSettlement.findByPk(id, {
      include: [
        {
          model: User,
          as: 'customer',
          attributes: ['id', 'customer_name', 'email', 'company']
        },
        {
          model: SmsChannel,
          as: 'channel',
          attributes: ['id', 'channel_name', 'protocol_type', 'platform_type']
        }
      ]
    });

    if (!settlement) {
      return res.status(404).json({
        code: 404,
        message: '结算记录不存在'
      });
    }

    res.json({
      code: 200,
      message: '获取成功',
      data: settlement
    });
  } catch (error) {
    console.error('获取结算详情失败:', error);
    res.status(500).json({
      code: 500,
      message: '获取结算详情失败',
      error: error.message
    });
  }
});

/**
 * 获取结算明细列表
 * GET /api/sms/settlements/:id/details
 */
router.get('/:id/details', async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 50 } = req.query;

    // 验证结算记录是否存在
    const settlement = await SmsSettlement.findByPk(id);
    if (!settlement) {
      return res.status(404).json({
        code: 404,
        message: '结算记录不存在'
      });
    }

    const offset = (page - 1) * limit;

    const { count, rows } = await SmsSettlementDetail.findAndCountAll({
      where: { settlement_id: id },
      include: [
        {
          model: SmsSettlement,
          as: 'settlement',
          attributes: ['id', 'settlement_date', 'customer_id', 'channel_id']
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['id', 'ASC']]
    });

    res.json({
      code: 200,
      message: '获取成功',
      data: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        list: rows
      }
    });
  } catch (error) {
    console.error('获取结算明细失败:', error);
    res.status(500).json({
      code: 500,
      message: '获取结算明细失败',
      error: error.message
    });
  }
});

/**
 * 手动触发结算（计算指定日期的结算）
 * POST /api/sms/settlements/calculate
 */
router.post('/calculate', async (req, res) => {
  try {
    const { date } = req.body;

    if (!date) {
      return res.status(400).json({
        code: 400,
        message: '请提供结算日期'
      });
    }

    // 验证日期格式
    if (!moment(date, 'YYYY-MM-DD', true).isValid()) {
      return res.status(400).json({
        code: 400,
        message: '日期格式错误，请使用 YYYY-MM-DD 格式'
      });
    }

    // 检查是否已经结算过
    const existingSettlements = await SmsSettlement.findAll({
      where: {
        settlement_date: date,
        settlement_status: 'completed'
      }
    });

    if (existingSettlements.length > 0) {
      return res.status(400).json({
        code: 400,
        message: '该日期已经结算完成，如需重新结算请使用重新结算接口'
      });
    }

    const result = await SettlementService.autoSettle(date);

    res.json({
      code: 200,
      message: '结算成功',
      data: result
    });
  } catch (error) {
    console.error('结算失败:', error);
    res.status(500).json({
      code: 500,
      message: '结算失败',
      error: error.message
    });
  }
});

/**
 * 重新结算（删除旧结算数据并重新计算）
 * POST /api/sms/settlements/:id/resettle
 */
router.post('/:id/resettle', async (req, res) => {
  try {
    const { id } = req.params;

    const settlement = await SmsSettlement.findByPk(id);
    if (!settlement) {
      return res.status(404).json({
        code: 404,
        message: '结算记录不存在'
      });
    }

    const result = await SettlementService.reSettlement(id);

    res.json({
      code: 200,
      message: '重新结算成功',
      data: result
    });
  } catch (error) {
    console.error('重新结算失败:', error);
    res.status(500).json({
      code: 500,
      message: '重新结算失败',
      error: error.message
    });
  }
});

/**
 * 批量重新结算（按日期）
 * POST /api/sms/settlements/batch/resettle
 */
router.post('/batch/resettle', async (req, res) => {
  try {
    const { date } = req.body;

    if (!date) {
      return res.status(400).json({
        code: 400,
        message: '请提供结算日期'
      });
    }

    const settlements = await SmsSettlement.findAll({
      where: { settlement_date: date }
    });

    if (settlements.length === 0) {
      return res.status(404).json({
        code: 404,
        message: '未找到该日期的结算记录'
      });
    }

    const results = [];
    for (const settlement of settlements) {
      try {
        const result = await SettlementService.reSettlement(settlement.id);
        results.push({ settlement_id: settlement.id, status: 'success', data: result });
      } catch (error) {
        results.push({ settlement_id: settlement.id, status: 'failed', error: error.message });
      }
    }

    res.json({
      code: 200,
      message: '批量重新结算完成',
      data: {
        total: settlements.length,
        results
      }
    });
  } catch (error) {
    console.error('批量重新结算失败:', error);
    res.status(500).json({
      code: 500,
      message: '批量重新结算失败',
      error: error.message
    });
  }
});

/**
 * 生成业绩报表
 * GET /api/sms/settlements/reports/generate
 */
router.get('/reports/generate', async (req, res) => {
  try {
    const {
      start_date,
      end_date,
      customer_id,
      channel_id,
      country,
      group_by = 'date' // date, customer, channel, country
    } = req.query;

    if (!start_date || !end_date) {
      return res.status(400).json({
        code: 400,
        message: '请提供开始日期和结束日期'
      });
    }

    const result = await SettlementService.generateReport({
      start_date,
      end_date,
      customer_id,
      channel_id,
      country,
      group_by
    });

    res.json({
      code: 200,
      message: '报表生成成功',
      data: result.data
    });
  } catch (error) {
    console.error('生成报表失败:', error);
    res.status(500).json({
      code: 500,
      message: '生成报表失败',
      error: error.message
    });
  }
});

/**
 * 获取结算统计概览
 * GET /api/sms/settlements/statistics/overview
 */
router.get('/statistics/overview', async (req, res) => {
  try {
    const { start_date, end_date, customer_id } = req.query;

    const where = {};
    
    if (start_date && end_date) {
      where.settlement_date = {
        [Op.between]: [start_date, end_date]
      };
    }

    if (customer_id) {
      where.customer_id = customer_id;
    }

    where.settlement_status = 'completed';

    const settlements = await SmsSettlement.findAll({
      where,
      attributes: [
        'settlement_date',
        'total_count',
        'success_count',
        'total_cost',
        'total_revenue',
        'total_profit'
      ]
    });

    const overview = {
      total_settlements: settlements.length,
      total_sms_count: settlements.reduce((sum, s) => sum + s.total_count, 0),
      total_success_count: settlements.reduce((sum, s) => sum + s.success_count, 0),
      total_cost: settlements.reduce((sum, s) => sum + parseFloat(s.total_cost), 0).toFixed(4),
      total_revenue: settlements.reduce((sum, s) => sum + parseFloat(s.total_revenue), 0).toFixed(4),
      total_profit: settlements.reduce((sum, s) => sum + parseFloat(s.total_profit), 0).toFixed(4),
      avg_profit_margin: settlements.length > 0 
        ? ((settlements.reduce((sum, s) => sum + parseFloat(s.total_profit), 0) / 
            settlements.reduce((sum, s) => sum + parseFloat(s.total_revenue), 0)) * 100).toFixed(2) + '%'
        : '0%'
    };

    res.json({
      code: 200,
      message: '获取成功',
      data: overview
    });
  } catch (error) {
    console.error('获取统计概览失败:', error);
    res.status(500).json({
      code: 500,
      message: '获取统计概览失败',
      error: error.message
    });
  }
});

/**
 * 导出结算数据（CSV格式）
 * GET /api/sms/settlements/export/csv
 */
router.get('/export/csv', async (req, res) => {
  try {
    const { start_date, end_date, customer_id, channel_id } = req.query;

    const where = {};
    
    if (start_date && end_date) {
      where.settlement_date = {
        [Op.between]: [start_date, end_date]
      };
    }

    if (customer_id) where.customer_id = customer_id;
    if (channel_id) where.channel_id = channel_id;

    const settlements = await SmsSettlement.findAll({
      where,
      include: [
        {
          model: User,
          as: 'customer',
          attributes: ['customer_name', 'company']
        },
        {
          model: SmsChannel,
          as: 'channel',
          attributes: ['name']
        }
      ],
      order: [['settlement_date', 'DESC']]
    });

    // 生成CSV内容
    let csvContent = '结算日期,客户,通道,国家,发送总数,成功数,成本价,销售价,总成本,总收入,总利润,状态\n';
    
    settlements.forEach(s => {
      csvContent += `${s.settlement_date},${s.customer?.customer_name || ''},${s.channel?.channel_name || ''},${s.country},${s.total_count},${s.success_count},${s.cost_price},${s.sale_price},${s.total_cost},${s.total_revenue},${s.total_profit},${s.settlement_status}\n`;
    });

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename=settlements_${moment().format('YYYYMMDD_HHmmss')}.csv`);
    res.send('\ufeff' + csvContent); // UTF-8 BOM
  } catch (error) {
    console.error('导出CSV失败:', error);
    res.status(500).json({
      code: 500,
      message: '导出CSV失败',
      error: error.message
    });
  }
});

module.exports = router;
