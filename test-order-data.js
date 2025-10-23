// 测试订单数据生成脚本
// 在浏览器控制台运行此脚本来生成测试数据

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
    remark: '测试订单数据',
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
      { name: 'Jio', count: 2000 },
      { name: 'Airtel', count: 1500 },
      { name: 'Vi', count: 1500 }
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
      { name: 'DTAC', count: 2400 },
      { name: 'TrueMove', count: 2400 }
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

// 将测试数据存储到localStorage
localStorage.setItem('orderList', JSON.stringify(testOrders));
console.log('测试订单数据已添加到 localStorage');
console.log('添加的订单数据:', testOrders);

// 验证数据是否正确存储
const savedOrders = localStorage.getItem('orderList');
if (savedOrders) {
  const orders = JSON.parse(savedOrders);
  console.log('验证：成功从 localStorage 读取到', orders.length, '个订单');
} else {
  console.log('验证失败：未能从 localStorage 读取到订单数据');
}