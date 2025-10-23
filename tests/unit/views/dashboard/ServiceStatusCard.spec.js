import { shallowMount, createLocalVue } from '@vue/test-utils'
import ServiceStatusCard from '@/views/dashboard/admin/components/ServiceStatusCard.vue'
import ElementUI from 'element-ui'

const localVue = createLocalVue()
localVue.use(ElementUI)

// Mock i18n
const mockI18n = {
  locale: 'zh',
  t: (key) => {
    const translations = {
      'dashboard.serviceStatus': '服务状态',
      'dashboard.checkNow': '立即检查',
      'dashboard.frontendService': '前端服务',
      'dashboard.backendService': '后端服务',
      'dashboard.databaseService': '数据库服务',
      'dashboard.version': '版本',
      'dashboard.running': '运行中',
      'dashboard.stopped': '已停止',
      'dashboard.error': '错误',
      'dashboard.warning': '警告',
      'dashboard.ms': '毫秒',
      'dashboard.lastCheck': '最后检查',
      'dashboard.serviceHealthy': '服务健康',
      'dashboard.serviceUnhealthy': '服务异常',
      'dashboard.refreshSuccess': '状态刷新成功',
      'dashboard.refreshFailed': '状态刷新失败'
    }
    return translations[key] || key
  }
}

// Mock request
jest.mock('@/utils/request', () => {
  return jest.fn(() => Promise.resolve({ status: 'ok', version: 'v1.0.0' }))
})

