/**
 * 短信结算服务
 * 负责自动结算、计算利润、生成报表
 */
const { models, sequelize } = require('../config/database');
const { Op } = require('sequelize');
const logger = require('../utils/logger');
const moment = require('moment');
const _ = require('lodash');

const {
  SmsRecord,
  SmsSettlement,
  SmsSettlementDetail,
  SmsChannel,
  User,
  SmsChannelCountry
} = models;

class SettlementService {
  /**
   * 自动结算指定日期的数据
   * @param {String} date - 结算日期 YYYY-MM-DD
   * @returns {Promise<Object>}
   */
  static async autoSettle(date) {
    const transaction = await sequelize.transaction();
    
    try {
      logger.info(`开始自动结算: ${date}`);
      
      // 1. 获取当天所有成功的发送记录
      const records = await SmsRecord.findAll({
        where: {
          sent_at: {
            [Op.between]: [
              `${date} 00:00:00`,
              `${date} 23:59:59`
            ]
          },
          status: 'success'  // 只结算成功的
        },
        transaction
      });

      if (records.length === 0) {
        await transaction.commit();
        logger.info(`${date} 无需结算的记录`);
        return {
          success: true,
          message: '无需结算的记录',
          data: { date, count: 0 }
        };
      }

      // 2. 按客户、通道、国家分组
      const groups = _.groupBy(records, r => 
        `${r.customer_id}_${r.channel_id}_${r.country}`
      );

      const settlements = [];
      let totalSettlements = 0;

      // 3. 为每组创建结算记录
      for (const [key, groupRecords] of Object.entries(groups)) {
        const [customerId, channelId, country] = key.split('_');
        
        const totalCount = groupRecords.length;
        const totalCost = _.sumBy(groupRecords, r => parseFloat(r.cost_price) || 0);
        const totalRevenue = _.sumBy(groupRecords, r => parseFloat(r.sale_price) || 0);
        const totalProfit = totalRevenue - totalCost;
        
        // 创建或更新结算记录
        const [settlement, created] = await SmsSettlement.findOrCreate({
          where: {
            settlement_date: date,
            customer_id: customerId,
            channel_id: channelId,
            country: country
          },
          defaults: {
            total_count: totalCount,
            success_count: totalCount,
            failed_count: 0,
            total_cost: totalCost,
            total_revenue: totalRevenue,
            total_profit: totalProfit,
            cost_price: totalCost / totalCount,
            sale_price: totalRevenue / totalCount,
            settlement_status: 'completed'
          },
          transaction
        });

        if (!created) {
          // 如果已存在，更新数据
          await settlement.update({
            total_count: totalCount,
            success_count: totalCount,
            total_cost: totalCost,
            total_revenue: totalRevenue,
            total_profit: totalProfit,
            cost_price: totalCost / totalCount,
            sale_price: totalRevenue / totalCount,
            settlement_status: 'completed'
          }, { transaction });
        }

        // 删除旧的明细
        await SmsSettlementDetail.destroy({
          where: { settlement_id: settlement.id },
          transaction
        });

        // 创建明细记录
        const details = groupRecords.map(r => ({
          settlement_id: settlement.id,
          record_id: r.id,
          phone_number: r.phone_number,
          cost: r.cost_price || 0,
          revenue: r.sale_price || 0,
          profit: (parseFloat(r.sale_price) || 0) - (parseFloat(r.cost_price) || 0),
          status: r.status,
          sent_at: r.sent_at
        }));

        await SmsSettlementDetail.bulkCreate(details, { transaction });

        settlements.push({
          customer_id: customerId,
          channel_id: channelId,
          country,
          total_count: totalCount,
          total_cost: totalCost,
          total_revenue: totalRevenue,
          total_profit: totalProfit
        });

        totalSettlements++;
      }

      await transaction.commit();

      logger.info(`${date} 结算完成: ${totalSettlements}条结算记录, ${records.length}条发送记录`);

      return {
        success: true,
        message: '结算完成',
        data: {
          date,
          total_settlements: totalSettlements,
          total_records: records.length,
          settlements
        }
      };

    } catch (error) {
      await transaction.rollback();
      logger.error('自动结算失败:', error);
      throw error;
    }
  }

  /**
   * 计算客户指定日期的结算数据（不保存）
   * @param {Number} customerId
   * @param {String} date
   * @returns {Promise<Object>}
   */
  static async calculateCustomerSettlement(customerId, date) {
    try {
      const records = await SmsRecord.findAll({
        where: {
          customer_id: customerId,
          sent_at: {
            [Op.between]: [
              `${date} 00:00:00`,
              `${date} 23:59:59`
            ]
          },
          status: 'success'
        },
        include: [
          {
            model: SmsChannel,
            as: 'channel',
            attributes: ['id', 'channel_name']
          }
        ]
      });

      const groups = _.groupBy(records, r => 
        `${r.channel_id}_${r.country}`
      );

      const summary = {
        date,
        customer_id: customerId,
        total_records: records.length,
        total_cost: 0,
        total_revenue: 0,
        total_profit: 0,
        by_channel: []
      };

      for (const [key, groupRecords] of Object.entries(groups)) {
        const [channelId, country] = key.split('_');
        
        const cost = _.sumBy(groupRecords, r => parseFloat(r.cost_price) || 0);
        const revenue = _.sumBy(groupRecords, r => parseFloat(r.sale_price) || 0);
        const profit = revenue - cost;

        summary.total_cost += cost;
        summary.total_revenue += revenue;
        summary.total_profit += profit;

        summary.by_channel.push({
          channel_id: channelId,
          channel_name: groupRecords[0].channel?.channel_name,
          country,
          count: groupRecords.length,
          cost,
          revenue,
          profit,
          profit_rate: revenue > 0 ? ((profit / revenue) * 100).toFixed(2) + '%' : '0%'
        });
      }

      return summary;

    } catch (error) {
      logger.error('计算客户结算失败:', error);
      throw error;
    }
  }

