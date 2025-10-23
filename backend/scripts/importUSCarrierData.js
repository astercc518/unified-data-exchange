/**
 * 美国号码归属数据导入脚本
 * 用于从FCC等数据源导入号码归属信息
 */

const { sequelize } = require('../config/database');
const USPhoneCarrier = require('../models/USPhoneCarrier')(sequelize);
const USCarrier = require('../models/USCarrier')(sequelize);
const USCarrierUpdateLog = require('../models/USCarrierUpdateLog')(sequelize);
const fs = require('fs').promises;
const path = require('path');
const readline = require('readline');

/**
 * 从CSV文件导入数据
 * CSV格式: NPA,NXX,StartRange,EndRange,CarrierName,CarrierType,State,City,OCN,LATA,RateCenter
 */
async function importFromCSV(csvFilePath, dataSource = 'FCC') {
  const startTime = Date.now();
  let addedCount = 0;
  let updatedCount = 0;
  let errorCount = 0;
  const errors = [];

  const transaction = await sequelize.transaction();

  try {
    console.log('开始导入数据...');
    console.log(`源文件: ${csvFilePath}`);
    
    const fileStream = require('fs').createReadStream(csvFilePath);
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity
    });

    let isFirstLine = true;
    let lineNumber = 0;
    
    for await (const line of rl) {
      lineNumber++;
      
      // 跳过标题行
      if (isFirstLine) {
        isFirstLine = false;
        continue;
      }

      // 跳过空行
      if (!line.trim()) {
        continue;
      }

      try {
        // 解析CSV行（简单解析，不处理引号内的逗号）
        const fields = line.split(',').map(f => f.trim());
        
        if (fields.length < 5) {
          errors.push({ line: lineNumber, error: '字段数量不足' });
          errorCount++;
          continue;
        }

        const [npa, nxx, startRange, endRange, carrierName, carrierType, state, city, ocn, lata, rateCenter] = fields;

        // 验证必填字段
        if (!npa || !nxx || !carrierName) {
          errors.push({ line: lineNumber, error: '缺少必填字段' });
          errorCount++;
          continue;
        }

        // 插入或更新数据
        const [record, created] = await USPhoneCarrier.upsert({
          npa: npa.padStart(3, '0'),
          nxx: nxx.padStart(3, '0'),
          start_range: startRange ? startRange.padStart(4, '0') : '0000',
          end_range: endRange ? endRange.padStart(4, '0') : '9999',
          carrier_name: carrierName,
          carrier_type: carrierType || 'Unknown',
          ocn: ocn || null,
          state: state || null,
          city: city || null,
          lata: lata || null,
          rate_center: rateCenter || null,
          last_update: Date.now(),
          data_source: dataSource
        }, { transaction });

        if (created) {
          addedCount++;
        } else {
          updatedCount++;
        }

        // 每1000条记录输出进度
        if ((addedCount + updatedCount) % 1000 === 0) {
          console.log(`已处理 ${addedCount + updatedCount} 条记录...`);
        }

      } catch (error) {
        errors.push({ line: lineNumber, error: error.message });
        errorCount++;
      }
    }

    // 记录导入日志
    await USCarrierUpdateLog.create({
      update_type: 'full',
      records_added: addedCount,
      records_updated: updatedCount,
      records_deleted: 0,
      data_source: dataSource,
      source_file: path.basename(csvFilePath),
      status: errorCount > 0 ? 'partial_success' : 'success',
      error_message: errorCount > 0 ? JSON.stringify(errors.slice(0, 100)) : null,
      start_time: startTime,
      end_time: Date.now(),
      duration: Math.floor((Date.now() - startTime) / 1000),
      operator: 'system'
    }, { transaction });

    await transaction.commit();

    console.log('\n导入完成！');
    console.log(`新增记录: ${addedCount}`);
    console.log(`更新记录: ${updatedCount}`);
    console.log(`错误记录: ${errorCount}`);
    console.log(`耗时: ${Math.floor((Date.now() - startTime) / 1000)}秒`);

    if (errors.length > 0) {
      console.log('\n前10个错误:');
      errors.slice(0, 10).forEach(e => {
        console.log(`  行${e.line}: ${e.error}`);
      });
    }

    return {
      success: true,
      addedCount,
      updatedCount,
      errorCount,
      errors: errors.slice(0, 100)
    };

  } catch (error) {
    await transaction.rollback();
    
    // 记录失败日志
    await USCarrierUpdateLog.create({
      update_type: 'full',
      records_added: addedCount,
      records_updated: updatedCount,
      records_deleted: 0,
      data_source: dataSource,
      source_file: path.basename(csvFilePath),
      status: 'failed',
      error_message: error.message,
      start_time: startTime,
      end_time: Date.now(),
      duration: Math.floor((Date.now() - startTime) / 1000),
      operator: 'system'
    });

    console.error('导入失败:', error);
    throw error;
  }
}

