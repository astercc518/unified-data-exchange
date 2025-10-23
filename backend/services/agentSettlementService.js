/**
 * 代理结算服务
 * 负责代理月度结算、业绩统计、佣金计算
 */
const { models, sequelize } = require('../config/database');
const { Op } = require('sequelize');
const logger = require('../utils/logger');
const moment = require('moment');
const _ = require('lodash');

const {
  SmsRecord,
  SmsAgentSettlement,
  SmsAgentSettlementDetail,
  Agent,
  User
} = models;

class AgentSettlementService {
  /**
   * 代理月度自动结算
   * @param {Number} agentId - 代理ID
   * @param {String} settlementMonth - 结算月份 YYYY-MM
   * @returns {Promise<Object>}
   */
  static async settleAgentMonthly(agentId, settlementMonth) {
    const transaction = await sequelize.transaction();
    
    try {
      logger.info(`开始代理月度结算: 代理ID=${agentId}, 月份=${settlementMonth}`);
      
      // 1. 获取代理信息
      const agent = await Agent.findByPk(agentId, { transaction });
      if (!agent) {
        throw new Error('代理不存在');
      }
      
      // 2. 检查是否已经结算过
      const existingSettlement = await SmsAgentSettlement.findOne({
        where: {
          agent_id: agentId,
          settlement_month: settlementMonth
        },
        transaction
      });
      
      if (existingSettlement && existingSettlement.settlement_status === 'completed') {
        throw new Error('该月份已经结算完成，如需重新结算请先删除或使用重新结算功能');
      }
      
      // 3. 获取代理下所有激活客户
      const customers = await User.findAll({
        where: {
          agent_id: agentId,
          status: 1
        },
        transaction
      });
      
      if (customers.length === 0) {
        logger.info(`代理${agent.agent_name}暂无激活客户，跳过结算`);
        await transaction.commit();
        return {
          success: true,
          message: '该代理暂无激活客户',
          data: { agent_id: agentId, settlement_month: settlementMonth, customer_count: 0 }
        };
      }
      
      const customerIds = customers.map(c => c.id);
      
      // 4. 获取月度所有发送记录（按提交计费，包含所有状态）
      const monthStart = moment(settlementMonth, 'YYYY-MM').startOf('month').format('YYYY-MM-DD HH:mm:ss');
      const monthEnd = moment(settlementMonth, 'YYYY-MM').endOf('month').format('YYYY-MM-DD HH:mm:ss');
      
      const records = await SmsRecord.findAll({
        where: {
          customer_id: { [Op.in]: customerIds },
          created_at: {
            [Op.between]: [monthStart, monthEnd]
          }
        },
        transaction
      });
      
      if (records.length === 0) {
        logger.info(`代理${agent.agent_name}在${settlementMonth}无发送记录`);
        await transaction.commit();
        return {
          success: true,
          message: '该月份无发送记录',
          data: { agent_id: agentId, settlement_month: settlementMonth, records: 0 }
        };
      }
      
      // 5. 统计汇总（按提交计费）
      const totalSubmitted = records.length; // 总提交数
      const totalSuccess = records.filter(r => r.status === 'success').length;
      const totalFailed = records.filter(r => r.status === 'failed').length;
      const successRate = totalSubmitted > 0 ? (totalSuccess / totalSubmitted * 100).toFixed(2) : 0;
      
      // 6. 财务计算（按提交计费，所有记录都计费）
      const totalRevenue = records.reduce((sum, r) => sum + parseFloat(r.sale_price || 0), 0);
      const totalCost = records.reduce((sum, r) => sum + parseFloat(r.cost_price || 0), 0);
      const totalProfit = totalRevenue - totalCost;
      const profitRate = totalRevenue > 0 ? (totalProfit / totalRevenue * 100).toFixed(2) : 0;
      
      // 7. 代理佣金计算
      const agentCommissionRate = parseFloat(agent.commission || 0);
      const agentCommission = totalProfit * (agentCommissionRate / 100);
      
      // 8. 按客户分组统计（明细）
      const groupByCustomer = _.groupBy(records, 'customer_id');
      const details = [];
      
      for (const [customerId, customerRecords] of Object.entries(groupByCustomer)) {
        const customer = customers.find(c => c.id === parseInt(customerId));
        
        const submittedCount = customerRecords.length;
        const successCount = customerRecords.filter(r => r.status === 'success').length;
        const failedCount = customerRecords.filter(r => r.status === 'failed').length;
        
        const revenue = customerRecords.reduce((sum, r) => sum + parseFloat(r.sale_price || 0), 0);
        const cost = customerRecords.reduce((sum, r) => sum + parseFloat(r.cost_price || 0), 0);
        const profit = revenue - cost;
        
        details.push({
          customer_id: parseInt(customerId),
          customer_name: customer?.customer_name || '未知客户',
          submitted_count: submittedCount,
          success_count: successCount,
          failed_count: failedCount,
          revenue: revenue.toFixed(4),
          cost: cost.toFixed(4),
          profit: profit.toFixed(4)
        });
      }
      
      // 9. 创建或更新结算记录
      let settlement;
      if (existingSettlement) {
        await existingSettlement.update({
          total_submitted: totalSubmitted,
          total_success: totalSuccess,
          total_failed: totalFailed,
          success_rate: successRate,
          total_revenue: totalRevenue.toFixed(4),
          total_cost: totalCost.toFixed(4),
          total_profit: totalProfit.toFixed(4),
          profit_rate: profitRate,
          agent_commission_rate: agentCommissionRate,
          agent_commission: agentCommission.toFixed(4),
          customer_count: customers.length,
          settlement_status: 'completed',
          settlement_date: new Date()
        }, { transaction });
        
        settlement = existingSettlement;
        
        // 删除旧明细
        await SmsAgentSettlementDetail.destroy({
          where: { settlement_id: settlement.id },
          transaction
        });
      } else {
        settlement = await SmsAgentSettlement.create({
          settlement_month: settlementMonth,
          agent_id: agentId,
          total_submitted: totalSubmitted,
          total_success: totalSuccess,
          total_failed: totalFailed,
          success_rate: successRate,
          total_revenue: totalRevenue.toFixed(4),
          total_cost: totalCost.toFixed(4),
          total_profit: totalProfit.toFixed(4),
          profit_rate: profitRate,
          agent_commission_rate: agentCommissionRate,
          agent_commission: agentCommission.toFixed(4),
          customer_count: customers.length,
          settlement_status: 'completed',
          settlement_date: new Date()
        }, { transaction });
      }
      
      // 10. 创建明细记录
      const detailsToCreate = details.map(d => ({
        ...d,
        settlement_id: settlement.id
      }));
      
      await SmsAgentSettlementDetail.bulkCreate(detailsToCreate, { transaction });
      
      await transaction.commit();
      
      logger.info(`代理${agent.agent_name}(ID=${agentId}) ${settlementMonth}结算完成: 总提交${totalSubmitted}, 成功${totalSuccess}, 利润${totalProfit.toFixed(4)}, 佣金${agentCommission.toFixed(4)}`);
      
      return {
        success: true,
        message: '结算完成',
        data: {
          settlement_id: settlement.id,
          agent_id: agentId,
          agent_name: agent.agent_name,
          settlement_month: settlementMonth,
          total_submitted: totalSubmitted,
          total_success: totalSuccess,
          total_failed: totalFailed,
          success_rate: successRate + '%',
          total_revenue: totalRevenue.toFixed(4),
          total_cost: totalCost.toFixed(4),
          total_profit: totalProfit.toFixed(4),
          profit_rate: profitRate + '%',
          agent_commission: agentCommission.toFixed(4),
          customer_count: customers.length,
          details_count: details.length
        }
      };
      
    } catch (error) {
      await transaction.rollback();
      logger.error('代理月度结算失败:', error);
      throw error;
    }
  }
  
