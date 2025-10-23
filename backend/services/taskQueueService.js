/**
 * 后台任务队列服务
 * 负责处理数据处理任务
 * 
 * 使用独立的数据库连接池，避免与主应用争抢连接资源
 */
const { Sequelize } = require('sequelize');
const DataProcessor = require('../utils/dataProcessor');
const PhoneGenerator = require('../utils/phoneNumberGenerator');
const logger = require('../utils/logger');
const fs = require('fs').promises;
const path = require('path');

class TaskQueueService {
  constructor() {
    this.isProcessing = false;
    this.currentTask = null;
    this.sequelize = null;
    this.models = null;
  }

  /**
   * 初始化独立的数据库连接池
   */
  async initialize() {
    try {
      // 为任务队列创建独立的Sequelize实例和连接池
      this.sequelize = new Sequelize({
        dialect: 'mysql',
        host: 'localhost',
        port: 3306,
        username: 'vue_admin_user',
        password: 'vue_admin_2024',
        database: 'vue_admin',
        
        // 独立的连接池配置 - 为后台任务优化
        pool: {
          max: 3,         // 最多3个连接（后台任务单线程处理）
          min: 0,         // 无任务时不保持连接
          acquire: 30000, // 30秒获取超时
          idle: 10000,    // 10秒空闲超时
          evict: 5000     // 每5秒检查并清理空闲连接
        },
        
        // 数据库连接选项
        dialectOptions: {
          connectTimeout: 10000  // 10秒连接超时，匹配MariaDB设置
        },
        
        // 失败重试配置
        retry: {
          max: 3,  // 最多重试3次
          timeout: 5000  // 重试超时5秒
        },
        
        // 日志配置 - 仅在调试时启用
        logging: false,
        
        // 其他配置
        define: {
          timestamps: true,
          createdAt: 'created_at',
          updatedAt: 'updated_at',
          underscored: true,
          freezeTableName: true
        }
      });

      // 测试连接
      await this.sequelize.authenticate();
      logger.info('✅ 任务队列服务数据库连接成功（独立连接池）');

      // 导入模型（使用独立连接）
      const DataProcessingTask = require('../models/DataProcessingTask')(this.sequelize);
      const CustomerDataFile = require('../models/CustomerDataFile')(this.sequelize);

      this.models = {
        DataProcessingTask,
        CustomerDataFile
      };

      logger.info('✅ 任务队列服务模型加载完成');
      return true;
    } catch (error) {
      logger.error('❌ 任务队列服务数据库初始化失败:', error);
      throw error;
    }
  }

  /**
   * 关闭数据库连接
   */
  async shutdown() {
    try {
      if (this.sequelize) {
        await this.sequelize.close();
        logger.info('任务队列服务数据库连接已关闭');
      }
    } catch (error) {
      logger.error('关闭任务队列数据库连接时出错:', error);
    }
  }

  /**
   * 启动任务队列处理
   */
  async start() {
    try {
      // 先初始化数据库连接
      await this.initialize();
      
      logger.info('🚀 任务队列服务已启动（使用独立连接池）');
      
      // 开始处理任务
      this.processNextTask();
    } catch (error) {
      logger.error('❌ 任务队列服务启动失败:', error);
      throw error;
    }
  }

  /**
   * 处理下一个任务
   */
  async processNextTask() {
    if (this.isProcessing) {
      return;
    }

    // 检查数据库连接是否已初始化
    if (!this.models || !this.models.DataProcessingTask) {
      logger.warn('任务队列服务未初始化，等待5秒后重试');
      setTimeout(() => this.processNextTask(), 5000);
      return;
    }

    try {
      // 查找待处理的任务（使用独立连接池）
      const task = await this.models.DataProcessingTask.findOne({
        where: { status: 'pending' },
        order: [['created_at', 'ASC']],
        // 添加查询超时限制
        timeout: 5000
      });

      if (!task) {
        // 没有待处理任务，10秒后再检查（降低轮询频率）
        setTimeout(() => this.processNextTask(), 10000);
        return;
      }

      this.isProcessing = true;
      this.currentTask = task;

      // 开始处理任务
      await this.executeTask(task);

    } catch (error) {
      // 根据错误类型决定处理方式
      if (error.name === 'SequelizeConnectionAcquireTimeoutError') {
        logger.warn('任务队列获取数据库连接超时，将在30秒后重试');
        // 连接超时时等待更长时间再重试
        setTimeout(() => this.processNextTask(), 30000);
      } else if (error.name === 'SequelizeConnectionError') {
        logger.error('任务队列数据库连接错误，将在60秒后重试:', error.message);
        // 连接错误时等待更长时间
        setTimeout(() => this.processNextTask(), 60000);
      } else {
        logger.error('处理任务队列失败:', error.message);
        // 其他错误正常重试
        setTimeout(() => this.processNextTask(), 5000);
      }
    } finally {
      this.isProcessing = false;
      this.currentTask = null;
    }
  }