/**
 * 生成示例数据
 * 基于主要区号和运营商生成测试数据
 */
async function generateSampleData() {
  const startTime = Date.now();
  const transaction = await sequelize.transaction();

  try {
    console.log('开始生成示例数据...');

    // 主要区号列表（覆盖美国主要城市）
    const majorAreaCodes = [
      { npa: '212', state: 'New York', city: 'New York' },
      { npa: '213', state: 'California', city: 'Los Angeles' },
      { npa: '312', state: 'Illinois', city: 'Chicago' },
      { npa: '310', state: 'California', city: 'Los Angeles' },
      { npa: '415', state: 'California', city: 'San Francisco' },
      { npa: '617', state: 'Massachusetts', city: 'Boston' },
      { npa: '202', state: 'District of Columbia', city: 'Washington' },
      { npa: '305', state: 'Florida', city: 'Miami' },
      { npa: '404', state: 'Georgia', city: 'Atlanta' },
      { npa: '206', state: 'Washington', city: 'Seattle' }
    ];

    // 主要运营商
    const carriers = [
      { name: 'Verizon Wireless', type: 'Wireless', weight: 0.35 },
      { name: 'AT&T Mobility', type: 'Wireless', weight: 0.32 },
      { name: 'T-Mobile USA', type: 'Wireless', weight: 0.28 },
      { name: 'US Cellular', type: 'Wireless', weight: 0.05 }
    ];

    let totalRecords = 0;

    // 为每个区号的每个NXX前缀分配运营商
    for (const area of majorAreaCodes) {
      // 每个区号分配20个NXX前缀
      for (let nxx = 200; nxx < 220; nxx++) {
        // 随机分配给运营商
        const rand = Math.random();
        let cumWeight = 0;
        let selectedCarrier = carriers[0];
        
        for (const carrier of carriers) {
          cumWeight += carrier.weight;
          if (rand <= cumWeight) {
            selectedCarrier = carrier;
            break;
          }
        }

        await USPhoneCarrier.create({
          npa: area.npa,
          nxx: nxx.toString(),
          start_range: '0000',
          end_range: '9999',
          carrier_name: selectedCarrier.name,
          carrier_type: selectedCarrier.type,
          state: area.state,
          city: area.city,
          last_update: Date.now(),
          data_source: 'Generated Sample'
        }, { transaction });

        totalRecords++;
      }
    }

    // 记录导入日志
    await USCarrierUpdateLog.create({
      update_type: 'full',
      records_added: totalRecords,
      records_updated: 0,
      records_deleted: 0,
      data_source: 'Generated Sample',
      source_file: null,
      status: 'success',
      start_time: startTime,
      end_time: Date.now(),
      duration: Math.floor((Date.now() - startTime) / 1000),
      operator: 'system'
    }, { transaction });

    await transaction.commit();

    console.log('\n示例数据生成完成！');
    console.log(`总记录数: ${totalRecords}`);
    console.log(`耗时: ${Math.floor((Date.now() - startTime) / 1000)}秒`);

    return { success: true, recordCount: totalRecords };

  } catch (error) {
    await transaction.rollback();
    console.error('生成示例数据失败:', error);
    throw error;
  }
}

/**
 * 清空所有数据
 */
async function clearAllData() {
  try {
    console.log('正在清空所有号码归属数据...');
    await USPhoneCarrier.destroy({ where: {}, truncate: true });
    console.log('数据已清空');
    return { success: true };
  } catch (error) {
    console.error('清空数据失败:', error);
    throw error;
  }
}

// 命令行执行
if (require.main === module) {
  const command = process.argv[2];
  const arg = process.argv[3];

  (async () => {
    try {
      await sequelize.authenticate();
      console.log('数据库连接成功\n');

      switch (command) {
        case 'import':
          if (!arg) {
            console.error('请提供CSV文件路径');
            process.exit(1);
          }
          await importFromCSV(arg);
          break;

        case 'sample':
          await generateSampleData();
          break;

        case 'clear':
          await clearAllData();
          break;

        default:
          console.log('使用方法:');
          console.log('  node importUSCarrierData.js import <csv_file>  - 从CSV导入数据');
          console.log('  node importUSCarrierData.js sample              - 生成示例数据');
          console.log('  node importUSCarrierData.js clear               - 清空所有数据');
      }

      await sequelize.close();
      process.exit(0);
    } catch (error) {
      console.error('执行失败:', error);
      await sequelize.close();
      process.exit(1);
    }
  })();
}

module.exports = {
  importFromCSV,
  generateSampleData,
  clearAllData
};
