#!/bin/bash

# ============================================
# 服务器安全清理脚本
# 用途：清理恶意文件、检查后门、准备安全部署
# 使用方法：sudo bash server-cleanup.sh
# ============================================

set -e  # 遇到错误立即退出

echo "============================================"
echo "🚨 服务器安全清理脚本"
echo "============================================"
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 日志文件
LOG_FILE="/tmp/server-cleanup-$(date +%Y%m%d-%H%M%S).log"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1" | tee -a "$LOG_FILE"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a "$LOG_FILE"
}

# 检查是否为 root 用户
if [ "$EUID" -ne 0 ]; then 
    log_error "请使用 sudo 运行此脚本"
    exit 1
fi

log "开始服务器安全清理..."

# ============================================
# 步骤 1: 停止服务
# ============================================
log "步骤 1: 停止 Node.js 服务..."

if command -v pm2 &> /dev/null; then
    pm2 stop all 2>/dev/null || true
    log_success "PM2 服务已停止"
fi

if systemctl is-active --quiet nginx 2>/dev/null; then
    systemctl stop nginx
    log_success "Nginx 已停止"
fi

# ============================================
# 步骤 2: 检查可疑进程
# ============================================
log "步骤 2: 检查可疑进程..."
echo ""

SUSPICIOUS_PROCESSES=(
    "wget" "curl" "nc" "netcat" "python" "perl" "php"
    "sh" "bash" ".sh" ".py" ".pl"
)

log_warn "可疑进程列表："
for proc in "${SUSPICIOUS_PROCESSES[@]}"; do
    PROCS=$(ps aux | grep -i "$proc" | grep -v grep | grep -v "$0" || true)
    if [ ! -z "$PROCS" ]; then
        echo "$PROCS" | tee -a "$LOG_FILE"
    fi
done

# ============================================
# 步骤 3: 检查定时任务
# ============================================
log "步骤 3: 检查定时任务..."
echo ""

log_warn "用户 crontab:"
crontab -l 2>/dev/null | tee -a "$LOG_FILE" || log "当前用户没有 crontab"

log_warn "系统 crontab (/etc/crontab):"
cat /etc/crontab 2>/dev/null | tee -a "$LOG_FILE" || log "无法读取 /etc/crontab"

log_warn "/etc/cron.d/ 目录:"
ls -la /etc/cron.d/ 2>/dev/null | tee -a "$LOG_FILE" || log "无法访问 /etc/cron.d/"

log_warn "/etc/cron.hourly/ 目录:"
ls -la /etc/cron.hourly/ 2>/dev/null | tee -a "$LOG_FILE" || log "无法访问 /etc/cron.hourly/"

log_warn "/etc/cron.daily/ 目录:"
ls -la /etc/cron.daily/ 2>/dev/null | tee -a "$LOG_FILE" || log "无法访问 /etc/cron.daily/"

# ============================================
# 步骤 4: 检查最近修改的文件
# ============================================
log "步骤 4: 检查最近24小时修改的文件..."
echo ""

log_warn "最近24小时修改的可执行文件:"
find /home /root /tmp /var/tmp -type f -perm -111 -mtime -1 2>/dev/null | head -50 | tee -a "$LOG_FILE" || true

log_warn "最近24小时修改的所有文件 (前50个):"
find / -type f -mtime -1 2>/dev/null | grep -v "/proc\|/sys\|/dev" | head -50 | tee -a "$LOG_FILE" || true

# ============================================
# 步骤 5: 检查可疑的网络连接
# ============================================
log "步骤 5: 检查网络连接..."
echo ""

if command -v netstat &> /dev/null; then
    log_warn "当前网络连接:"
    netstat -antp 2>/dev/null | grep ESTABLISHED | tee -a "$LOG_FILE" || true
elif command -v ss &> /dev/null; then
    log_warn "当前网络连接:"
    ss -antp 2>/dev/null | grep ESTABLISHED | tee -a "$LOG_FILE" || true
fi

# ============================================
# 步骤 6: 检查可疑文件
# ============================================
log "步骤 6: 检查可疑脚本文件..."
echo ""

log_warn "最近7天创建的脚本文件:"
find /home /root /tmp /var/tmp -type f \( -name "*.sh" -o -name "*.py" -o -name "*.pl" \) -perm -111 -mtime -7 2>/dev/null | tee -a "$LOG_FILE" || true

log_warn "隐藏的可执行文件:"
find /home /root -name ".*" -type f -perm -111 2>/dev/null | tee -a "$LOG_FILE" || true

# ============================================
# 步骤 7: 检查项目目录
# ============================================
log "步骤 7: 检查 Node.js 项目目录..."
echo ""

# 假设项目在常见位置
PROJECT_DIRS=(
    "/var/www"
    "/home/*/www"
    "/opt"
    "/usr/local/www"
    "$(pwd)"
)

for dir in "${PROJECT_DIRS[@]}"; do
    if [ -d "$dir" ]; then
        log_warn "检查目录: $dir"
        
        # 检查 node_modules 中的可疑文件
        find "$dir" -path "*/node_modules/*.js" -exec grep -l "eval\|exec\|spawn\|child_process" {} \; 2>/dev/null | head -20 | tee -a "$LOG_FILE" || true
        
        # 检查 .next 目录中的可疑文件
        find "$dir" -path "*/.next/server/*.js" 2>/dev/null | head -20 | tee -a "$LOG_FILE" || true
    fi
done

# ============================================
# 步骤 8: 生成清理建议
# ============================================
log "步骤 8: 生成清理建议..."
echo ""

log_success "检查完成！日志已保存到: $LOG_FILE"
echo ""
log_warn "请仔细查看上面的输出，特别是："
echo "  - 可疑进程（需要手动终止）"
echo "  - 定时任务（需要删除恶意任务）"
echo "  - 最近修改的文件（需要检查）"
echo "  - 网络连接（需要确认合法性）"
echo ""

# ============================================
# 交互式清理选项
# ============================================
read -p "是否要清理 /tmp 目录中的可疑文件? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    log "清理 /tmp 目录..."
    find /tmp -type f -name "*.sh" -mtime -7 -delete 2>/dev/null || true
    find /tmp -type f -name "*.py" -mtime -7 -delete 2>/dev/null || true
    log_success "/tmp 目录已清理"
fi

echo ""
log_success "脚本执行完成！"
echo ""
log_warn "下一步操作："
echo "  1. 仔细检查日志文件: $LOG_FILE"
echo "  2. 手动清理发现的恶意文件和进程"
echo "  3. 清理恶意定时任务"
echo "  4. 重新部署已修复的代码"
echo "  5. 重启服务"




