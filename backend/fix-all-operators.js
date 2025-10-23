/**
 * 批量修复所有国家运营商号段的前导0问题
 * 根据 libphonenumber 解析规则，去掉所有号段的前导0
 */

const fs = require('fs');

// 读取配置文件
const filePath = '/home/vue-element-admin/src/data/operators.js';
let content = fs.readFileSync(filePath, 'utf-8');

// 需要修复的国家列表（从分析结果中提取）
const countriesToFix = [
  'PK', 'TH', 'GB', 'DE', 'VN', 'PH', 'MY', 'MM', 'JP', 'KR',
  'LK', 'KH', 'LA', 'AF', 'IR', 'IQ', 'SA', 'AE', 'TR', 'IL',
  'KZ', 'UZ', 'FR', 'UA', 'RO', 'NL', 'BE', 'SE', 'FI', 'CH',
  'AT', 'AR', 'VE', 'EC', 'NG', 'EG', 'ZA', 'KE', 'ET', 'DZ',
  'MA', 'UG', 'GH', 'TZ', 'AU', 'NZ'
];

let fixCount = 0;
const fixLog = [];

countriesToFix.forEach(countryCode => {
  // 匹配国家配置块
  const countryPattern = new RegExp(
    `'${countryCode}':\\s*\\{[\\s\\S]*?operators:\\s*\\[([\\s\\S]*?)\\]\\s*\\}`,
    'g'
  );
  
  const match = countryPattern.exec(content);
  if (!match) {
    console.log(`⚠️  ${countryCode}: 未找到配置`);
    return;
  }
  
  const operatorBlock = match[1];
  let fixedBlock = operatorBlock;
  let segmentCount = 0;
  
  // 匹配所有 numberSegments 数组
  fixedBlock = fixedBlock.replace(
    /numberSegments:\s*\[([^\]]+)\]/g,
    (fullMatch, segments) => {
      // 去掉所有号段的前导0
      const fixed = segments.replace(
        /'(0\d+)'/g,
        (segMatch, segment) => {
          // 去掉前导0
          const cleaned = segment.replace(/^0+/, '');
          if (cleaned !== segment) {
            segmentCount++;
          }
          return `'${cleaned}'`;
        }
      );
      return `numberSegments: [${fixed}]`;
    }
  );
  
  if (segmentCount > 0) {
    // 替换原始内容中的运营商块
    content = content.replace(match[1], fixedBlock);
    fixCount++;
    fixLog.push(`✅ ${countryCode}: 修复 ${segmentCount} 个号段`);
    console.log(`✅ ${countryCode}: 修复 ${segmentCount} 个号段`);
  } else {
    fixLog.push(`ℹ️  ${countryCode}: 无需修复`);
    console.log(`ℹ️  ${countryCode}: 无需修复`);
  }
});

// 写回文件
fs.writeFileSync(filePath, content, 'utf-8');

console.log(`\n=== 修复完成 ===`);
console.log(`总计修复: ${fixCount} 个国家`);
console.log(`配置文件已更新: ${filePath}`);

// 保存修复日志
fs.writeFileSync(
  '/home/vue-element-admin/backend/operator-fix-log.txt',
  fixLog.join('\n') + `\n\n总计修复: ${fixCount} 个国家\n修复时间: ${new Date().toISOString()}`
);

console.log(`修复日志已保存: /home/vue-element-admin/backend/operator-fix-log.txt`);
