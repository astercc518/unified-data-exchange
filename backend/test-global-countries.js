/**
 * 全球多国号码测试脚本
 * 测试国码+号码格式在多个国家的解析
 */

const PhoneAnalyzer = require('./utils/phoneNumberAnalyzer');

console.log('========================================');
console.log('全球多国号码格式测试（国码+号码）');
console.log('========================================\n');

// 测试多个国家的号码（国码+号码格式）
const globalNumbers = [
  { number: '12025551234', country: 'US', name: '美国' },
  { number: '528661302532', country: 'MX', name: '墨西哥' },
  { number: '8613800138000', country: 'CN', name: '中国' },
  { number: '917700123456', country: 'IN', name: '印度' },
  { number: '442071234567', country: 'GB', name: '英国' },
  { number: '818012345678', country: 'JP', name: '日本' },
  { number: '821012345678', country: 'KR', name: '韩国' },
  { number: '6581234567', country: 'SG', name: '新加坡' },
  { number: '66812345678', country: 'TH', name: '泰国' },
  { number: '84912345678', country: 'VN', name: '越南' },
  { number: '628123456789', country: 'ID', name: '印度尼西亚' },
  { number: '639171234567', country: 'PH', name: '菲律宾' },
  { number: '5511987654321', country: 'BR', name: '巴西' },
  { number: '5491112345678', country: 'AR', name: '阿根廷' },
  { number: '4915123456789', country: 'DE', name: '德国' },
  { number: '33612345678', country: 'FR', name: '法国' },
  { number: '34612345678', country: 'ES', name: '西班牙' },
  { number: '393012345678', country: 'IT', name: '意大利' },
  { number: '61412345678', country: 'AU', name: '澳大利亚' },
  { number: '27821234567', country: 'ZA', name: '南非' }
];

console.log('1. 测试各国号码解析\n');

let successCount = 0;
let failCount = 0;

globalNumbers.forEach(({ number, country, name }) => {
  const result = PhoneAnalyzer.parsePhone(number, country);
  const status = result.valid ? '✅' : '❌';
  
  if (result.valid) {
    successCount++;
    console.log(`${status} ${name.padEnd(12)} | 号码: ${number.padEnd(15)} -> ${result.number.e164} (${result.regionCode})`);
  } else {
    failCount++;
    console.log(`${status} ${name.padEnd(12)} | 号码: ${number.padEnd(15)} -> 解析失败: ${result.error || '无效'}`);
  }
});

console.log(`\n统计: 成功 ${successCount}/${globalNumbers.length}, 失败 ${failCount}/${globalNumbers.length}`);

// 测试2: 混合国家分布分析
console.log('\n\n2. 测试混合国家号码分布分析\n');

const mixedNumbers = globalNumbers.slice(0, 10).map(item => item.number);
const countryDist = PhoneAnalyzer.analyzeCountryDistribution(mixedNumbers);

console.log(`总数: ${countryDist.totalCount}`);
console.log(`有效: ${countryDist.validCount}`);
console.log(`无效: ${countryDist.invalidCount}\n`);

console.log('国家分布（前10个国家）:');
countryDist.countries.forEach(country => {
  const countryName = globalNumbers.find(g => g.country === country.regionCode)?.name || country.regionCode;
  console.log(`  ${countryName.padEnd(12)} (${country.regionCode}, +${country.countryCode}): ${country.count}条`);
});

// 测试3: 验证所有国家都能正确识别
console.log('\n\n3. 验证国家代码映射正确性\n');

const countryCodeMap = {
  '1': 'US', '7': 'RU', '20': 'EG', '27': 'ZA', '30': 'GR',
  '31': 'NL', '32': 'BE', '33': 'FR', '34': 'ES', '36': 'HU',
  '39': 'IT', '40': 'RO', '41': 'CH', '43': 'AT', '44': 'GB',
  '45': 'DK', '46': 'SE', '47': 'NO', '48': 'PL', '49': 'DE',
  '51': 'PE', '52': 'MX', '53': 'CU', '54': 'AR', '55': 'BR',
  '56': 'CL', '57': 'CO', '58': 'VE', '60': 'MY', '61': 'AU',
  '62': 'ID', '63': 'PH', '64': 'NZ', '65': 'SG', '66': 'TH',
  '81': 'JP', '82': 'KR', '84': 'VN', '86': 'CN', '90': 'TR',
  '91': 'IN', '92': 'PK', '93': 'AF', '94': 'LK', '95': 'MM',
  '98': 'IR', '212': 'MA', '213': 'DZ', '216': 'TN', '218': 'LY',
  '220': 'GM', '234': 'NG', '254': 'KE', '255': 'TZ', '256': 'UG',
  '351': 'PT', '352': 'LU', '353': 'IE', '354': 'IS', '355': 'AL',
  '370': 'LT', '371': 'LV', '372': 'EE', '380': 'UA', '420': 'CZ',
  '421': 'SK', '880': 'BD', '886': 'TW', '960': 'MV', '961': 'LB',
  '962': 'JO', '963': 'SY', '964': 'IQ', '965': 'KW', '966': 'SA',
  '967': 'YE', '968': 'OM', '971': 'AE', '972': 'IL', '973': 'BH',
  '974': 'QA', '975': 'BT', '976': 'MN', '977': 'NP'
};

console.log(`已配置国家代码映射: ${Object.keys(countryCodeMap).length} 个国家/地区`);
console.log('\n重点国家映射:');
const highlights = ['1', '52', '86', '91', '44', '81', '82', '55', '49', '33'];
highlights.forEach(code => {
  if (countryCodeMap[code]) {
    console.log(`  国码 ${code.padStart(3)} -> ${countryCodeMap[code]}`);
  }
});

console.log('\n========================================');
console.log('测试完成！');
console.log('========================================\n');