  /**
   * 生成结算报表
   * @param {Object} params - 查询参数
   * @returns {Promise<Object>}
   */
  static async generateReport(params) {
    try {
      const {
        start_date,
        end_date,
        customer_id,
        channel_id,
        country,
        group_by = 'date'  // date, customer, channel, country
      } = params;

      const where = {
        settlement_status: 'completed'
      };

      if (start_date && end_date) {
        where.settlement_date = {
          [Op.between]: [start_date, end_date]
        };
      }
      if (customer_id) where.customer_id = customer_id;
      if (channel_id) where.channel_id = channel_id;
      if (country) where.country = country;

      const settlements = await SmsSettlement.findAll({
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
            attributes: ['id', 'channel_name']
          }
        ],
        order: [['settlement_date', 'DESC']]
      });

      // 按指定维度分组统计
      let groupedData = [];
      
      switch (group_by) {
        case 'customer':
          groupedData = this._groupByCustomer(settlements);
          break;
        case 'channel':
          groupedData = this._groupByChannel(settlements);
          break;
        case 'country':
          groupedData = this._groupByCountry(settlements);
          break;
        case 'date':
        default:
          groupedData = this._groupByDate(settlements);
          break;
      }

      // 计算总计
      const summary = {
        total_count: _.sumBy(settlements, s => s.total_count),
        total_cost: _.sumBy(settlements, s => parseFloat(s.total_cost)),
        total_revenue: _.sumBy(settlements, s => parseFloat(s.total_revenue)),
        total_profit: _.sumBy(settlements, s => parseFloat(s.total_profit))
      };

      summary.profit_rate = summary.total_revenue > 0 
        ? ((summary.total_profit / summary.total_revenue) * 100).toFixed(2) + '%'
        : '0%';

      return {
        success: true,
        data: {
          summary,
          grouped_data: groupedData,
          raw_data: settlements
        }
      };

    } catch (error) {
      logger.error('生成结算报表失败:', error);
      throw error;
    }
  }

  /**
   * 按日期分组
   */
  static _groupByDate(settlements) {
    const groups = _.groupBy(settlements, 'settlement_date');
    return Object.entries(groups).map(([date, items]) => ({
      date,
      count: _.sumBy(items, i => i.total_count),
      cost: _.sumBy(items, i => parseFloat(i.total_cost)),
      revenue: _.sumBy(items, i => parseFloat(i.total_revenue)),
      profit: _.sumBy(items, i => parseFloat(i.total_profit))
    }));
  }

  /**
   * 按客户分组
   */
  static _groupByCustomer(settlements) {
    const groups = _.groupBy(settlements, 'customer_id');
    return Object.entries(groups).map(([customerId, items]) => ({
      customer_id: customerId,
      customer_name: items[0].customer?.customer_name,
      count: _.sumBy(items, i => i.total_count),
      cost: _.sumBy(items, i => parseFloat(i.total_cost)),
      revenue: _.sumBy(items, i => parseFloat(i.total_revenue)),
      profit: _.sumBy(items, i => parseFloat(i.total_profit))
    }));
  }

  /**
   * 按通道分组
   */
  static _groupByChannel(settlements) {
    const groups = _.groupBy(settlements, 'channel_id');
    return Object.entries(groups).map(([channelId, items]) => ({
      channel_id: channelId,
      channel_name: items[0].channel?.channel_name,
      count: _.sumBy(items, i => i.total_count),
      cost: _.sumBy(items, i => parseFloat(i.total_cost)),
      revenue: _.sumBy(items, i => parseFloat(i.total_revenue)),
      profit: _.sumBy(items, i => parseFloat(i.total_profit))
    }));
  }

  /**
   * 按国家分组
   */
  static _groupByCountry(settlements) {
    const groups = _.groupBy(settlements, 'country');
    return Object.entries(groups).map(([country, items]) => ({
      country,
      count: _.sumBy(items, i => i.total_count),
      cost: _.sumBy(items, i => parseFloat(i.total_cost)),
      revenue: _.sumBy(items, i => parseFloat(i.total_revenue)),
      profit: _.sumBy(items, i => parseFloat(i.total_profit))
    }));
  }

  /**
   * 重新结算
   * @param {Number} settlementId
   * @returns {Promise<Object>}
   */
  static async reSettle(settlementId) {
    const transaction = await sequelize.transaction();
    
    try {
      const settlement = await SmsSettlement.findByPk(settlementId, { transaction });
      
      if (!settlement) {
        throw new Error('结算记录不存在');
      }

      // 重新结算该日期、客户、通道、国家的数据
      await transaction.rollback();  // 先回滚，使用新事务
      
      return await this.autoSettle(settlement.settlement_date);

    } catch (error) {
      await transaction.rollback();
      logger.error('重新结算失败:', error);
      throw error;
    }
  }
}

module.exports = SettlementService;
