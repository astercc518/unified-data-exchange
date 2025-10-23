/**
 * 通道结算服务
 * 负责通道月度结算、成本统计
 */
const { models, sequelize } = require('../config/database');
const { Op } = require('sequelize');
const logger = require('../utils/logger');
const moment = require('moment');
const _ = require('lodash');

const {
  SmsRecord,
  SmsChannelSettlement,
  SmsChannelSettlementDetail,
  SmsChannel
} = models;

class ChannelSettlementService {
  /**
   * 通道月度结算（按国家）
   * @param {Number} channelId - 通道ID
   * @param {String} settlementMonth - 结算月份 YYYY-MM
   * @param {String} country - 国家（可选，为空则按所有国家分别结算）
   * @returns {Promise<Object>}
   */
  static async settleChannelMonthly(channelId, settlementMonth, country = null) {
    const transaction = await sequelize.transaction();
    
    try {
      logger.info(`开始通道月度结算: 通道ID=${channelId}, 月份=${settlementMonth}, 国家=${country || '全部'}`);
      
      // 1. 获取通道信息
      const channel = await SmsChannel.findByPk(channelId, { transaction });
      if (!channel) {
        throw new Error('通道不存在');
      }
      
      // 2. 时间范围
      const monthStart = moment(settlementMonth, 'YYYY-MM').startOf('month').format('YYYY-MM-DD HH:mm:ss');
      const monthEnd = moment(settlementMonth, 'YYYY-MM').endOf('month').format('YYYY-MM-DD HH:mm:ss');
      
      // 3. 构建查询条件（只统计成功的）
      const where = {
        channel_id: channelId,
        status: 'success', // 通道结算只统计成功发送的
        sent_at: {
          [Op.between]: [monthStart, monthEnd]
        }
      };
      
      if (country) {
        where.country = country;
      }
      
      // 4. 获取成功记录
      const successRecords = await SmsRecord.findAll({
        where,
        transaction
      });
      
      if (successRecords.length === 0) {
        logger.info(`通道${channel.channel_name}在${settlementMonth}无成功记录`);
        await transaction.commit();
        return {
          success: true,
          message: '该月份无成功发送记录',
          data: { channel_id: channelId, settlement_month: settlementMonth, records: 0 }
        };
      }
      
      // 5. 如果未指定国家，则按国家分组结算
      if (!country) {
        const groupByCountry = _.groupBy(successRecords, 'country');
        const settlements = [];
        
        for (const [countryName, countryRecords] of Object.entries(groupByCountry)) {
          if (!countryName || countryName === 'null' || countryName === 'undefined') {
            continue; // 跳过没有国家信息的记录
          }
          
          const result = await this._createChannelSettlement(
            channelId,
            channel,
            settlementMonth,
            countryName,
            countryRecords,
            transaction
          );
          
          settlements.push(result);
        }
        
        await transaction.commit();
        
        logger.info(`通道${channel.channel_name} ${settlementMonth}分国家结算完成: ${settlements.length}个国家`);
        
        return {
          success: true,
          message: '结算完成',
          data: {
            channel_id: channelId,
            channel_name: channel.channel_name,
            settlement_month: settlementMonth,
            settlements_count: settlements.length,
            settlements
          }
        };
      } else {
        // 6. 指定国家结算
        const result = await this._createChannelSettlement(
          channelId,
          channel,
          settlementMonth,
          country,
          successRecords,
          transaction
        );
        
        await transaction.commit();
        
        logger.info(`通道${channel.channel_name} ${settlementMonth} ${country}结算完成: 成功${result.total_success}条, 成本${result.total_cost}`);
        
        return {
          success: true,
          message: '结算完成',
          data: result
        };
      }
      
    } catch (error) {
      await transaction.rollback();
      logger.error('通道月度结算失败:', error);
      throw error;
    }
  }
  
