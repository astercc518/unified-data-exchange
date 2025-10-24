#!/bin/bash
#
# Prometheus + Grafana 监控系统自动安装和配置脚本
#

set -e  # 遇到错误立即退出

echo "========================================="
echo "UDE 监控系统安装"
echo "Prometheus + Grafana + Node Exporter"
echo "========================================="

# 创建监控目录
MONITOR_DIR="/opt/ude-monitor"
mkdir -p "$MONITOR_DIR"
cd "$MONITOR_DIR"

# 版本配置
PROMETHEUS_VERSION="2.45.0"
NODE_EXPORTER_VERSION="1.6.1"
GRAFANA_VERSION="10.1.5"

echo ""
echo "1️⃣ 安装 Prometheus..."
echo "-------------------"

# 下载 Prometheus
if [ ! -f "prometheus-${PROMETHEUS_VERSION}.linux-amd64.tar.gz" ]; then
  wget https://github.com/prometheus/prometheus/releases/download/v${PROMETHEUS_VERSION}/prometheus-${PROMETHEUS_VERSION}.linux-amd64.tar.gz
fi

# 解压
tar -xzf prometheus-${PROMETHEUS_VERSION}.linux-amd64.tar.gz
mv prometheus-${PROMETHEUS_VERSION}.linux-amd64 prometheus

# 创建 Prometheus 配置文件
cat > prometheus/prometheus.yml << 'EOF'
global:
  scrape_interval: 15s
  evaluation_interval: 15s
  external_labels:
    cluster: 'ude-production'
    environment: 'production'

# 告警规则文件
rule_files:
  - 'alert_rules.yml'

# 监控目标配置
scrape_configs:
  # Prometheus 自身监控
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  # Node Exporter (系统指标)
  - job_name: 'node-exporter'
    static_configs:
      - targets: ['localhost:9100']

  # UDE 后端服务监控
  - job_name: 'ude-backend'
    static_configs:
      - targets: ['localhost:3000']
    metrics_path: '/metrics'

# 告警管理器配置（可选）
# alerting:
#   alertmanagers:
#     - static_configs:
#         - targets: ['localhost:9093']
EOF

echo "✅ Prometheus 配置完成"

echo ""
echo "2️⃣ 安装 Node Exporter..."
echo "-------------------"

# 下载 Node Exporter
if [ ! -f "node_exporter-${NODE_EXPORTER_VERSION}.linux-amd64.tar.gz" ]; then
  wget https://github.com/prometheus/node_exporter/releases/download/v${NODE_EXPORTER_VERSION}/node_exporter-${NODE_EXPORTER_VERSION}.linux-amd64.tar.gz
fi

# 解压
tar -xzf node_exporter-${NODE_EXPORTER_VERSION}.linux-amd64.tar.gz
mv node_exporter-${NODE_EXPORTER_VERSION}.linux-amd64 node_exporter

echo "✅ Node Exporter 安装完成"

echo ""
echo "3️⃣ 安装 Grafana..."
echo "-------------------"

# 添加 Grafana YUM 仓库
cat > /etc/yum.repos.d/grafana.repo << 'EOF'
[grafana]
name=grafana
baseurl=https://packages.grafana.com/oss/rpm
repo_gpgcheck=1
enabled=1
gpgcheck=1
gpgkey=https://packages.grafana.com/gpg.key
sslverify=1
sslcacert=/etc/pki/tls/certs/ca-bundle.crt
EOF

# 安装 Grafana
yum install -y grafana

echo "✅ Grafana 安装完成"

echo ""
echo "4️⃣ 创建告警规则..."
echo "-------------------"

# 创建告警规则文件
cat > prometheus/alert_rules.yml << 'EOF'
groups:
  - name: ude_alerts
    interval: 30s
    rules:
      # CPU 使用率告警
      - alert: HighCPUUsage
        expr: 100 - (avg by (instance) (irate(node_cpu_seconds_total{mode="idle"}[5m])) * 100) > 80
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "CPU 使用率过高 (实例 {{ $labels.instance }})"
          description: "CPU 使用率超过 80% (当前值: {{ $value }}%)"

      # 内存使用率告警
      - alert: HighMemoryUsage
        expr: (1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)) * 100 > 85
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "内存使用率过高 (实例 {{ $labels.instance }})"
          description: "内存使用率超过 85% (当前值: {{ $value }}%)"

      # 磁盘使用率告警
      - alert: HighDiskUsage
        expr: (1 - (node_filesystem_avail_bytes{fstype!~"tmpfs|fuse.lxcfs"} / node_filesystem_size_bytes)) * 100 > 80
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "磁盘使用率过高 (实例 {{ $labels.instance }})"
          description: "磁盘 {{ $labels.mountpoint }} 使用率超过 80% (当前值: {{ $value }}%)"

      # 服务下线告警
      - alert: ServiceDown
        expr: up == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "服务下线 ({{ $labels.job }})"
          description: "{{ $labels.job }} 服务已下线超过 1 分钟"

      # PM2 进程重启频繁告警
      - alert: FrequentRestarts
        expr: increase(pm2_restarts_total[1h]) > 10
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "PM2 进程频繁重启 ({{ $labels.app_name }})"
          description: "应用 {{ $labels.app_name }} 在 1 小时内重启超过 10 次"
EOF

echo "✅ 告警规则配置完成"

echo ""
echo "5️⃣ 创建 systemd 服务..."
echo "-------------------"

# Prometheus systemd 服务
cat > /etc/systemd/system/prometheus.service << EOF
[Unit]
Description=Prometheus
After=network.target

[Service]
Type=simple
User=root
ExecStart=${MONITOR_DIR}/prometheus/prometheus \\
  --config.file=${MONITOR_DIR}/prometheus/prometheus.yml \\
  --storage.tsdb.path=${MONITOR_DIR}/prometheus/data \\
  --web.console.templates=${MONITOR_DIR}/prometheus/consoles \\
  --web.console.libraries=${MONITOR_DIR}/prometheus/console_libraries
Restart=always

[Install]
WantedBy=multi-user.target
EOF

# Node Exporter systemd 服务
cat > /etc/systemd/system/node_exporter.service << EOF
[Unit]
Description=Node Exporter
After=network.target

[Service]
Type=simple
User=root
ExecStart=${MONITOR_DIR}/node_exporter/node_exporter
Restart=always

[Install]
WantedBy=multi-user.target
EOF

echo "✅ systemd 服务创建完成"

echo ""
echo "6️⃣ 启动服务..."
echo "-------------------"

# 重载 systemd
systemctl daemon-reload

# 启动并启用服务
systemctl enable prometheus node_exporter grafana-server
systemctl start prometheus node_exporter grafana-server

echo "✅ 所有服务已启动"

echo ""
echo "========================================="
echo "✅ 监控系统安装完成！"
echo "========================================="
echo ""
echo "访问地址："
echo "  Prometheus:  http://localhost:9090"
echo "  Grafana:     http://localhost:3000"
echo "  Node Exporter: http://localhost:9100/metrics"
echo ""
echo "Grafana 默认账号："
echo "  用户名: admin"
echo "  密码:   admin (首次登录需要修改)"
echo ""
echo "下一步："
echo "  1. 访问 Grafana 并添加 Prometheus 数据源"
echo "  2. 导入 Node Exporter 仪表板 (ID: 1860)"
echo "  3. 配置告警通知渠道（邮件/钉钉/微信等）"
echo "========================================="