  /**
   * 执行具体任务
   */
  async executeTask(task) {
    logger.info(`开始执行任务 ${task.id}: ${task.task_name}`);

    try {
      // 更新任务状态为处理中
      await task.update({
        status: 'processing',
        started_at: new Date()
      });

      const params = JSON.parse(task.params);
      let result;

      switch (task.task_type) {
        case 'add_code':
          result = await this.processAddCode(task, params);
          break;
        case 'remove_code':
          result = await this.processRemoveCode(task, params);
          break;
        case 'deduplicate':
          result = await this.processDeduplicate(task, params);
          break;
        case 'generate':
          result = await this.processGenerate(task, params);
          break;
        case 'merge':
          result = await this.processMerge(task, params);
          break;
        case 'split':
          result = await this.processSplit(task, params);
          break;
        default:
          throw new Error(`不支持的任务类型: ${task.task_type}`);
      }

      // 任务完成
      await task.update({
        status: 'completed',
        progress: 100.00,
        processed_records: result.totalRecords,
        success_records: result.successRecords,
        failed_records: result.failedRecords || 0,
        output_file_id: result.outputFileId,
        output_file_name: result.outputFileName,
        completed_at: new Date()
      });

      logger.info(`任务 ${task.id} 完成: ${result.successRecords} 条成功`);

    } catch (error) {
      logger.error(`任务 ${task.id} 失败:`, error);

      await task.update({
        status: 'failed',
        error_message: error.message,
        completed_at: new Date()
      });
    }
  }

  /**
   * 添加国家代码
   */
  async processAddCode(task, params) {
    const { fileId, countryCode } = params;

    // 获取输入文件（使用独立连接）
    const inputFile = await this.models.CustomerDataFile.findByPk(fileId);
    if (!inputFile) {
      throw new Error('输入文件不存在');
    }

    // 读取数据
    const lines = await DataProcessor.readLines(inputFile.file_path);
    await task.update({ total_records: lines.length });

    // 处理数据
    const processedLines = [];
    let processedCount = 0;

    for (const line of lines) {
      const trimmedLine = line.trim();
      if (trimmedLine) {
        processedLines.push(`+${countryCode}${trimmedLine}`);
      }
      processedCount++;

      // 每处理1000条更新一次进度
      if (processedCount % 1000 === 0) {
        const progress = ((processedCount / lines.length) * 100).toFixed(2);
        await task.update({
          processed_records: processedCount,
          progress: progress
        });
      }
    }

    // 保存结果文件
    const outputFileName = `processed_add_code_${Date.now()}.txt`;
    const outputFilePath = path.join(__dirname, '../uploads/processed_data', outputFileName);
    await fs.writeFile(outputFilePath, processedLines.join('\n'), 'utf8');

    // 创建文件记录（使用独立连接）
    const outputFile = await this.models.CustomerDataFile.create({
      customer_id: task.customer_id,
      customer_name: task.customer_name,
      original_filename: `加号_${inputFile.original_filename}`,
      stored_filename: outputFileName,
      file_path: outputFilePath,
      file_size: (await fs.stat(outputFilePath)).size,
      line_count: processedLines.length,
      file_type: 'txt',
      upload_time: Date.now(),
      expire_time: Date.now() + (30 * 24 * 60 * 60 * 1000),
      status: 1,
      description: `添加国家代码 +${countryCode}`
    });

    return {
      totalRecords: lines.length,
      successRecords: processedLines.length,
      outputFileId: outputFile.id,
      outputFileName: outputFile.original_filename
    };
  }

