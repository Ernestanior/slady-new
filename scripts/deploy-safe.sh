#!/bin/bash

# ============================================
# 安全部署脚本
# 用途：安全地部署修复后的代码
# 使用方法：sudo bash deploy-safe.sh /path/to/project
# ============================================

set -e

echo "============================================"
echo "🚀 安全部署脚本"
echo "============================================"
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

PROJECT_DIR="${1:-$(pwd)}"
NODE_USER="${NODE_USER:-www-data}"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

# 检查项目目录
if [ ! -d "$PROJECT_DIR" ]; then
    log_error "项目目录不存在: $PROJECT_DIR"
    exit 1
fi

cd "$PROJECT_DIR"

log "项目目录: $PROJECT_DIR"

# ============================================
# 步骤 1: 备份当前版本
# ============================================
log "步骤 1: 备份当前版本..."

BACKUP_DIR="/tmp/backup-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"

if [ -d ".next" ]; then
    cp -r .next "$BACKUP_DIR/" 2>/dev/null || true
    log_success "已备份 .next 目录到 $BACKUP_DIR"
fi

if [ -f "package-lock.json" ]; then
    cp package-lock.json "$BACKUP_DIR/" 2>/dev/null || true
fi

# ============================================
# 步骤 2: 验证 package.json
# ============================================
log "步骤 2: 验证 Next.js 版本..."

NEXT_VERSION=$(grep '"next"' package.json | sed 's/.*"next": "\([^"]*\)".*/\1/')
log "当前 Next.js 版本: $NEXT_VERSION"

# 检查版本是否 >= 15.5.9
if [ "$(printf '%s\n' "15.5.9" "$NEXT_VERSION" | sort -V | head -n1)" != "15.5.9" ]; then
    log_error "Next.js 版本过低，需要 >= 15.5.9"
    log_warn "运行: npm install next@15.5.9 --save-exact"
    exit 1
fi

log_success "Next.js 版本符合要求"

# ============================================
# 步骤 3: 清理旧文件
# ============================================
log "步骤 3: 清理旧的构建文件..."

rm -rf .next
rm -rf node_modules
log_success "已清理旧文件"

# ============================================
# 步骤 4: 安装依赖
# ============================================
log "步骤 4: 安装依赖..."

npm install --production=false
log_success "依赖安装完成"

# ============================================
# 步骤 5: 安全检查
# ============================================
log "步骤 5: 运行安全审计..."

if npm audit --production 2>&1 | grep -q "found 0 vulnerabilities"; then
    log_success "未发现安全漏洞"
else
    log_warn "发现安全漏洞，请检查: npm audit"
fi

# ============================================
# 步骤 6: 构建项目
# ============================================
log "步骤 6: 构建项目..."

npm run build
log_success "构建完成"

# ============================================
# 步骤 7: 设置正确的文件权限
# ============================================
log "步骤 7: 设置文件权限..."

if id "$NODE_USER" &>/dev/null; then
    chown -R "$NODE_USER:$NODE_USER" "$PROJECT_DIR"
    log_success "已设置文件所有者为 $NODE_USER"
else
    log_warn "用户 $NODE_USER 不存在，跳过权限设置"
fi

# ============================================
# 步骤 8: 重启服务
# ============================================
log "步骤 8: 准备重启服务..."

if command -v pm2 &> /dev/null; then
    log_warn "检测到 PM2，请手动重启服务:"
    echo "  sudo -u $NODE_USER pm2 restart all"
    echo "  或"
    echo "  sudo -u $NODE_USER pm2 delete all && sudo -u $NODE_USER pm2 start npm --name 'nextjs' -- start"
else
    log_warn "请手动重启 Node.js 服务:"
    echo "  sudo -u $NODE_USER npm start"
fi

echo ""
log_success "部署准备完成！"
echo ""
log_warn "下一步操作："
echo "  1. 重启服务（使用上面的命令）"
echo "  2. 检查服务是否正常运行"
echo "  3. 监控日志: pm2 logs 或 tail -f /var/log/nextjs.log"
echo "  4. 检查进程: ps aux | grep node"