  /**
   * 批量结算所有代理
   * @param {String} settlementMonth - 结算月份 YYYY-MM
   * @returns {Promise<Object>}
   */
  static async autoSettleAllAgents(settlementMonth) {
    try {
      logger.info(`开始批量代理结算: ${settlementMonth}`);
      
      // 获取所有激活的代理
      const agents = await Agent.findAll({
        where: { status: 1 }
      });
      
      const results = {
        success: [],
        failed: [],
        skipped: []
      };
      
      for (const agent of agents) {
        try {
          const result = await this.settleAgentMonthly(agent.id, settlementMonth);
          
          if (result.data.customer_count === 0 || result.data.records === 0) {
            results.skipped.push({
              agent_id: agent.id,
              agent_name: agent.agent_name,
              reason: result.message
            });
          } else {
            results.success.push({
              agent_id: agent.id,
              agent_name: agent.agent_name,
              ...result.data
            });
          }
        } catch (error) {
          results.failed.push({
            agent_id: agent.id,
            agent_name: agent.agent_name,
            error: error.message
          });
          logger.error(`代理${agent.agent_name}结算失败:`, error);
        }
      }
      
      logger.info(`批量代理结算完成: 成功${results.success.length}, 失败${results.failed.length}, 跳过${results.skipped.length}`);
      
      return {
        success: true,
        message: '批量结算完成',
        data: {
          settlement_month: settlementMonth,
          total_agents: agents.length,
          success_count: results.success.length,
          failed_count: results.failed.length,
          skipped_count: results.skipped.length,
          results
        }
      };
      
    } catch (error) {
      logger.error('批量代理结算失败:', error);
      throw error;
    }
  }
  
  /**
   * 获取代理结算统计概览
   * @param {Object} params - { settlement_month, agent_id }
   * @returns {Promise<Object>}
   */
  static async getSettlementOverview(params) {
    try {
      const { settlement_month, agent_id } = params;
      
      const where = {
        settlement_status: 'completed'
      };
      
      if (settlement_month) {
        where.settlement_month = settlement_month;
      }
      if (agent_id) {
        where.agent_id = agent_id;
      }
      
      const settlements = await SmsAgentSettlement.findAll({
        where,
        include: [
          {
            model: Agent,
            as: 'agent',
            attributes: ['id', 'agent_name', 'email']
          }
        ]
      });
      
      const overview = {
        total_settlements: settlements.length,
        total_submitted: _.sumBy(settlements, s => s.total_submitted),
        total_success: _.sumBy(settlements, s => s.total_success),
        total_failed: _.sumBy(settlements, s => s.total_failed),
        total_revenue: _.sumBy(settlements, s => parseFloat(s.total_revenue)).toFixed(4),
        total_cost: _.sumBy(settlements, s => parseFloat(s.total_cost)).toFixed(4),
        total_profit: _.sumBy(settlements, s => parseFloat(s.total_profit)).toFixed(4),
        total_commission: _.sumBy(settlements, s => parseFloat(s.agent_commission)).toFixed(4),
        avg_success_rate: settlements.length > 0 
          ? (_.sumBy(settlements, s => parseFloat(s.success_rate)) / settlements.length).toFixed(2) + '%'
          : '0%',
        avg_profit_rate: settlements.length > 0
          ? (_.sumBy(settlements, s => parseFloat(s.profit_rate)) / settlements.length).toFixed(2) + '%'
          : '0%'
      };
      
      return overview;
      
    } catch (error) {
      logger.error('获取代理结算概览失败:', error);
      throw error;
    }
  }
}

module.exports = AgentSettlementService;
