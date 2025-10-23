import request from '@/utils/request'

/**
 * ========================================
 * 通道结算 API
 * ========================================
 */

/**
 * 获取通道结算列表
 * @param {object} params - 查询参数
 */
export function getChannelSettlements(params) {
  return request({
    url: '/api/sms/channel-settlements',
    method: 'get',
    params
  })
}

/**
 * 获取通道结算详情
 * @param {number} id - 结算ID
 */
export function getChannelSettlementDetail(id) {
  return request({
    url: `/api/sms/channel-settlements/${id}`,
    method: 'get'
  })
}

/**
 * 获取通道结算明细列表
 * @param {number} id - 结算ID
 * @param {object} params - 分页参数 { page, limit }
 */
export function getChannelSettlementDetails(id, params) {
  return request({
    url: `/api/sms/channel-settlements/${id}/details`,
    method: 'get',
    params
  })
}

/**
 * 手动触发通道结算
 * @param {object} data - { channel_id, settlement_month, country }
 */
export function calculateChannelSettlement(data) {
  return request({
    url: '/api/sms/channel-settlements/calculate',
    method: 'post',
    data
  })
}

/**
 * 获取通道结算统计概览
 * @param {object} params - 查询参数 { settlement_month, channel_id }
 */
export function getChannelSettlementOverview(params) {
  return request({
    url: '/api/sms/channel-settlements/statistics/overview',
    method: 'get',
    params
  })
}

/**
 * 标记结算为已支付
 * @param {number} id - 结算ID
 * @param {object} data - { payment_date, remark }
 */
export function payChannelSettlement(id, data) {
  return request({
    url: `/api/sms/channel-settlements/${id}/pay`,
    method: 'post',
    data
  })
}

/**
 * 删除通道结算记录
 * @param {number} id - 结算ID
 */
export function deleteChannelSettlement(id) {
  return request({
    url: `/api/sms/channel-settlements/${id}`,
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
export function formatCost(amount, decimals = 4) {
  return parseFloat(amount || 0).toFixed(decimals)
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
