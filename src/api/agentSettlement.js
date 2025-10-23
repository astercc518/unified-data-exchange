import request from '@/utils/request'

/**
 * ========================================
 * 代理结算 API
 * ========================================
 */

/**
 * 获取代理结算列表
 * @param {object} params - 查询参数
 */
export function getAgentSettlements(params) {
  return request({
    url: '/api/sms/agent-settlements',
    method: 'get',
    params
  })
}

/**
 * 获取代理结算详情
 * @param {number} id - 结算ID
 */
export function getAgentSettlementDetail(id) {
  return request({
    url: `/api/sms/agent-settlements/${id}`,
    method: 'get'
  })
}

/**
 * 获取代理结算明细列表
 * @param {number} id - 结算ID
 * @param {object} params - 分页参数 { page, limit }
 */
export function getAgentSettlementDetails(id, params) {
  return request({
    url: `/api/sms/agent-settlements/${id}/details`,
    method: 'get',
    params
  })
}

/**
 * 手动触发代理结算
 * @param {object} data - { agent_id, settlement_month }
 */
export function calculateAgentSettlement(data) {
  return request({
    url: '/api/sms/agent-settlements/calculate',
    method: 'post',
    data
  })
}

/**
 * 获取代理结算统计概览
 * @param {object} params - 查询参数 { settlement_month, agent_id }
 */
export function getAgentSettlementOverview(params) {
  return request({
    url: '/api/sms/agent-settlements/statistics/overview',
    method: 'get',
    params
  })
}

/**
 * 标记结算为已支付
 * @param {number} id - 结算ID
 * @param {object} data - { payment_date, remark }
 */
export function payAgentSettlement(id, data) {
  return request({
    url: `/api/sms/agent-settlements/${id}/pay`,
    method: 'post',
    data
  })
}

/**
 * 删除代理结算记录
 * @param {number} id - 结算ID
 */
export function deleteAgentSettlement(id) {
  return request({
    url: `/api/sms/agent-settlements/${id}`,
    method: 'delete'
  })
}

/**
 * ========================================
 * 辅助工具函数
 * ========================================
 */

/**
 * 格式化金额显示
 * @param {number|string} amount - 金额
 * @param {number} decimals - 小数位数
 */
export function formatAmount(amount, decimals = 4) {
  return parseFloat(amount || 0).toFixed(decimals)
}

/**
 * 计算利润率
 * @param {number|string} profit - 利润
 * @param {number|string} revenue - 收入
 */
export function calculateProfitRate(profit, revenue) {
  const p = parseFloat(profit || 0)
  const r = parseFloat(revenue || 0)
  if (r === 0) return '0%'
  return ((p / r) * 100).toFixed(2) + '%'
}

/**
 * 结算状态映射
 */
export const settlementStatusMap = {
  pending: { label: '待结算', type: 'info' },
  processing: { label: '结算中', type: 'warning' },
  completed: { label: '已完成', type: 'success' },
  paid: { label: '已支付', type: '' },
  cancelled: { label: '已取消', type: 'danger' }
}

/**
 * 获取结算状态标签
 * @param {string} status - 状态值
 */
export function getSettlementStatusLabel(status) {
  return settlementStatusMap[status]?.label || status
}

/**
 * 获取结算状态类型
 * @param {string} status - 状态值
 */
export function getSettlementStatusType(status) {
  return settlementStatusMap[status]?.type || 'info'
}
