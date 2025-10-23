/**
 * Vue Element Admin 系统测试脚本
 * 用于测试订单详情页面修复后的系统功能
 */

// 测试用户数据
const testUsers = [
  {
    id: 1,
    loginAccount: 'KL01880V01',
    customerName: 'KL01880V01',
    username: 'KL01880V01',
    email: 'test@example.com',
    phone: '1234567890',
    accountBalance: '5000.00000',
    salesRatio: '1.0',
    type: 'customer',
    status: 'active',
    createTime: new Date().getTime() - 86400000 * 7,
    lastLogin: new Date().getTime() - 3600000
  },
  {
    id: 2,
    loginAccount: 'admin',
    customerName: '系统管理员',
    username: 'admin',
    email: 'admin@example.com',
    phone: '0987654321',
    accountBalance: '10000.00000',
    salesRatio: '1.0',
    type: 'admin',
    status: 'active',
    createTime: new Date().getTime() - 86400000 * 30,
    lastLogin: new Date().getTime() - 1800000
  }
];

// 测试数据信息
const testDataInfo = [
  {
    id: 1,
    country: '孟加拉',
    validity: '30',
    source: '实时抓取',
    unitPrice: 0.2,
    totalCount: 50000,
    availableCount: 45000,
    operators: [
      { name: 'Grameenphone', percentage: 40, count: 18000 },
      { name: 'Banglalink', percentage: 30, count: 13500 },
      { name: 'Robi', percentage: 20, count: 9000 },
      { name: 'Teletalk', percentage: 10, count: 4500 }
    ]
  },
  {
    id: 2,
    country: '印度',
    validity: '3',
    source: '实时抓取',
    unitPrice: 0.15,
    totalCount: 80000,
    availableCount: 75000,
    operators: [
      { name: 'Jio', percentage: 45, count: 33750 },
      { name: 'Airtel', percentage: 30, count: 22500 },
      { name: 'Vi', percentage: 25, count: 18750 }
    ]
  },
  {
    id: 3,
    country: '泰国',
    validity: '30+',
    source: '实时抓取',
    unitPrice: 0.25,
    totalCount: 60000,
    availableCount: 55000,
    operators: [
      { name: 'AIS', percentage: 40, count: 22000 },
      { name: 'DTAC', percentage: 35, count: 19250 },
      { name: 'TrueMove', percentage: 25, count: 13750 }
    ]
  }
];

// 测试订单数据
const testOrders = [
  {
    id: 1,
    orderNo: 'ORD' + Date.now() + 'TEST01',
    customerId: 1,
    customerName: 'KL01880V01',
    dataId: 1,
    country: '孟加拉',
    validity: '30',
    source: '实时抓取',
    quantity: 10000,
    unitPrice: 0.2,
    totalAmount: '2000.00',
    deliveryEmail: 'test@example.com',
    operators: [
      { name: 'Grameenphone', count: 4000 },
      { name: 'Banglalink', count: 3000 },
      { name: 'Robi', count: 2000 },
      { name: 'Teletalk', count: 1000 }
    ],
    status: 'pending',
    deliveryStatus: 'pending',
    remark: '测试订单数据 - 待处理',
    createTime: new Date().getTime() - 86400000, // 1天前
    deliveryTime: null
  },
  {
    id: 2,
    orderNo: 'ORD' + Date.now() + 'TEST02',
    customerId: 1,
    customerName: 'KL01880V01',
    dataId: 2,
    country: '印度',
    validity: '3',
    source: '实时抓取',
    quantity: 5000,
    unitPrice: 0.15,
    totalAmount: '750.00',
    deliveryEmail: 'test@example.com',
    operators: [
      { name: 'Jio', count: 2250 },
      { name: 'Airtel', count: 1500 },
      { name: 'Vi', count: 1250 }
    ],
    status: 'processing',
    deliveryStatus: 'processing',
    remark: '测试订单数据 - 处理中',
    createTime: new Date().getTime() - 43200000, // 12小时前
    processTime: new Date().getTime() - 21600000, // 6小时前
    deliveryTime: null
  },
  {
    id: 3,
    orderNo: 'ORD' + Date.now() + 'TEST03',
    customerId: 1,
    customerName: 'KL01880V01',
    dataId: 3,
    country: '泰国',
    validity: '30+',
    source: '实时抓取',
    quantity: 8000,
    unitPrice: 0.25,
    totalAmount: '2000.00',
    deliveryEmail: 'test@example.com',
    operators: [
      { name: 'AIS', count: 3200 },
      { name: 'DTAC', count: 2800 },
      { name: 'TrueMove', count: 2000 }
    ],
    status: 'completed',
    deliveryStatus: 'delivered',
    remark: '测试订单数据 - 已完成',
    createTime: new Date().getTime() - 172800000, // 2天前
    processTime: new Date().getTime() - 158400000, // 1.8天前
    deliveryTime: new Date().getTime() - 144000000, // 1.67天前
    completeTime: new Date().getTime() - 144000000
  }
];

// 测试充值记录
const testRechargeRecords = [
  {
    id: 1,
    customerId: 1,
    customerName: 'KL01880V01',
    type: 'customer',
    amount: '1000.00000',
    method: 'bank_transfer',
    status: 'success',
    createTime: new Date().getTime() - 86400000 * 3,
    remark: '银行转账充值'
  },
  {
    id: 2,
    customerId: 1,
    customerName: 'KL01880V01',
    type: 'customer',
    amount: '-750.00000',
    method: 'purchase',
    status: 'success',
    createTime: new Date().getTime() - 43200000,
    remark: '购买数据扣款 - 印度 5,000条'
  },
  {
    id: 3,
    customerId: 1,
    customerName: 'KL01880V01',
    type: 'customer',
    amount: '-2000.00000',
    method: 'purchase',
    status: 'success',
    createTime: new Date().getTime() - 172800000,
    remark: '购买数据扣款 - 泰国 8,000条'
  }
];

