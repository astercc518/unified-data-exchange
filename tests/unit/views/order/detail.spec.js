import { mount, createLocalVue } from '@vue/test-utils'
import OrderDetail from '@/views/order/detail.vue'
import ElementUI from 'element-ui'
import VueRouter from 'vue-router'

const localVue = createLocalVue()
localVue.use(ElementUI)
localVue.use(VueRouter)

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
}
global.localStorage = mockLocalStorage

describe('OrderDetail.vue', () => {
  let wrapper
  let router

  const mockOrderData = [
    {
      id: 1,
      orderNo: 'ORD123TEST',
      customerName: 'KL01880V01',
      customerId: 1,
      country: '孟加拉',
      validity: '30',
      source: '实时抓取',
      quantity: 10000,
      totalAmount: '2000.00',
      deliveryEmail: 'test@example.com',
      operators: [
        { name: 'Grameenphone', count: 4000 },
        { name: 'Banglalink', count: 3000 }
      ],
      status: 'pending',
      deliveryStatus: 'pending',
      createTime: Date.now(),
      remark: '测试订单'
    }
  ]

  beforeEach(() => {
    router = new VueRouter({
      routes: [
        { path: '/order/detail/:id', component: OrderDetail }
      ]
    })
    
    // Mock $route
    const $route = {
      params: { id: '1' }
    }

    wrapper = mount(OrderDetail, {
      localVue,
      router,
      mocks: {
        $route,
        $router: {
          push: jest.fn(),
          go: jest.fn()
        },
        $message: {
          error: jest.fn(),
          success: jest.fn()
        },
        $confirm: jest.fn(() => Promise.resolve()),
        $t: (key) => key // 简单的国际化mock
      }
    })
  })

  afterEach(() => {
    wrapper.destroy()
    jest.clearAllMocks()
  })

  it('should render correctly', () => {
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.find('.app-container').exists()).toBe(true)
  })

  it('should show loading state initially', () => {
    expect(wrapper.vm.loading).toBe(true)
    expect(wrapper.find('[v-loading="true"]').exists()).toBe(true)
  })

  it('should load order data from localStorage', async () => {
    // Mock localStorage返回测试数据
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockOrderData))
    
    // 创建新的wrapper实例来触发created钩子
    const newWrapper = mount(OrderDetail, {
      localVue,
      router,
      mocks: {
        $route: { params: { id: '1' } },
        $router: { push: jest.fn(), go: jest.fn() },
        $message: { error: jest.fn(), success: jest.fn() },
        $confirm: jest.fn(() => Promise.resolve()),
        $t: (key) => key
      }
    })

    await newWrapper.vm.$nextTick()
    
    expect(mockLocalStorage.getItem).toHaveBeenCalledWith('orderList')
    expect(newWrapper.vm.loading).toBe(false)
    expect(newWrapper.vm.orderDetail).toBeTruthy()
    expect(newWrapper.vm.orderDetail.orderNo).toBe('ORD123TEST')
    
    newWrapper.destroy()
  })

  it('should handle missing order data', async () => {
    // Mock localStorage返回空数据
    mockLocalStorage.getItem.mockReturnValue('[]')
    
    const newWrapper = mount(OrderDetail, {
      localVue,
      router,
      mocks: {
        $route: { params: { id: '999' } }, // 不存在的ID
        $router: { push: jest.fn(), go: jest.fn() },
        $message: { error: jest.fn(), success: jest.fn() },
        $confirm: jest.fn(() => Promise.resolve()),
        $t: (key) => key
      }
    })

    await newWrapper.vm.$nextTick()
    
    expect(newWrapper.vm.loading).toBe(false)
    expect(newWrapper.vm.error).toBe('订单不存在')
    
    newWrapper.destroy()
  })

  it('should handle malformed localStorage data', async () => {
    // Mock localStorage返回无效JSON
    mockLocalStorage.getItem.mockReturnValue('invalid json')
    
    const newWrapper = mount(OrderDetail, {
      localVue,
      router,
      mocks: {
        $route: { params: { id: '1' } },
        $router: { push: jest.fn(), go: jest.fn() },
        $message: { error: jest.fn(), success: jest.fn() },
        $confirm: jest.fn(() => Promise.resolve()),
        $t: (key) => key
      }
    })

    await newWrapper.vm.$nextTick()
    
    expect(newWrapper.vm.loading).toBe(false)
    expect(newWrapper.vm.error).toBe('加载订单详情失败')
    
    newWrapper.destroy()
  })

  it('should update order status correctly', async () => {
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockOrderData))
    
    const newWrapper = mount(OrderDetail, {
      localVue,
      router,
      mocks: {
        $route: { params: { id: '1' } },
        $router: { push: jest.fn(), go: jest.fn() },
        $message: { error: jest.fn(), success: jest.fn() },
        $confirm: jest.fn(() => Promise.resolve()),
        $t: (key) => key
      }
    })

    await newWrapper.vm.$nextTick()
    
    // 测试更新订单状态
    newWrapper.vm.updateOrderStatus(1, { status: 'processing' })
    
    expect(mockLocalStorage.setItem).toHaveBeenCalled()
    expect(newWrapper.vm.orderDetail.status).toBe('processing')
    
    newWrapper.destroy()
  })

  it('should format numbers correctly', () => {
    expect(wrapper.vm.formatNumber(1000)).toBe('1,000')
    expect(wrapper.vm.formatNumber(1000000)).toBe('1,000,000')
  })

  it('should get correct status type', () => {
    expect(wrapper.vm.getStatusType('pending')).toBe('warning')
    expect(wrapper.vm.getStatusType('processing')).toBe('primary')
    expect(wrapper.vm.getStatusType('completed')).toBe('success')
    expect(wrapper.vm.getStatusType('cancelled')).toBe('danger')
  })

  it('should get correct validity tag type', () => {
    expect(wrapper.vm.getValidityTagType('3')).toBe('danger')
    expect(wrapper.vm.getValidityTagType('30')).toBe('warning')
    expect(wrapper.vm.getValidityTagType('30+')).toBe('success')
  })

  it('should calculate step progress correctly', async () => {
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockOrderData))
    
    const newWrapper = mount(OrderDetail, {
      localVue,
      router,
      mocks: {
        $route: { params: { id: '1' } },
        $router: { push: jest.fn(), go: jest.fn() },
        $message: { error: jest.fn(), success: jest.fn() },
        $confirm: jest.fn(() => Promise.resolve()),
        $t: (key) => key
      }
    })

    await newWrapper.vm.$nextTick()
    
    expect(newWrapper.vm.getStepActive()).toBe(1) // pending = 1
    
    newWrapper.vm.orderDetail.status = 'processing'
    expect(newWrapper.vm.getStepActive()).toBe(2) // processing = 2
    
    newWrapper.vm.orderDetail.status = 'completed'
    expect(newWrapper.vm.getStepActive()).toBe(4) // completed = 4
    
    newWrapper.destroy()
  })
})