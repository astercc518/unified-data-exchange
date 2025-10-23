const { parsePhone } = require('./utils/phoneNumberAnalyzer');

// 测试孟加拉号码解析
const testNumbers = [
  '8801630097796',
  '8801844073532',
  '8801617223822',
  '8801611139213',
  '8801860070735',
  '8801817131450',
  '8801891900624'
];

console.log('=== 孟加拉号码解析测试 ===\n');

testNumbers.forEach(num => {
  const result = parsePhone(num, 'BD');
  
  console.log(`原始号码: ${num}`);
  console.log(`  有效: ${result.valid}`);
  console.log(`  国家: ${result.regionCode}`);
  console.log(`  国码: ${result.countryCode}`);
  
  if (result.valid && result.number) {
    console.log(`  E.164: ${result.number.e164}`);
    console.log(`  国际格式: ${result.number.international}`);
    console.log(`  国内格式: ${result.number.national}`);
    console.log(`  Significant: ${result.number.significant}`);
    
    // 提取不同长度的号段
    const significant = result.number.significant;
    if (significant) {
      console.log(`  前1位号段: ${significant.substring(0, 1)}`);
      console.log(`  前2位号段: ${significant.substring(0, 2)}`);
      console.log(`  前3位号段: ${significant.substring(0, 3)}`);
      console.log(`  前4位号段: ${significant.substring(0, 4)}`);
    }
  }
  console.log('---\n');
});

// 测试当前配置的号段
const currentSegments = {
  'Grameenphone': ['17', '170', '171', '172', '173', '174', '175', '176', '177', '178', '179', '13', '130', '131', '132', '133', '19', '190', '191', '192', '193', '194', '195', '196', '197', '198', '199'],
  'Robi': ['18', '180', '181', '182', '183', '184', '185', '186', '187', '188', '189'],
  'Banglalink': ['14', '140', '141', '142', '143', '144', '145', '146', '147', '148', '149', '16', '160', '161', '162', '163', '164', '165', '166', '167', '168', '169'],
  'Teletalk': ['15', '150', '151', '152', '153', '154', '155', '156', '157', '158', '159']
};

console.log('\n=== 当前配置的号段匹配测试 ===\n');
testNumbers.forEach(num => {
  const result = parsePhone(num, 'BD');
  
  if (result.valid && result.number) {
    const significant = result.number.significant;
    
    let matched = false;
    for (const [operator, segments] of Object.entries(currentSegments)) {
      for (let len = 4; len >= 1; len--) {
        const segment = significant.substring(0, len);
        if (segments.includes(segment)) {
          console.log(`${num} -> ${operator} (号段: ${segment}, significant: ${significant})`);
          matched = true;
          break;
        }
      }
      if (matched) break;
    }
    
    if (!matched) {
      console.log(`${num} -> 未匹配 (significant: ${significant})`);
    }
  }
});
