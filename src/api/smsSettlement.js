import request from '@/utils/request'

/**
 * ========================================
 * 通道国家定价配置 API
 * ========================================
 */

/**
 * 获取指定通道的所有国家配置
 * @param {number} channelId - 通道ID
 * @param {object} params - 查询参数 { status, country }
 */
export function getChannelCountries(channelId, params) {
  return request({
    url: `/api/sms/channels/${channelId}/countries`,
    method: 'get',
    params
  })
}

/**
 * 获取单个国家配置详情
 * @param {number} channelId - 通道ID
 * @param {number} id - 配置ID
 */
export function getChannelCountryDetail(channelId, id) {
  return request({
    url: `/api/sms/channels/${channelId}/countries/${id}`,
    method: 'get'
  })
}

/**
 * 添加通道国家配置
 * @param {number} channelId - 通道ID
 * @param {object} data - 配置数据
 */
export function addChannelCountry(channelId, data) {
  return request({
    url: `/api/sms/channels/${channelId}/countries`,
    method: 'post',
    data
  })
}

/**
 * 更新通道国家配置
 * @param {number} channelId - 通道ID
 * @param {number} id - 配置ID
 * @param {object} data - 更新数据
 */
export function updateChannelCountry(channelId, id, data) {
  return request({
    url: `/api/sms/channels/${channelId}/countries/${id}`,
    method: 'put',
    data
  })
}

/**
 * 删除通道国家配置
 * @param {number} channelId - 通道ID
 * @param {number} id - 配置ID
 */
export function deleteChannelCountry(channelId, id) {
  return request({
    url: `/api/sms/channels/${channelId}/countries/${id}`,
    method: 'delete'
  })
}

/**
 * 批量更新国家配置状态
 * @param {number} channelId - 通道ID
 * @param {object} data - { ids: [], status: 0/1 }
 */
export function batchUpdateCountryStatus(channelId, data) {
  return request({
    url: `/api/sms/channels/${channelId}/countries/batch/status`,
    method: 'put',
    data
  })
}

/**
 * 根据国家代码获取价格信息
 * @param {number} channelId - 通道ID
 * @param {string} countryCode - 国家代码
 */
export function getCountryPrice(channelId, countryCode) {
  return request({
    url: `/api/sms/channels/${channelId}/countries/price/${countryCode}`,
    method: 'get'
  })
}

/**
 * ========================================
 * 短信结算 API
 * ========================================
 */

/**
 * 获取结算列表
 * @param {object} params - 查询参数
 */
export function getSettlements(params) {
  return request({
    url: '/api/sms/settlements',
    method: 'get',
    params
  })
}

/**
 * 获取结算详情
 * @param {number} id - 结算ID
 */
export function getSettlementDetail(id) {
  return request({
    url: `/api/sms/settlements/${id}`,
    method: 'get'
  })
}

/**
 * 获取结算明细列表
 * @param {number} id - 结算ID
 * @param {object} params - 分页参数 { page, limit }
 */
export function getSettlementDetails(id, params) {
  return request({
    url: `/api/sms/settlements/${id}/details`,
    method: 'get',
    params
  })
}

/**
 * 手动触发结算
 * @param {object} data - { date: 'YYYY-MM-DD' }
 */
export function calculateSettlement(data) {
  return request({
    url: '/api/sms/settlements/calculate',
    method: 'post',
    data
  })
}

/**
 * 重新结算
 * @param {number} id - 结算ID
 */
export function reSettlement(id) {
  return request({
    url: `/api/sms/settlements/${id}/resettle`,
    method: 'post'
  })
}

/**
 * 批量重新结算（按日期）
 * @param {object} data - { date: 'YYYY-MM-DD' }
 */
export function batchReSettlement(data) {
  return request({
    url: '/api/sms/settlements/batch/resettle',
    method: 'post',
    data
  })
}

/**
 * 生成业绩报表
 * @param {object} params - 查询参数
 * {
 *   start_date: 'YYYY-MM-DD',
 *   end_date: 'YYYY-MM-DD',
 *   customer_id: number,
 *   channel_id: number,
 *   country: string,
 *   group_by: 'date'|'customer'|'channel'|'country'
 * }
 */
export function generateReport(params) {
  return request({
    url: '/api/sms/settlements/reports/generate',
    method: 'get',
    params
  })
}

/**
 * 获取结算统计概览
 * @param {object} params - 查询参数 { start_date, end_date, customer_id }
 */
export function getSettlementOverview(params) {
  return request({
    url: '/api/sms/settlements/statistics/overview',
    method: 'get',
    params
  })
}

/**
 * 导出结算数据（CSV）
 * @param {object} params - 查询参数
 */
export function exportSettlementsCSV(params) {
  return request({
    url: '/api/sms/settlements/export/csv',
    method: 'get',
    params,
    responseType: 'blob'
  })
}

/**
 * ========================================
 * 辅助工具函数
 * ========================================
 */

/**
 * 格式化价格显示
 * @param {number|string} price - 价格
 * @param {number} decimals - 小数位数
 */
export function formatPrice(price, decimals = 4) {
  return parseFloat(price || 0).toFixed(decimals)
}

/**
 * 计算利润率
 * @param {number|string} profit - 利润
 * @param {number|string} revenue - 收入
 */
export function calculateProfitMargin(profit, revenue) {
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
  failed: { label: '失败', type: 'danger' }
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
