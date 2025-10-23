/**
 * 短信管理 - 客户API
 */
import request from '@/utils/request'

// 获取可用通道
export function getAvailableChannels(country) {
  return request({
    url: `/api/sms/customer/channels/${country}`,
    method: 'get'
  })
}

// 任务管理
export function createTask(data) {
  return request({
    url: '/api/sms/customer/tasks',
    method: 'post',
    data
  })
}

export function getMyTasks(params) {
  return request({
    url: '/api/sms/customer/tasks',
    method: 'get',
    params
  })
}

export function getTaskDetail(id) {
  return request({
    url: `/api/sms/customer/tasks/${id}`,
    method: 'get'
  })
}

export function cancelTask(id) {
  return request({
    url: `/api/sms/customer/tasks/${id}/cancel`,
    method: 'post'
  })
}

// 发送记录
export function getMyRecords(params) {
  return request({
    url: '/api/sms/customer/records',
    method: 'get',
    params
  })
}

// 统计数据
export function getMyStatistics(params) {
  return request({
    url: '/api/sms/customer/statistics',
    method: 'get',
    params
  })
}

// 统计数据（别名）
export function getStatistics(params) {
  return request({
    url: '/api/sms/customer/statistics',
    method: 'get',
    params
  })
}

// 已购买数据
export function getPurchasedData(params) {
  return request({
    url: '/api/sms/customer/purchased-data',
    method: 'get',
    params
  })
}