  /**
   * 移除国家代码
   */
  async processRemoveCode(task, params) {
    const { fileId } = params;

    const inputFile = await this.models.CustomerDataFile.findByPk(fileId);
    if (!inputFile) {
      throw new Error('输入文件不存在');
    }

    const lines = await DataProcessor.readLines(inputFile.file_path);
    await task.update({ total_records: lines.length });

    const processedLines = [];
    let processedCount = 0;

    for (const line of lines) {
      const trimmedLine = line.trim();
      if (trimmedLine) {
        // 移除开头的+和数字
        const cleanedLine = trimmedLine.replace(/^\+?\d+/, '');
        if (cleanedLine) {
          processedLines.push(cleanedLine);
        }
      }
      processedCount++;

      if (processedCount % 1000 === 0) {
        const progress = ((processedCount / lines.length) * 100).toFixed(2);
        await task.update({
          processed_records: processedCount,
          progress: progress
        });
      }
    }

    const outputFileName = `processed_remove_code_${Date.now()}.txt`;
    const outputFilePath = path.join(__dirname, '../uploads/processed_data', outputFileName);
    await fs.writeFile(outputFilePath, processedLines.join('\n'), 'utf8');

    const outputFile = await this.models.CustomerDataFile.create({
      customer_id: task.customer_id,
      customer_name: task.customer_name,
      original_filename: `去号_${inputFile.original_filename}`,
      stored_filename: outputFileName,
      file_path: outputFilePath,
      file_size: (await fs.stat(outputFilePath)).size,
      line_count: processedLines.length,
      file_type: 'txt',
      upload_time: Date.now(),
      expire_time: Date.now() + (30 * 24 * 60 * 60 * 1000),
      status: 1,
      description: '移除国家代码'
    });

    return {
      totalRecords: lines.length,
      successRecords: processedLines.length,
      outputFileId: outputFile.id,
      outputFileName: outputFile.original_filename
    };
  }

  /**
   * 去重处理
   */
  async processDeduplicate(task, params) {
    const { fileId } = params;

    const inputFile = await this.models.CustomerDataFile.findByPk(fileId);
    if (!inputFile) {
      throw new Error('输入文件不存在');
    }

    const lines = await DataProcessor.readLines(inputFile.file_path);
    await task.update({ total_records: lines.length });

    const uniqueLines = new Set();
    let processedCount = 0;

    for (const line of lines) {
      const trimmedLine = line.trim();
      if (trimmedLine) {
        uniqueLines.add(trimmedLine);
      }
      processedCount++;

      if (processedCount % 1000 === 0) {
        const progress = ((processedCount / lines.length) * 100).toFixed(2);
        await task.update({
          processed_records: processedCount,
          progress: progress
        });
      }
    }

    const processedLines = Array.from(uniqueLines);
    const outputFileName = `processed_deduplicate_${Date.now()}.txt`;
    const outputFilePath = path.join(__dirname, '../uploads/processed_data', outputFileName);
    await fs.writeFile(outputFilePath, processedLines.join('\n'), 'utf8');

    const outputFile = await this.models.CustomerDataFile.create({
      customer_id: task.customer_id,
      customer_name: task.customer_name,
      original_filename: `去重_${inputFile.original_filename}`,
      stored_filename: outputFileName,
      file_path: outputFilePath,
      file_size: (await fs.stat(outputFilePath)).size,
      line_count: processedLines.length,
      file_type: 'txt',
      upload_time: Date.now(),
      expire_time: Date.now() + (30 * 24 * 60 * 60 * 1000),
      status: 1,
      description: `去重处理，原始${lines.length}条，去重后${processedLines.length}条`
    });

    return {
      totalRecords: lines.length,
      successRecords: processedLines.length,
      failedRecords: lines.length - processedLines.length,
      outputFileId: outputFile.id,
      outputFileName: outputFile.original_filename
    };
  }

  /**
   * 生成号码
   */
  async processGenerate(task, params) {
    const { countryCode, quantity, startNumber } = params;

    await task.update({ total_records: quantity });

    const phoneNumbers = PhoneGenerator.generatePhoneNumbers(
      countryCode,
      quantity,
      startNumber
    );

    let processedCount = 0;
    for (const _ of phoneNumbers) {
      processedCount++;
      if (processedCount % 1000 === 0) {
        const progress = ((processedCount / quantity) * 100).toFixed(2);
        await task.update({
          processed_records: processedCount,
          progress: progress
        });
      }
    }

    const outputFileName = `generated_numbers_${Date.now()}.txt`;
    const outputFilePath = path.join(__dirname, '../uploads/processed_data', outputFileName);
    await fs.writeFile(outputFilePath, phoneNumbers.join('\n'), 'utf8');

    const outputFile = await this.models.CustomerDataFile.create({
      customer_id: task.customer_id,
      customer_name: task.customer_name,
      original_filename: `生成号码_+${countryCode}_${quantity}条.txt`,
      stored_filename: outputFileName,
      file_path: outputFilePath,
      file_size: (await fs.stat(outputFilePath)).size,
      line_count: phoneNumbers.length,
      file_type: 'txt',
      upload_time: Date.now(),
      expire_time: Date.now() + (30 * 24 * 60 * 60 * 1000),
      status: 1,
      description: `生成号码 +${countryCode}`
    });

    return {
      totalRecords: quantity,
      successRecords: phoneNumbers.length,
      outputFileId: outputFile.id,
      outputFileName: outputFile.original_filename
    };
  }

