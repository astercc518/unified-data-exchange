/**
 * 通道结算API路由
 */
const express = require('express');
const router = express.Router();
const ChannelSettlementService = require('../services/channelSettlementService');
const { models } = require('../config/database');
const { SmsChannelSettlement, SmsChannelSettlementDetail, SmsChannel } = models;
const { Op } = require('sequelize');
const moment = require('moment');

/**
 * 获取通道结算列表
 * GET /api/sms/channel-settlements
 */
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      settlement_month,
      channel_id,
      country,
      settlement_status
    } = req.query;

    const where = {};
    
    if (settlement_month) {
      where.settlement_month = settlement_month;
    }
    if (channel_id) {
      where.channel_id = channel_id;
    }
    if (country) {
      where.country = country;
    }
    if (settlement_status) {
      where.settlement_status = settlement_status;
    }

    const offset = (page - 1) * limit;

    const { count, rows } = await SmsChannelSettlement.findAndCountAll({
      where,
      include: [
        {
          model: SmsChannel,
          as: 'channel',
          attributes: ['id', 'channel_name', 'protocol_type']
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['settlement_month', 'DESC'], ['id', 'DESC']]
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
    console.error('获取通道结算列表失败:', error);
    res.status(500).json({
      code: 500,
      message: '获取通道结算列表失败',
      error: error.message
    });
  }
});

/**
 * 获取通道结算详情
 * GET /api/sms/channel-settlements/:id
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const settlement = await SmsChannelSettlement.findByPk(id, {
      include: [
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
    console.error('获取通道结算详情失败:', error);
    res.status(500).json({
      code: 500,
      message: '获取通道结算详情失败',
      error: error.message
    });
  }
});

/**
 * 获取通道结算明细列表
 * GET /api/sms/channel-settlements/:id/details
 */
router.get('/:id/details', async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 50 } = req.query;

    // 验证结算记录是否存在
    const settlement = await SmsChannelSettlement.findByPk(id);
    if (!settlement) {
      return res.status(404).json({
        code: 404,
        message: '结算记录不存在'
      });
    }

    const offset = (page - 1) * limit;

    const { count, rows } = await SmsChannelSettlementDetail.findAndCountAll({
      where: { settlement_id: id },
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['sent_at', 'DESC']]
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
    console.error('获取通道结算明细失败:', error);
    res.status(500).json({
      code: 500,
      message: '获取通道结算明细失败',
      error: error.message
    });
  }
});

/**
 * 手动触发通道结算
 * POST /api/sms/channel-settlements/calculate
 */
router.post('/calculate', async (req, res) => {
  try {
    const { channel_id, settlement_month, country } = req.body;

    if (!settlement_month) {
      return res.status(400).json({
        code: 400,
        message: '请提供结算月份（格式：YYYY-MM）'
      });
    }

    // 验证月份格式
    if (!moment(settlement_month, 'YYYY-MM', true).isValid()) {
      return res.status(400).json({
        code: 400,
        message: '月份格式错误，请使用 YYYY-MM 格式'
      });
    }

    let result;
    if (channel_id) {
      // 结算单个通道
      result = await ChannelSettlementService.settleChannelMonthly(channel_id, settlement_month, country);
    } else {
      // 批量结算所有通道
      result = await ChannelSettlementService.autoSettleAllChannels(settlement_month);
    }

    res.json({
      code: 200,
      message: '结算完成',
      data: result.data
    });
  } catch (error) {
    console.error('通道结算失败:', error);
    res.status(500).json({
      code: 500,
      message: '结算失败',
      error: error.message
    });
  }
});

/**
 * 获取通道结算统计概览
 * GET /api/sms/channel-settlements/statistics/overview
 */
router.get('/statistics/overview', async (req, res) => {
  try {
    const { settlement_month, channel_id } = req.query;

    const overview = await ChannelSettlementService.getSettlementOverview({
      settlement_month,
      channel_id
    });

    res.json({
      code: 200,
      message: '获取成功',
      data: overview
    });
  } catch (error) {
    console.error('获取通道结算统计概览失败:', error);
    res.status(500).json({
      code: 500,
      message: '获取统计概览失败',
      error: error.message
    });
  }
});

/**
 * 标记结算为已支付
 * POST /api/sms/channel-settlements/:id/pay
 */
router.post('/:id/pay', async (req, res) => {
  try {
    const { id } = req.params;
    const { payment_date, remark } = req.body;

    const settlement = await SmsChannelSettlement.findByPk(id);
    if (!settlement) {
      return res.status(404).json({
        code: 404,
        message: '结算记录不存在'
      });
    }

    await settlement.update({
      settlement_status: 'paid',
      payment_date: payment_date || new Date(),
      remark: remark
    });

    res.json({
      code: 200,
      message: '支付标记成功',
      data: settlement
    });
  } catch (error) {
    console.error('标记支付失败:', error);
    res.status(500).json({
      code: 500,
      message: '标记支付失败',
      error: error.message
    });
  }
});

/**
 * 删除结算记录
 * DELETE /api/sms/channel-settlements/:id
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const settlement = await SmsChannelSettlement.findByPk(id);
    if (!settlement) {
      return res.status(404).json({
        code: 404,
        message: '结算记录不存在'
      });
    }

    // 只允许删除pending状态的记录
    if (settlement.settlement_status === 'paid') {
      return res.status(400).json({
        code: 400,
        message: '已支付的结算记录不能删除'
      });
    }

    await settlement.destroy();

    res.json({
      code: 200,
      message: '删除成功'
    });
  } catch (error) {
    console.error('删除结算记录失败:', error);
    res.status(500).json({
      code: 500,
      message: '删除失败',
      error: error.message
    });
  }
});

module.exports = router;
