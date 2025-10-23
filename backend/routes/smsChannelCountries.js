const express = require('express');
const router = express.Router();
const { models } = require('../config/database');
const { SmsChannelCountry, SmsChannel } = models;
const { Op } = require('sequelize');

/**
 * 获取指定通道的所有国家配置
 * GET /api/sms/channels/:channelId/countries
 */
router.get('/channels/:channelId/countries', async (req, res) => {
  try {
    const { channelId } = req.params;
    const { status, country } = req.query;

    const where = { channel_id: channelId };
    if (status !== undefined) {
      where.status = status;
    }
    if (country) {
      where.country = { [Op.like]: `%${country}%` };
    }

    const countries = await SmsChannelCountry.findAll({
      where,
      include: [{
        model: SmsChannel,
        as: 'channel',
        attributes: ['id', 'channel_name', 'protocol_type']
      }],
      order: [['country', 'ASC']]
    });

    res.json({
      code: 200,
      message: '获取成功',
      data: countries
    });
  } catch (error) {
    console.error('获取通道国家配置失败:', error);
    res.status(500).json({
      code: 500,
      message: '获取通道国家配置失败',
      error: error.message
    });
  }
});

/**
 * 获取单个国家配置详情
 * GET /api/sms/channels/:channelId/countries/:id
 */
router.get('/channels/:channelId/countries/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const country = await SmsChannelCountry.findByPk(id, {
      include: [{
        model: SmsChannel,
        as: 'channel',
        attributes: ['id', 'channel_name', 'protocol_type']
      }]
    });

    if (!country) {
      return res.status(404).json({
        code: 404,
        message: '国家配置不存在'
      });
    }

    res.json({
      code: 200,
      message: '获取成功',
      data: country
    });
  } catch (error) {
    console.error('获取国家配置详情失败:', error);
    res.status(500).json({
      code: 500,
      message: '获取国家配置详情失败',
      error: error.message
    });
  }
});

/**
 * 添加通道国家配置
 * POST /api/sms/channels/:channelId/countries
 */
router.post('/channels/:channelId/countries', async (req, res) => {
  try {
    const { channelId } = req.params;
    const { country, country_code, cost_price, sale_price, max_chars, status } = req.body;

    // 验证必填字段
    if (!country || !country_code || cost_price === undefined || sale_price === undefined) {
      return res.status(400).json({
        code: 400,
        message: '缺少必填字段'
      });
    }

    // 验证通道是否存在
    const channel = await SmsChannel.findByPk(channelId);
    if (!channel) {
      return res.status(404).json({
        code: 404,
        message: '通道不存在'
      });
    }

    // 检查是否已存在相同国家配置
    const existingCountry = await SmsChannelCountry.findOne({
      where: {
        channel_id: channelId,
        country: country
      }
    });

    if (existingCountry) {
      return res.status(400).json({
        code: 400,
        message: `该通道已存在${country}的配置（ID: ${existingCountry.id}），如需修改请使用编辑功能`
      });
    }

    // 创建国家配置
    const newCountry = await SmsChannelCountry.create({
      channel_id: channelId,
      country,
      country_code,
      cost_price,
      sale_price,
      max_chars: max_chars || 160,
      status: status !== undefined ? status : 1
    });

    res.json({
      code: 200,
      message: '添加成功',
      data: newCountry
    });
  } catch (error) {
    console.error('添加国家配置失败:', error);
    res.status(500).json({
      code: 500,
      message: '添加国家配置失败',
      error: error.message
    });
  }
});

/**
 * 更新通道国家配置
 * PUT /api/sms/channels/:channelId/countries/:id
 */
router.put('/channels/:channelId/countries/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { country, country_code, cost_price, sale_price, max_chars, status } = req.body;

    const countryConfig = await SmsChannelCountry.findByPk(id);
    if (!countryConfig) {
      return res.status(404).json({
        code: 404,
        message: '国家配置不存在'
      });
    }

    // 更新字段
    const updateData = {};
    if (country !== undefined) updateData.country = country;
    if (country_code !== undefined) updateData.country_code = country_code;
    if (cost_price !== undefined) updateData.cost_price = cost_price;
    if (sale_price !== undefined) updateData.sale_price = sale_price;
    if (max_chars !== undefined) updateData.max_chars = max_chars;
    if (status !== undefined) updateData.status = status;

    await countryConfig.update(updateData);

    res.json({
      code: 200,
      message: '更新成功',
      data: countryConfig
    });
  } catch (error) {
    console.error('更新国家配置失败:', error);
    res.status(500).json({
      code: 500,
      message: '更新国家配置失败',
      error: error.message
    });
  }
});

/**
 * 删除通道国家配置
 * DELETE /api/sms/channels/:channelId/countries/:id
 */
router.delete('/channels/:channelId/countries/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const countryConfig = await SmsChannelCountry.findByPk(id);
    if (!countryConfig) {
      return res.status(404).json({
        code: 404,
        message: '国家配置不存在'
      });
    }

    await countryConfig.destroy();

    res.json({
      code: 200,
      message: '删除成功'
    });
  } catch (error) {
    console.error('删除国家配置失败:', error);
    res.status(500).json({
      code: 500,
      message: '删除国家配置失败',
      error: error.message
    });
  }
});

/**
 * 批量更新国家配置状态
 * PUT /api/sms/channels/:channelId/countries/batch/status
 */
router.put('/channels/:channelId/countries/batch/status', async (req, res) => {
  try {
    const { channelId } = req.params;
    const { ids, status } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        code: 400,
        message: '请提供要更新的配置ID列表'
      });
    }

    if (status === undefined) {
      return res.status(400).json({
        code: 400,
        message: '请提供状态值'
      });
    }

    const [updatedCount] = await SmsChannelCountry.update(
      { status },
      {
        where: {
          id: { [Op.in]: ids },
          channel_id: channelId
        }
      }
    );

    res.json({
      code: 200,
      message: '批量更新成功',
      data: { updated_count: updatedCount }
    });
  } catch (error) {
    console.error('批量更新状态失败:', error);
    res.status(500).json({
      code: 500,
      message: '批量更新状态失败',
      error: error.message
    });
  }
});

/**
 * 根据国家代码获取价格信息
 * GET /api/sms/channels/:channelId/countries/price/:countryCode
 */
router.get('/channels/:channelId/countries/price/:countryCode', async (req, res) => {
  try {
    const { channelId, countryCode } = req.params;

    const countryConfig = await SmsChannelCountry.findOne({
      where: {
        channel_id: channelId,
        country_code: countryCode,
        status: 1
      }
    });

    if (!countryConfig) {
      return res.status(404).json({
        code: 404,
        message: '未找到该国家的价格配置'
      });
    }

    res.json({
      code: 200,
      message: '获取成功',
      data: {
        cost_price: countryConfig.cost_price,
        sale_price: countryConfig.sale_price,
        max_chars: countryConfig.max_chars
      }
    });
  } catch (error) {
    console.error('获取价格信息失败:', error);
    res.status(500).json({
      code: 500,
      message: '获取价格信息失败',
      error: error.message
    });
  }
});

module.exports = router;
