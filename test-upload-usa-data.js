// 测试美国数据上传到资源中心的脚本

// 模拟美国数据上传
function uploadUSAData() {
  console.log('🇺🇸 开始上传美国数据...');
  
  // 获取现有的数据
  const savedDataList = localStorage.getItem('dataList');
  let dataList = [];
  let newId = 1;
  
  if (savedDataList) {
    try {
      dataList = JSON.parse(savedDataList);
      const maxId = dataList.reduce((max, item) => Math.max(max, item.id || 0), 0);
      newId = maxId + 1;
    } catch (error) {
      console.error('解析现有数据失败:', error);
    }
  }
  
  // 创建美国数据记录
  const usaDataRecords = [
    {
      id: newId,
      country: '美国',
      countryCode: 'US', 
      validity: '3',
      source: 'Verizon官方数据',
      dataType: '手机号码',
      availableQuantity: 1500000,
      operators: [
        { name: 'Verizon', count: 450000 },
        { name: 'AT&T', count: 400000 },
        { name: 'T-Mobile', count: 380000 },
        { name: 'Sprint', count: 270000 }
      ],
      sellPrice: 0.08,
      costPrice: 0.06,
      remark: '高质量美国手机号码数据，来源于主要运营商，数据准确性99%+',
      uploadTime: new Date().getTime(),
      status: 'available'
    },
    {
      id: newId + 1,
      country: '美国',
      countryCode: 'US',
      validity: '30',
      source: '第三方数据聚合商', 
      dataType: '邮箱地址',
      availableQuantity: 2800000,
      operators: [
        { name: 'Gmail', count: 1120000 },
        { name: 'Yahoo', count: 840000 },
        { name: 'Outlook', count: 560000 },
        { name: 'Other', count: 280000 }
      ],
      sellPrice: 0.06,
      costPrice: 0.04,
      remark: '美国邮箱地址数据集，包含个人和企业邮箱，适合邮件营销',
      uploadTime: new Date().getTime() - 3600000, // 1小时前
      status: 'available'
    },
    {
      id: newId + 2,
      country: '美国',
      countryCode: 'US',
      validity: '30+',
      source: '公开数据整理',
      dataType: '企业信息',
      availableQuantity: 500000,
      operators: [
        { name: '小型企业', count: 200000 },
        { name: '中型企业', count: 180000 },
        { name: '大型企业', count: 80000 },
        { name: '跨国公司', count: 40000 }
      ],
      sellPrice: 0.12,
      costPrice: 0.08,
      remark: '美国企业信息数据库，包含公司名称、地址、联系方式等基本信息',
      uploadTime: new Date().getTime() - 7200000, // 2小时前
      status: 'available'
    }
  ];
  
  // 添加到现有数据列表
  dataList.push(...usaDataRecords);
  
  // 保存到 localStorage
  localStorage.setItem('dataList', JSON.stringify(dataList));
  
  console.log('✅ 美国数据上传成功！');
  console.log('📊 上传的数据记录:', usaDataRecords);
  console.log('📈 当前数据总数:', dataList.length);
  
  return usaDataRecords;
}

// 验证美国数据是否存在
function checkUSAData() {
  const savedDataList = localStorage.getItem('dataList');
  if (!savedDataList) {
    console.log('❌ 没有找到任何数据');
    return false;
  }
  
  try {
    const dataList = JSON.parse(savedDataList);
    const usaData = dataList.filter(item => item.countryCode === 'US');
    
    if (usaData.length > 0) {
      console.log('✅ 找到美国数据:', usaData.length, '条');
      console.log('🇺🇸 美国数据详情:');
      usaData.forEach((item, index) => {
        console.log(`  ${index + 1}. ${item.dataType} - ${item.source} (${item.availableQuantity.toLocaleString()}条)`);
      });
      return true;
    } else {
      console.log('❌ 没有找到美国数据');
      return false;
    }
  } catch (error) {
    console.error('❌ 解析数据失败:', error);
    return false;
  }
}

// 清除所有美国数据
function clearUSAData() {
  const savedDataList = localStorage.getItem('dataList');
  if (!savedDataList) {
    console.log('没有数据需要清除');
    return;
  }
  
  try {
    const dataList = JSON.parse(savedDataList);
    const filteredData = dataList.filter(item => item.countryCode !== 'US');
    
    localStorage.setItem('dataList', JSON.stringify(filteredData));
    console.log('🗑️ 美国数据已清除');
    console.log('📊 剩余数据:', filteredData.length, '条');
  } catch (error) {
    console.error('清除数据失败:', error);
  }
}

// 导出函数
if (typeof window !== 'undefined') {
  window.uploadUSAData = uploadUSAData;
  window.checkUSAData = checkUSAData;
  window.clearUSAData = clearUSAData;
  
  console.log('🔧 美国数据测试工具已加载');
  console.log('📋 可用命令:');
  console.log('  - uploadUSAData(): 上传美国测试数据');
  console.log('  - checkUSAData(): 检查美国数据');
  console.log('  - clearUSAData(): 清除美国数据');
}

// 自动执行上传（如果直接运行）
if (typeof module === 'undefined') {
  uploadUSAData();
}