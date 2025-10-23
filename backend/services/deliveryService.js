/**
 * 数据发送服务
 * 包含邮箱发送和TGBot发送功能
 */
const nodemailer = require('nodemailer');
const logger = require('../utils/logger');
const fs = require('fs');
const path = require('path');

class DeliveryService {
  /**
   * 邮箱发送服务
   */
  static async sendByEmail(orderData, emailConfig, recipientEmail) {
    try {
      logger.info(`📧 开始邮箱发送，订单号: ${orderData.orderNumber}`);

      // 创建邮件传输器
      const transporter = nodemailer.createTransport({
        host: emailConfig.smtp_host,
        port: emailConfig.smtp_port,
        secure: emailConfig.smtp_secure || false,
        auth: {
          user: emailConfig.smtp_user,
          pass: emailConfig.smtp_pass
        }
      });

      // 生成TXT文件内容
      const txtContent = this.generateTxtContent(orderData);
      
      // 创建临时文件
      const tempDir = path.join(__dirname, '../temp');
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }
      
      const fileName = `${orderData.orderNumber}_data.txt`;
      const filePath = path.join(tempDir, fileName);
      fs.writeFileSync(filePath, txtContent, 'utf8');

      // 发送邮件
      const mailOptions = {
        from: `"${emailConfig.sender_name || '数据平台'}" <${emailConfig.smtp_user}>`,
        to: recipientEmail,
        subject: `订单数据发送 - ${orderData.orderNumber}`,
        html: `
          <h2>订单数据发送通知</h2>
          <p>尊敬的客户，您购买的数据已准备完成。</p>
          <hr>
          <p><strong>订单号：</strong>${orderData.orderNumber}</p>
          <p><strong>数据国家：</strong>${orderData.country}</p>
          <p><strong>数据数量：</strong>${orderData.quantity} 条</p>
          <p><strong>发送时间：</strong>${new Date().toLocaleString('zh-CN')}</p>
          <hr>
          <p>请查收附件中的数据文件。</p>
          <p style="color: #999; font-size: 12px;">此邮件由系统自动发送，请勿回复。</p>
        `,
        attachments: [
          {
            filename: fileName,
            path: filePath
          }
        ]
      };

      const info = await transporter.sendMail(mailOptions);
      
      // 删除临时文件
      fs.unlinkSync(filePath);

      logger.info(`✅ 邮件发送成功: ${info.messageId}`);
      
      return {
        success: true,
        messageId: info.messageId,
        recipient: recipientEmail
      };
    } catch (error) {
      logger.error('邮件发送失败:', error);
      throw new Error(`邮件发送失败: ${error.message}`);
    }
  }

  /**
   * TGBot发送服务
   */
  static async sendByTGBot(orderData, tgbotConfig, chatId) {
    try {
      logger.info(`🤖 开始TGBot发送，订单号: ${orderData.orderNumber}, ChatID: ${chatId}`);

      const TelegramBot = require('node-telegram-bot-api');
      const bot = new TelegramBot(tgbotConfig.bot_token);

      // 生成TXT文件内容
      const txtContent = this.generateTxtContent(orderData);
      
      // 创建临时文件
      const tempDir = path.join(__dirname, '../temp');
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }
      
      const fileName = `${orderData.orderNumber}_data.txt`;
      const filePath = path.join(tempDir, fileName);
      fs.writeFileSync(filePath, txtContent, 'utf8');

      // 发送文件消息
      const caption = `
📦 订单数据发送

订单号：${orderData.orderNumber}
数据国家：${orderData.country}
数据数量：${orderData.quantity} 条
发送时间：${new Date().toLocaleString('zh-CN')}

✅ 数据已准备完成，请查收附件。
      `.trim();

      await bot.sendDocument(chatId, filePath, {
        caption: caption
      });

      // 删除临时文件
      fs.unlinkSync(filePath);

      logger.info(`✅ TGBot发送成功，ChatID: ${chatId}`);
      
      return {
        success: true,
        chatId: chatId
      };
    } catch (error) {
      logger.error('TGBot发送失败:', error);
      throw new Error(`TGBot发送失败: ${error.message}`);
    }
  }

  /**
   * 生成TXT文件内容
   */
  static generateTxtContent(orderData) {
    const lines = [];
    
    // 添加文件头
    lines.push('========================================');
    lines.push(`订单号: ${orderData.orderNumber}`);
    lines.push(`数据国家: ${orderData.country}`);
    lines.push(`数据时效: ${orderData.validityName}`);
    lines.push(`数据数量: ${orderData.quantity} 条`);
    lines.push(`生成时间: ${new Date().toLocaleString('zh-CN')}`);
    lines.push('========================================');
    lines.push('');
    
    // 添加数据内容
    if (orderData.dataContent) {
      lines.push(orderData.dataContent);
    } else {
      lines.push('# 数据内容');
      lines.push('# 每行一条数据');
      
      // 示例数据（实际应从数据库提取）
      for (let i = 1; i <= orderData.quantity; i++) {
        lines.push(`data_line_${i}`);
      }
    }
    
    lines.push('');
    lines.push('========================================');
    lines.push('数据发送完成');
    lines.push('========================================');
    
    return lines.join('\n');
  }

  /**
   * 验证订单状态
   */
  static validateOrderStatus(order) {
    // 订单必须是已完成状态
    if (order.status !== 'completed') {
      throw new Error('订单未完成，无法发货');
    }

    // 订单不能已发货
    if (order.delivery_status === 'delivered') {
      throw new Error('订单已发货，请勿重复发货');
    }

    return true;
  }

  /**
   * 从数据库提取订单数据
   */
  static async extractOrderData(orderId, OrderData) {
    try {
      const dataRecords = await OrderData.findAll({
        where: { order_id: orderId }
      });

      if (!dataRecords || dataRecords.length === 0) {
        logger.warn(`订单 ${orderId} 没有关联的数据记录`);
        return null;
      }

      // 合并所有数据内容
      const dataContent = dataRecords
        .map(record => record.data_content)
        .join('\n');

      const totalCount = dataRecords.reduce(
        (sum, record) => sum + record.data_count,
        0
      );

      return {
        dataContent,
        dataCount: totalCount,
        records: dataRecords
      };
    } catch (error) {
      logger.error('提取订单数据失败:', error);
      throw error;
    }
  }
}

module.exports = DeliveryService;
