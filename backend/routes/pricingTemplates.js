/**
 * 定价模板路由
 */
const express = require('express');
const router = express.Router();
const PricingTemplate = require('../models/PricingTemplate');
const logger = require('../utils/logger');
const { Op } = require('sequelize');

// 获取定价模板列表
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20, country, data_type, validity, keyword } = req.query;
    
    const where = { status: 1 }; // 只获取启用的模板
    
    if (country) {
      where.country = country;
    }
    if (data_type) {
      where.data_type = data_type;
    }
    if (validity) {
      where.validity = validity;
    }
    if (keyword) {
      where[Op.or] = [
        { template_name: { [Op.like]: `%${keyword}%` } },
        { country_name: { [Op.like]: `%${keyword}%` } }
      ];
    }
    
    const { count, rows } = await PricingTemplate.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: (page - 1) * limit,
      order: [['is_default', 'DESC'], ['create_time', 'DESC']]
    });
    
    logger.info(`获取定价模板列表: ${rows.length} 条，总计: ${count} 条`);
    
    res.json({
      success: true,
      data: rows,
      total: count,
      page: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (error) {
    logger.error('获取定价模板列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取定价模板列表失败',
      error: error.message
    });
  }
});

// 根据国家获取模板（用于数据上传自动引用）
router.get('/by-country/:country', async (req, res) => {
  try {
    const { country } = req.params;
    const { data_type, validity } = req.query;
    
    const where = {
      country,
      status: 1
    };
    
    // 优先匹配：国家 + 数据类型 + 时效性
    if (data_type && validity) {
      where.data_type = data_type;
      where.validity = validity;
    } else if (data_type) {
      where.data_type = data_type;
    } else if (validity) {
      where.validity = validity;
    }
    
    // 优先查找精确匹配的模板
    let templates = await PricingTemplate.findAll({
      where,
      order: [['is_default', 'DESC'], ['create_time', 'DESC']],
      limit: 10
    });
    
    // 如果没有找到，查找该国家的通用模板
    if (templates.length === 0) {
      templates = await PricingTemplate.findAll({
        where: {
          country,
          status: 1,
          data_type: null,
          validity: null
        },
        order: [['is_default', 'DESC'], ['create_time', 'DESC']],
        limit: 10
      });
    }
    
    logger.info(`获取国家 ${country} 的定价模板: ${templates.length} 条`);
    
    res.json({
      success: true,
      data: templates
    });
  } catch (error) {
    logger.error('获取国家定价模板失败:', error);
    res.status(500).json({
      success: false,
      message: '获取国家定价模板失败',
      error: error.message
    });
  }
});

// 创建定价模板
router.post('/', async (req, res) => {
  try {
    const {
      template_name,
      country,
      country_name,
      data_type,
      data_source,
      validity,
      validity_name,
      cost_price,
      sell_price,
      is_default,
      remark,
      created_by
    } = req.body;
    
    // 数据验证
    if (!template_name || !country || !country_name) {
      return res.status(400).json({
        success: false,
        message: '模板名称、国家代码和国家名称不能为空'
      });
    }
    
    if (cost_price === undefined || sell_price === undefined) {
      return res.status(400).json({
        success: false,
        message: '成本价和销售价不能为空'
      });
    }
    
    // 如果设置为默认模板，取消该国家其他默认模板
    if (is_default) {
      await PricingTemplate.update(
        { is_default: 0 },
        { where: { country, is_default: 1 } }
      );
    }
    
    const template = await PricingTemplate.create({
      template_name,
      country,
      country_name,
      data_type: data_type || null,
      data_source: data_source || null,
      validity: validity || null,
      validity_name: validity_name || null,
      cost_price: parseFloat(cost_price),
      sell_price: parseFloat(sell_price),
      is_default: is_default ? 1 : 0,
      status: 1,
      remark: remark || null,
      create_time: Date.now(),
      created_by: created_by || null
    });
    
    logger.info(`创建定价模板成功: ${template.template_name}`);
    
    res.json({
      success: true,
      data: template,
      message: '创建定价模板成功'
    });
  } catch (error) {
    logger.error('创建定价模板失败:', error);
    res.status(500).json({
      success: false,
      message: '创建定价模板失败',
      error: error.message
    });
  }
});

// 更新定价模板
router.put('/:id', async (req, res) => {
  try {
    const template = await PricingTemplate.findByPk(req.params.id);
    
    if (!template) {
      return res.status(404).json({
        success: false,
        message: '模板不存在'
      });
    }
    
    const {
      template_name,
      data_type,
      data_source,
      validity,
      validity_name,
      cost_price,
      sell_price,
      is_default,
      remark
    } = req.body;
    
    // 如果设置为默认模板，取消该国家其他默认模板
    if (is_default && !template.is_default) {
      await PricingTemplate.update(
        { is_default: 0 },
        { where: { country: template.country, is_default: 1 } }
      );
    }
    
    await template.update({
      template_name: template_name !== undefined ? template_name : template.template_name,
      data_type: data_type !== undefined ? data_type : template.data_type,
      data_source: data_source !== undefined ? data_source : template.data_source,
      validity: validity !== undefined ? validity : template.validity,
      validity_name: validity_name !== undefined ? validity_name : template.validity_name,
      cost_price: cost_price !== undefined ? parseFloat(cost_price) : template.cost_price,
      sell_price: sell_price !== undefined ? parseFloat(sell_price) : template.sell_price,
      is_default: is_default !== undefined ? (is_default ? 1 : 0) : template.is_default,
      remark: remark !== undefined ? remark : template.remark,
      update_time: Date.now()
    });
    
    logger.info(`更新定价模板成功: ${template.template_name}`);
    
    res.json({
      success: true,
      data: template,
      message: '更新定价模板成功'
    });
  } catch (error) {
    logger.error('更新定价模板失败:', error);
    res.status(500).json({
      success: false,
      message: '更新定价模板失败',
      error: error.message
    });
  }
});

// 删除定价模板（软删除）
router.delete('/:id', async (req, res) => {
  try {
    const template = await PricingTemplate.findByPk(req.params.id);
    
    if (!template) {
      return res.status(404).json({
        success: false,
        message: '模板不存在'
      });
    }
    
    await template.update({
      status: 0,
      update_time: Date.now()
    });
    
    logger.info(`删除定价模板成功: ${template.template_name}`);
    
    res.json({
      success: true,
      message: '删除定价模板成功'
    });
  } catch (error) {
    logger.error('删除定价模板失败:', error);
    res.status(500).json({
      success: false,
      message: '删除定价模板失败',
      error: error.message
    });
  }
});

// 设置默认模板
router.post('/:id/set-default', async (req, res) => {
  try {
    const template = await PricingTemplate.findByPk(req.params.id);
    
    if (!template) {
      return res.status(404).json({
        success: false,
        message: '模板不存在'
      });
    }
    
    // 取消该国家其他默认模板
    await PricingTemplate.update(
      { is_default: 0 },
      { where: { country: template.country, is_default: 1 } }
    );
    
    // 设置当前模板为默认
    await template.update({
      is_default: 1,
      update_time: Date.now()
    });
    
    logger.info(`设置默认模板成功: ${template.template_name}`);
    
    res.json({
      success: true,
      message: '设置默认模板成功'
    });
  } catch (error) {
    logger.error('设置默认模板失败:', error);
    res.status(500).json({
      success: false,
      message: '设置默认模板失败',
      error: error.message
    });
  }
});

module.exports = router;