  /**
   * 创建通道结算记录（内部方法）
   */
  static async _createChannelSettlement(channelId, channel, settlementMonth, country, successRecords, transaction) {
    // 检查是否已存在
    const existingSettlement = await SmsChannelSettlement.findOne({
      where: {
        channel_id: channelId,
        settlement_month: settlementMonth,
        country: country
      },
      transaction
    });
    
    // 统计数据
    const totalSuccess = successRecords.length;
    const totalCost = successRecords.reduce((sum, r) => sum + parseFloat(r.cost_price || 0), 0);
    const avgCostPrice = totalSuccess > 0 ? totalCost / totalSuccess : 0;
    
    // 获取总提交数（用于计算成功率）
    const monthStart = moment(settlementMonth, 'YYYY-MM').startOf('month').format('YYYY-MM-DD HH:mm:ss');
    const monthEnd = moment(settlementMonth, 'YYYY-MM').endOf('month').format('YYYY-MM-DD HH:mm:ss');
    
    const totalSubmitted = await SmsRecord.count({
      where: {
        channel_id: channelId,
        country: country,
        sent_at: {
          [Op.between]: [monthStart, monthEnd]
        }
      },
      transaction
    });
    
    const successRate = totalSubmitted > 0 ? (totalSuccess / totalSubmitted * 100).toFixed(2) : 0;
    
    // 创建或更新结算记录
    let settlement;
    if (existingSettlement) {
      await existingSettlement.update({
        total_success: totalSuccess,
        total_submitted: totalSubmitted,
        success_rate: successRate,
        total_cost: totalCost.toFixed(4),
        avg_cost_price: avgCostPrice.toFixed(4),
        settlement_status: 'completed',
        settlement_date: new Date()
      }, { transaction });
      
      settlement = existingSettlement;
      
      // 删除旧明细
      await SmsChannelSettlementDetail.destroy({
        where: { settlement_id: settlement.id },
        transaction
      });
    } else {
      settlement = await SmsChannelSettlement.create({
        settlement_month: settlementMonth,
        channel_id: channelId,
        country: country,
        total_success: totalSuccess,
        total_submitted: totalSubmitted,
        success_rate: successRate,
        total_cost: totalCost.toFixed(4),
        avg_cost_price: avgCostPrice.toFixed(4),
        settlement_status: 'completed',
        settlement_date: new Date()
      }, { transaction });
    }
    
    // 创建明细记录
    const details = successRecords.map(r => ({
      settlement_id: settlement.id,
      record_id: r.id,
      phone_number: r.phone_number,
      country: r.country,
      cost_price: r.cost_price,
      sent_at: r.sent_at
    }));
    
    await SmsChannelSettlementDetail.bulkCreate(details, { transaction });
    
    return {
      settlement_id: settlement.id,
      channel_id: channelId,
      channel_name: channel.channel_name,
      settlement_month: settlementMonth,
      country: country,
      total_success: totalSuccess,
      total_submitted: totalSubmitted,
      success_rate: successRate + '%',
      total_cost: totalCost.toFixed(4),
      avg_cost_price: avgCostPrice.toFixed(4),
      details_count: details.length
    };
  }
  
  /**
   * 批量结算所有通道
   * @param {String} settlementMonth - 结算月份 YYYY-MM
   * @returns {Promise<Object>}
   */
  static async autoSettleAllChannels(settlementMonth) {
    try {
      logger.info(`开始批量通道结算: ${settlementMonth}`);
      
      // 获取所有激活的通道
      const channels = await SmsChannel.findAll({
        where: { status: 'active' }
      });
      
      const results = {
        success: [],
        failed: [],
        skipped: []
      };
      
      for (const channel of channels) {
        try {
          // 按通道结算（自动分国家）
          const result = await this.settleChannelMonthly(channel.id, settlementMonth, null);
          
          if (result.data.records === 0) {
            results.skipped.push({
              channel_id: channel.id,
              channel_name: channel.channel_name,
              reason: result.message
            });
          } else {
            results.success.push({
              channel_id: channel.id,
              channel_name: channel.channel_name,
              ...result.data
            });
          }
        } catch (error) {
          results.failed.push({
            channel_id: channel.id,
            channel_name: channel.channel_name,
            error: error.message
          });
          logger.error(`通道${channel.channel_name}结算失败:`, error);
        }
      }
      
      logger.info(`批量通道结算完成: 成功${results.success.length}, 失败${results.failed.length}, 跳过${results.skipped.length}`);
      
      return {
        success: true,
        message: '批量结算完成',
        data: {
          settlement_month: settlementMonth,
          total_channels: channels.length,
          success_count: results.success.length,
          failed_count: results.failed.length,
          skipped_count: results.skipped.length,
          results
        }
      };
      
    } catch (error) {
      logger.error('批量通道结算失败:', error);
      throw error;
    }
  }
  
  /**
   * 获取通道结算统计概览
   * @param {Object} params - { settlement_month, channel_id }
   * @returns {Promise<Object>}
   */
  static async getSettlementOverview(params) {
    try {
      const { settlement_month, channel_id } = params;
      
      const where = {
        settlement_status: 'completed'
      };
      
      if (settlement_month) {
        where.settlement_month = settlement_month;
      }
      if (channel_id) {
        where.channel_id = channel_id;
      }
      
      const settlements = await SmsChannelSettlement.findAll({
        where,
        include: [
          {
            model: SmsChannel,
            as: 'channel',
            attributes: ['id', 'channel_name']
          }
        ]
      });
      
      const overview = {
        total_settlements: settlements.length,
        total_success: _.sumBy(settlements, s => s.total_success),
        total_submitted: _.sumBy(settlements, s => s.total_submitted),
        total_cost: _.sumBy(settlements, s => parseFloat(s.total_cost)).toFixed(4),
        avg_success_rate: settlements.length > 0 
          ? (_.sumBy(settlements, s => parseFloat(s.success_rate)) / settlements.length).toFixed(2) + '%'
          : '0%',
        avg_cost_price: settlements.length > 0
          ? (_.sumBy(settlements, s => parseFloat(s.avg_cost_price)) / settlements.length).toFixed(4)
          : '0.0000'
      };
      
      return overview;
      
    } catch (error) {
      logger.error('获取通道结算概览失败:', error);
      throw error;
    }
  }
}

module.exports = ChannelSettlementService;