// 系统测试函数
class SystemTester {
  constructor() {
    this.testResults = {
      dataInit: false,
      userLogin: false,
      orderList: false,
      orderDetail: false,
      resourceCenter: false,
      customerDashboard: false,
      errors: []
    };
  }

  // 初始化测试数据
  initTestData() {
    try {
      localStorage.setItem('userList', JSON.stringify(testUsers));
      localStorage.setItem('dataList', JSON.stringify(testDataInfo));
      localStorage.setItem('orderList', JSON.stringify(testOrders));
      localStorage.setItem('rechargeRecords', JSON.stringify(testRechargeRecords));
      
      // 设置当前用户
      localStorage.setItem('currentUser', JSON.stringify(testUsers[0]));
      
      this.testResults.dataInit = true;
      console.log('✅ 测试数据初始化成功');
      return true;
    } catch (error) {
      this.testResults.errors.push('数据初始化失败: ' + error.message);
      console.error('❌ 测试数据初始化失败:', error);
      return false;
    }
  }

  // 验证数据完整性
  validateData() {
    const validations = [
      { key: 'userList', name: '用户数据', expectedCount: 2 },
      { key: 'dataList', name: '数据信息', expectedCount: 3 },
      { key: 'orderList', name: '订单数据', expectedCount: 3 },
      { key: 'rechargeRecords', name: '充值记录', expectedCount: 3 }
    ];

    let allValid = true;
    validations.forEach(({ key, name, expectedCount }) => {
      const data = localStorage.getItem(key);
      if (data) {
        const parsed = JSON.parse(data);
        if (parsed.length === expectedCount) {
          console.log(`✅ ${name}验证通过 (${parsed.length}条)`);
        } else {
          console.warn(`⚠️ ${name}数量不匹配: 期望${expectedCount}条，实际${parsed.length}条`);
          allValid = false;
        }
      } else {
        console.error(`❌ ${name}缺失`);
        allValid = false;
      }
    });

    return allValid;
  }

  // 测试订单详情页面数据格式
  testOrderDetailData() {
    try {
      const orders = JSON.parse(localStorage.getItem('orderList') || '[]');
      const testOrder = orders[0];
      
      if (!testOrder) {
        throw new Error('没有找到测试订单');
      }

      // 验证必要字段
      const requiredFields = ['id', 'orderNo', 'customerName', 'country', 'quantity', 'totalAmount', 'operators'];
      const missingFields = requiredFields.filter(field => !testOrder.hasOwnProperty(field));
      
      if (missingFields.length > 0) {
        throw new Error(`订单数据缺少必要字段: ${missingFields.join(', ')}`);
      }

      // 验证运营商数据格式
      if (!Array.isArray(testOrder.operators) || testOrder.operators.length === 0) {
        throw new Error('运营商数据格式错误');
      }

      testOrder.operators.forEach((op, index) => {
        if (!op.name || !op.count) {
          throw new Error(`运营商数据第${index + 1}项格式错误`);
        }
      });

      this.testResults.orderDetail = true;
      console.log('✅ 订单详情数据格式验证通过');
      return true;
    } catch (error) {
      this.testResults.errors.push('订单详情数据验证失败: ' + error.message);
      console.error('❌ 订单详情数据验证失败:', error);
      return false;
    }
  }

  // 生成测试报告
  generateReport() {
    console.log('\n=== 系统测试报告 ===');
    console.log(`数据初始化: ${this.testResults.dataInit ? '✅ 通过' : '❌ 失败'}`);
    console.log(`订单详情: ${this.testResults.orderDetail ? '✅ 通过' : '❌ 失败'}`);
    
    if (this.testResults.errors.length > 0) {
      console.log('\n错误详情:');
      this.testResults.errors.forEach((error, index) => {
        console.log(`${index + 1}. ${error}`);
      });
    }

    const passedTests = Object.values(this.testResults).filter(result => result === true).length;
    const totalTests = Object.keys(this.testResults).length - 1; // 排除errors数组
    
    console.log(`\n总体结果: ${passedTests}/${totalTests} 项测试通过`);
    
    return this.testResults;
  }

  // 运行完整测试
  runFullTest() {
    console.log('开始系统测试...\n');
    
    this.initTestData();
    this.validateData();
    this.testOrderDetailData();
    
    return this.generateReport();
  }
}

// 导出测试器和测试数据
if (typeof window !== 'undefined') {
  // 浏览器环境
  window.SystemTester = SystemTester;
  window.testOrders = testOrders;
  window.testUsers = testUsers;
  window.testDataInfo = testDataInfo;
  
  // 提供快速测试方法
  window.runSystemTest = function() {
    const tester = new SystemTester();
    return tester.runFullTest();
  };
  
  // 提供快速数据初始化方法
  window.initTestData = function() {
    const tester = new SystemTester();
    return tester.initTestData();
  };
  
  console.log('系统测试脚本已加载');
  console.log('使用 runSystemTest() 运行完整测试');
  console.log('使用 initTestData() 仅初始化测试数据');
} else {
  // Node.js环境
  module.exports = { SystemTester, testOrders, testUsers, testDataInfo };
}