describe('ServiceStatusCard.vue', () => {
  let wrapper

  beforeEach(() => {
    wrapper = shallowMount(ServiceStatusCard, {
      localVue,
      mocks: {
        $t: mockI18n.t,
        $message: {
          success: jest.fn(),
          error: jest.fn()
        }
      }
    })
  })

  afterEach(() => {
    wrapper.destroy()
    jest.clearAllTimers()
  })

  it('renders properly', () => {
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.find('.service-status-card').exists()).toBe(true)
  })

  it('displays card header with title and button', () => {
    const header = wrapper.find('.card-header')
    expect(header.exists()).toBe(true)
    expect(header.text()).toContain('服务状态')
    
    const button = header.find('el-button-stub')
    expect(button.exists()).toBe(true)
    expect(button.attributes('icon')).toBe('el-icon-refresh')
  })

  it('displays all three services', () => {
    const serviceItems = wrapper.findAll('.service-item')
    expect(serviceItems.length).toBe(3)
  })

  it('displays frontend service info', () => {
    const services = wrapper.findAll('.service-item')
    const frontendService = services.at(0)
    
    expect(frontendService.text()).toContain('前端服务')
    expect(frontendService.find('.service-icon.frontend').exists()).toBe(true)
  })

  it('displays backend service info', () => {
    const services = wrapper.findAll('.service-item')
    const backendService = services.at(1)
    
    expect(backendService.text()).toContain('后端服务')
    expect(backendService.find('.service-icon.backend').exists()).toBe(true)
  })

  it('displays database service info', () => {
    const services = wrapper.findAll('.service-item')
    const databaseService = services.at(2)
    
    expect(databaseService.text()).toContain('数据库服务')
    expect(databaseService.find('.service-icon.database').exists()).toBe(true)
  })

  it('initializes with default service status', () => {
    // 前端服务在created时已经被检查，所以是running
    expect(wrapper.vm.services.frontend.status).toBe('running')
    // 后端和数据库在created后可能已经检查过
    expect(['running', 'stopped', 'unknown']).toContain(wrapper.vm.services.backend.status)
    expect(['running', 'stopped', 'error', 'unknown']).toContain(wrapper.vm.services.database.status)
  })

  it('displays last check time', () => {
    const lastCheck = wrapper.find('.last-check')
    expect(lastCheck.exists()).toBe(true)
    expect(lastCheck.text()).toContain('最后检查')
  })

  it('displays overall status alert', () => {
    const overallStatus = wrapper.find('.overall-status')
    expect(overallStatus.exists()).toBe(true)
    expect(overallStatus.find('el-alert-stub').exists()).toBe(true)
  })

  it('computes correct overall status type - all running', () => {
    wrapper.vm.services.frontend.status = 'running'
    wrapper.vm.services.backend.status = 'running'
    wrapper.vm.services.database.status = 'running'
    
    expect(wrapper.vm.overallStatusType).toBe('success')
    expect(wrapper.vm.overallStatusText).toBe('服务健康')
  })

  it('computes correct overall status type - partial running', () => {
    wrapper.vm.services.frontend.status = 'running'
    wrapper.vm.services.backend.status = 'stopped'
    wrapper.vm.services.database.status = 'stopped'
    
    expect(wrapper.vm.overallStatusType).toBe('warning')
    expect(wrapper.vm.overallStatusText).toContain('1/3')
  })

  it('computes correct overall status type - none running', () => {
    wrapper.vm.services.frontend.status = 'stopped'
    wrapper.vm.services.backend.status = 'stopped'
    wrapper.vm.services.database.status = 'stopped'
    
    expect(wrapper.vm.overallStatusType).toBe('error')
    expect(wrapper.vm.overallStatusText).toBe('服务异常')
  })

  it('returns correct status type for different statuses', () => {
    expect(wrapper.vm.getStatusType('running')).toBe('success')
    expect(wrapper.vm.getStatusType('stopped')).toBe('info')
    expect(wrapper.vm.getStatusType('error')).toBe('danger')
    expect(wrapper.vm.getStatusType('unknown')).toBe('warning')
  })

  it('returns correct status text for different statuses', () => {
    expect(wrapper.vm.getStatusText('running')).toBe('运行中')
    expect(wrapper.vm.getStatusText('stopped')).toBe('已停止')
    expect(wrapper.vm.getStatusText('error')).toBe('错误')
    expect(wrapper.vm.getStatusText('unknown')).toBe('警告')
  })

  it('formats time correctly', () => {
    const date = new Date('2025-10-13T12:30:45')
    const formatted = wrapper.vm.formatTime(date)
    
    expect(formatted).toMatch(/2025-10-13 12:30:45/)
  })

  it('sets loading state when checking services', async () => {
    expect(wrapper.vm.loading).toBe(false)
    
    const checkPromise = wrapper.vm.checkAllServices()
    expect(wrapper.vm.loading).toBe(true)
    
    await checkPromise
    expect(wrapper.vm.loading).toBe(false)
  })

  it('updates last check time after checking services', async () => {
    const initialTime = wrapper.vm.lastCheckTime
    
    await wrapper.vm.checkAllServices()
    
    // 检查后时间应该不是初始值
    expect(wrapper.vm.lastCheckTime).not.toBe('-')
    expect(wrapper.vm.lastCheckTime).toMatch(/\d{4}-\d{2}-\d{2}/)
  })

  it('frontend service is always running', async () => {
    await wrapper.vm.checkAllServices()
    
    expect(wrapper.vm.services.frontend.status).toBe('running')
    expect(wrapper.vm.services.frontend.responseTime).toBeGreaterThan(0)
  })

  it('sets up auto-check timer on created', () => {
    jest.useFakeTimers()
    
    const newWrapper = shallowMount(ServiceStatusCard, {
      localVue,
      mocks: {
        $t: mockI18n.t,
        $message: {
          success: jest.fn(),
          error: jest.fn()
        }
      }
    })
    
    expect(newWrapper.vm.checkTimer).toBeTruthy()
    
    newWrapper.destroy()
    jest.useRealTimers()
  })

  it('clears timer on beforeDestroy', () => {
    const clearIntervalSpy = jest.spyOn(global, 'clearInterval')
    
    wrapper.vm.checkTimer = 12345
    wrapper.destroy()
    
    expect(clearIntervalSpy).toHaveBeenCalledWith(12345)
    
    clearIntervalSpy.mockRestore()
  })

  it('shows success message on manual refresh', async () => {
    await wrapper.vm.checkAllServices(false)
    
    expect(wrapper.vm.$message.success).toHaveBeenCalledWith('状态刷新成功')
  })

  it('handles check service errors gracefully', async () => {
    // Mock console.warn to avoid cluttering test output
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation()
    
    // Mock request to fail
    const request = require('@/utils/request')
    request.mockImplementationOnce(() => Promise.reject(new Error('Network error')))
    
    await wrapper.vm.checkBackendService()
    
    expect(wrapper.vm.services.backend.status).toBe('stopped')
    expect(wrapper.vm.services.backend.responseTime).toBe(0)
    
    consoleWarnSpy.mockRestore()
  })

  it('silent mode does not show messages', async () => {
    // 清除之前的调用
    wrapper.vm.$message.success.mockClear()
    
    await wrapper.vm.checkAllServices(true)
    
    expect(wrapper.vm.$message.success).not.toHaveBeenCalled()
  })

  it('displays response time for running services', async () => {
    wrapper.vm.services.backend.status = 'running'
    wrapper.vm.services.backend.responseTime = 123
    
    await wrapper.vm.$nextTick()
    
    const backendItem = wrapper.findAll('.service-item').at(1)
    const responseTime = backendItem.find('.response-time')
    
    expect(responseTime.exists()).toBe(true)
    expect(responseTime.text()).toContain('123')
    expect(responseTime.text()).toContain('毫秒')
  })

  it('component renders correctly', () => {
    // 检查关键元素是否存在，而不是使用快照测试（因为时间和响应时间会变化）
    expect(wrapper.find('.service-status-card').exists()).toBe(true)
    expect(wrapper.find('.card-header').exists()).toBe(true)
    expect(wrapper.findAll('.service-item').length).toBe(3)
    expect(wrapper.find('.last-check').exists()).toBe(true)
    expect(wrapper.find('.overall-status').exists()).toBe(true)
  })
})