  /**
   * 合并文件
   */
  async processMerge(task, params) {
    const { fileIds } = params;

    const allLines = [];
    let totalCount = 0;

    for (const fileId of fileIds) {
      const file = await this.models.CustomerDataFile.findByPk(fileId);
      if (file) {
        const lines = await DataProcessor.readLines(file.file_path);
        allLines.push(...lines);
        totalCount += lines.length;
      }
    }

    await task.update({ total_records: totalCount });

    let processedCount = 0;
    const processedLines = allLines.filter(line => {
      processedCount++;
      if (processedCount % 1000 === 0) {
        const progress = ((processedCount / totalCount) * 100).toFixed(2);
        task.update({ processed_records: processedCount, progress: progress });
      }
      return line.trim();
    });

    const outputFileName = `merged_files_${Date.now()}.txt`;
    const outputFilePath = path.join(__dirname, '../uploads/processed_data', outputFileName);
    await fs.writeFile(outputFilePath, processedLines.join('\n'), 'utf8');

    const outputFile = await this.models.CustomerDataFile.create({
      customer_id: task.customer_id,
      customer_name: task.customer_name,
      original_filename: `合并文件_${fileIds.length}个文件.txt`,
      stored_filename: outputFileName,
      file_path: outputFilePath,
      file_size: (await fs.stat(outputFilePath)).size,
      line_count: processedLines.length,
      file_type: 'txt',
      upload_time: Date.now(),
      expire_time: Date.now() + (30 * 24 * 60 * 60 * 1000),
      status: 1,
      description: `合并${fileIds.length}个文件`
    });

    return {
      totalRecords: totalCount,
      successRecords: processedLines.length,
      outputFileId: outputFile.id,
      outputFileName: outputFile.original_filename
    };
  }

  /**
   * 拆分文件
   */
  async processSplit(task, params) {
    const { fileId, linesPerFile } = params;

    const inputFile = await this.models.CustomerDataFile.findByPk(fileId);
    if (!inputFile) {
      throw new Error('输入文件不存在');
    }

    const lines = await DataProcessor.readLines(inputFile.file_path);
    await task.update({ total_records: lines.length });

    const chunks = [];
    for (let i = 0; i < lines.length; i += linesPerFile) {
      chunks.push(lines.slice(i, i + linesPerFile));
    }

    const outputFiles = [];
    let processedCount = 0;

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const outputFileName = `split_part_${i + 1}_${Date.now()}.txt`;
      const outputFilePath = path.join(__dirname, '../uploads/processed_data', outputFileName);
      await fs.writeFile(outputFilePath, chunk.join('\n'), 'utf8');

      const outputFile = await this.models.CustomerDataFile.create({
        customer_id: task.customer_id,
        customer_name: task.customer_name,
        original_filename: `拆分_${inputFile.original_filename}_第${i + 1}部分.txt`,
        stored_filename: outputFileName,
        file_path: outputFilePath,
        file_size: (await fs.stat(outputFilePath)).size,
        line_count: chunk.length,
        file_type: 'txt',
        upload_time: Date.now(),
        expire_time: Date.now() + (30 * 24 * 60 * 60 * 1000),
        status: 1,
        description: `拆分文件第${i + 1}部分`
      });

      outputFiles.push(outputFile);
      processedCount += chunk.length;

      const progress = ((processedCount / lines.length) * 100).toFixed(2);
      await task.update({
        processed_records: processedCount,
        progress: progress
      });
    }

    return {
      totalRecords: lines.length,
      successRecords: lines.length,
      outputFileId: outputFiles[0].id,
      outputFileName: `已拆分为${chunks.length}个文件`
    };
  }

  /**
   * 获取当前正在处理的任务
   */
  getCurrentTask() {
    return this.currentTask;
  }
}

// 创建单例
const taskQueueService = new TaskQueueService();

module.exports = taskQueueService;
