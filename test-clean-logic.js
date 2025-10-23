/**
 * 测试一键清洗逻辑
 */

// 测试数据
const testData = [
  '18482191593',   // 11位，第1位是1
  '15612213709',   // 11位，第1位是1
  '7868485719',    // 10位，第7位开头
  '18189844413',   // 11位，第1位是1
  '18149311009',   // 11位，第1位是1
  '19194082308',   // 11位，第1位是1
  '14013381174',   // 11位，第1位是1
  '18133998961',   // 11位，第1位是1
  '7742511372',    // 10位，第7位开头
  '15165191035',   // 11位，第1位是1
  '14075916058',   // 11位，第1位是1
  '13014044115',   // 11位，第1位是1
  '12104807974',   // 11位，第1位是1
  '13104900614',   // 11位，第1位是1
  '14023124789',   // 11位，第1位是1
  '7028075193',    // 10位，第7位开头
  '19173799798',   // 11位，第1位是1
  '15708477968',   // 11位，第1位是1
  '15788888888',   // 11位，后8位相同
  '15799999999',   // 11位，后8位相同
  '152455',        // 6位，太短
  '13104900614122',// 14位
  '12409944535',   // 11位，第1位是1
  '13104900614'    // 重复
];

console.log('=== 测试数据总数 ===');
console.log('总数:', testData.length);

// 步骤1: 去除异常数据
console.log('\n=== 步骤1: 去除异常数据 ===');
let step1Result = testData.filter(line => {
  const fullNumber = line.replace(/^[+\s]+/, '');
  
  // 检查1: 是否全是数字
  if (!/^\d+$/.test(fullNumber)) {
    console.log('删除（非数字）:', line);
    return false;
  }
  
  // 检查2: 长度是否在7-15位之间
  if (fullNumber.length < 7) {
    console.log('删除（< 7位）:', line);
    return false;
  }
  if (fullNumber.length > 15) {
    console.log('删除（> 15位）:', line);
    return false;
  }
  
  // 检查3: 是否有超过8位相同的数字
  if (/(\d)\1{7,}/.test(fullNumber)) {
    console.log('删除（8位相同）:', line);
    return false;
  }
  
  return true;
});

console.log('步骤1后剩余:', step1Result.length);

// 步骤2: 去重
console.log('\n=== 步骤2: 数据去重 ===');
const beforeDedupe = step1Result.length;
step1Result = [...new Set(step1Result)];
console.log('去重前:', beforeDedupe);
console.log('去重后:', step1Result.length);
console.log('去除重复:', beforeDedupe - step1Result.length);

// 步骤3: 智能校验国码（美国国码：1）
console.log('\n=== 步骤3: 智能校验国码（国码：1）===');
const countryCode = '1';
const codeLength = 1;
let addedCount = 0;
let skippedCount = 0;

const step3Result = step1Result.map(line => {
  const cleanLine = line.replace(/^[+\s]+/, '');
  
  if (codeLength === 1) {
    // 11位且以1开头
    if (cleanLine.length === 11 && cleanLine.charAt(0) === countryCode) {
      console.log('保留（11位+1开头）:', cleanLine, '→', cleanLine);
      skippedCount++;
      return cleanLine;
    }
    // 10位
    else if (cleanLine.length === 10) {
      console.log('添加国码（10位）:', cleanLine, '→', countryCode + cleanLine);
      addedCount++;
      return countryCode + cleanLine;
    }
    // 其他长度
    else {
      const prefix = cleanLine.substring(0, codeLength);
      if (prefix === countryCode) {
        console.log('保留（其他长度+1开头）:', cleanLine, '→', cleanLine);
        skippedCount++;
        return cleanLine;
      } else {
        console.log('添加国码（其他长度）:', cleanLine, '→', countryCode + cleanLine);
        addedCount++;
        return countryCode + cleanLine;
      }
    }
  }
});

console.log('\n=== 最终结果 ===');
console.log('原始数据:', testData.length);
console.log('最终数据:', step3Result.length);
console.log('添加国码:', addedCount);
console.log('已有国码:', skippedCount);

console.log('\n=== 最终数据预览（前20条）===');
step3Result.slice(0, 20).forEach((line, index) => {
  console.log(`${index + 1}. ${line}`);
});
