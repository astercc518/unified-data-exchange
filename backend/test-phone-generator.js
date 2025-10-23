/**
 * 号码生成功能测试脚本
 * 测试基于 Google libphonenumber 的号码生成功能
 */

const PhoneGenerator = require('./utils/phoneNumberGenerator');

console.log('========== 号码生成功能测试 ==========\n');

// 测试1: 获取国家号码格式信息
console.log('【测试1】获取国家号码格式信息');
console.log('-----------------------------------');

const testCountries = ['US', 'CN', 'MX', 'PH', 'BD'];

testCountries.forEach(regionCode => {
  const formatInfo = PhoneGenerator.getCountryNumberFormat(regionCode);
  if (formatInfo.error) {
    console.log(`❌ ${regionCode}: ${formatInfo.error}`);
  } else {
    console.log(`✓ ${regionCode}:`);
    console.log(`  国码: ${formatInfo.countryCode}`);
    console.log(`  号码长度: ${formatInfo.phoneLength}位`);
    console.log(`  示例: ${formatInfo.exampleNumber}`);
  }
});

console.log('\n');

// 测试2: 验证号段
console.log('【测试2】验证号段');
console.log('-----------------------------------');

const segments = {
  'MX': ['55', '56', '81', '33'],  // 墨西哥合法号段
  'US': ['201', '202', '212'],      // 美国区号
  'CN': ['134', '135', '139']       // 中国移动号段
};

Object.keys(segments).forEach(regionCode => {
  const validation = PhoneGenerator.validateNumberSegments(regionCode, segments[regionCode]);
  if (validation.valid) {
    console.log(`✓ ${regionCode}: 号段验证通过 (${validation.validSegments.length}个有效号段)`);
  } else {
    console.log(`❌ ${regionCode}: ${validation.error}`);
    validation.invalidSegments?.forEach(seg => {
      console.log(`   - ${seg.segment}: ${seg.reason}`);
    });
  }
});

console.log('\n');

// 测试3: 生成墨西哥号码
console.log('【测试3】生成墨西哥Telcel运营商号码');
console.log('-----------------------------------');

try {
  const mexicoNumbers = PhoneGenerator.generatePhoneNumbers(
    'MX',
    ['55', '56', '81', '33'],  // Telcel号段
    20,  // 生成20条
    {
      includeCountryCode: true,
      format: 'e164',
      unique: true
    }
  );

  console.log(`✓ 成功生成 ${mexicoNumbers.length} 条号码:`);
  mexicoNumbers.slice(0, 10).forEach((num, i) => {
    console.log(`  ${i + 1}. ${num}`);
  });
  if (mexicoNumbers.length > 10) {
    console.log(`  ... 还有 ${mexicoNumbers.length - 10} 条`);
  }
} catch (error) {
  console.log(`❌ 生成失败: ${error.message}`);
}

console.log('\n');

// 测试4: 生成中国号码
console.log('【测试4】生成中国移动号码');
console.log('-----------------------------------');

try {
  const chinaNumbers = PhoneGenerator.generatePhoneNumbers(
    'CN',
    ['134', '135', '136', '137', '138', '139'],  // 中国移动号段
    15,
    {
      includeCountryCode: false,  // 不包含国码
      format: 'national'
    }
  );

  console.log(`✓ 成功生成 ${chinaNumbers.length} 条号码 (不含国码):`);
  chinaNumbers.slice(0, 10).forEach((num, i) => {
    console.log(`  ${i + 1}. ${num}`);
  });
} catch (error) {
  console.log(`❌ 生成失败: ${error.message}`);
}

console.log('\n');

// 测试5: 批量生成多个运营商
console.log('【测试5】批量生成孟加拉国多个运营商号码');
console.log('-----------------------------------');

try {
  const operators = [
    { 
      name: 'Grameenphone', 
      numberSegments: ['17', '13', '19'], 
      count: 10 
    },
    { 
      name: 'Robi', 
      numberSegments: ['18'], 
      count: 8 
    },
    { 
      name: 'Banglalink', 
      numberSegments: ['14', '16'], 
      count: 12 
    }
  ];

  const result = PhoneGenerator.generateMultipleOperators(
    'BD',
    operators,
    {
      includeCountryCode: true,
      format: 'e164'
    }
  );

  console.log(`✓ 批量生成成功！`);
  console.log(`  总号码数: ${result.total}`);
  console.log(`  运营商数: ${result.operators.length}`);
  
  result.operators.forEach(op => {
    console.log(`\n  ${op.name}:`);
    console.log(`    生成数量: ${op.count}`);
    console.log(`    号段: ${op.segments.join(', ')}`);
    console.log(`    示例: ${op.numbers.slice(0, 3).join(', ')}`);
  });
} catch (error) {
  console.log(`❌ 批量生成失败: ${error.message}`);
}

console.log('\n========== 测试完成 ==========');
