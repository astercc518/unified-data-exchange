/**
 * 短信管理 - 管理员API
 */
import request from '@/utils/request'

// 通道管理
export function getChannels(params) {
  return request({
    url: '/api/sms/admin/channels',
    method: 'get',
    params
  })
}

export function createChannel(data) {
  return request({
    url: '/api/sms/admin/channels',
    method: 'post',
    data
  })
}

export function updateChannel(id, data) {
  return request({
    url: `/api/sms/admin/channels/${id}`,
    method: 'put',
    data
  })
}

export function deleteChannel(id) {
  return request({
    url: `/api/sms/admin/channels/${id}`,
    method: 'delete'
  })
}

// 发送记录
export function getSmsRecords(params) {
  return request({
    url: '/api/sms/admin/records',
    method: 'get',
    params
  })
}

// 发送记录（别名）
export function getRecords(params) {
  return request({
    url: '/api/sms/admin/records',
    method: 'get',
    params
  })
}

// 统计数据
export function getSmsStatistics(params) {
  return request({
    url: '/api/sms/admin/statistics',
    method: 'get',
    params
  })
}

// 统计数据（别名）
export function getStatistics(params) {
  return request({
    url: '/api/sms/admin/statistics',
    method: 'get',
    params
  })
}

// 国家列表
export function getCountries() {
  return request({
    url: '/api/sms/admin/countries',
    method: 'get'
  })
}

// 测试发送短信
export function testSendSms(id, data) {
  return request({
    url: `/api/sms/admin/channels/${id}/test`,
    method: 'post',
    data
  })
}
