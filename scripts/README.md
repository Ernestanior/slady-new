# 服务器安全修复脚本

## 使用说明

这些脚本用于帮助您安全地清理服务器并部署修复后的代码。

### ⚠️ 重要提示

1. **在执行任何脚本前，请先备份重要数据**
2. **建议在维护窗口期间执行**
3. **仔细阅读每个脚本的输出**

## 脚本列表

### 1. server-cleanup.sh - 服务器清理脚本

**用途**: 检查并清理服务器上的恶意文件、后门和可疑活动

**使用方法**:
```bash
# 上传脚本到服务器
scp scripts/server-cleanup.sh user@your-server:/tmp/

# SSH 到服务器并执行
ssh user@your-server
sudo bash /tmp/server-cleanup.sh
```

**功能**:
- ✅ 停止 Node.js 和 Web 服务
- ✅ 检查可疑进程
- ✅ 检查定时任务（crontab）
- ✅ 检查最近修改的文件
- ✅ 检查网络连接
- ✅ 检查可疑脚本文件
- ✅ 生成详细的日志报告

**输出**: 日志文件保存在 `/tmp/server-cleanup-YYYYMMDD-HHMMSS.log`

### 2. deploy-safe.sh - 安全部署脚本

**用途**: 安全地部署修复后的代码

**使用方法**:
```bash
# 上传脚本到服务器
scp scripts/deploy-safe.sh user@your-server:/tmp/

# SSH 到服务器，进入项目目录并执行
ssh user@your-server
cd /path/to/your/project
sudo bash /tmp/deploy-safe.sh /path/to/your/project
```

**功能**:
- ✅ 备份当前版本
- ✅ 验证 Next.js 版本 >= 15.5.9
- ✅ 清理旧构建文件
- ✅ 安装依赖
- ✅ 运行安全审计
- ✅ 构建项目
- ✅ 设置正确的文件权限
- ✅ 提供重启服务的命令

**环境变量**:
```bash
# 设置运行 Node.js 的用户（默认: www-data）
export NODE_USER=your-user
sudo bash /tmp/deploy-safe.sh /path/to/project
```

## 完整修复流程

### 步骤 1: 准备本地代码

```bash
# 在本地（已完成）
cd /Users/linernest/Desktop/code/slady-new
git add .
git commit -m "fix: upgrade Next.js to 15.5.9 to fix RCE vulnerability"
git push
```

### 步骤 2: 上传脚本到服务器

```bash
# 从本地执行
scp scripts/server-cleanup.sh user@your-server:/tmp/
scp scripts/deploy-safe.sh user@your-server:/tmp/
```

### 步骤 3: SSH 到服务器并运行清理脚本

```bash
ssh user@your-server

# 运行清理脚本
sudo bash /tmp/server-cleanup.sh

# 仔细检查输出，手动清理发现的恶意文件
```

### 步骤 4: 更新服务器上的代码

```bash
# 在服务器上
cd /path/to/your/project

# 方法1: 使用 Git 拉取（推荐）
git pull origin main  # 或你的分支名

# 方法2: 使用 SCP 上传
# 在本地执行: scp -r . user@your-server:/path/to/project/
```

### 步骤 5: 运行部署脚本

```bash
# 在服务器上
cd /path/to/your/project
sudo bash /tmp/deploy-safe.sh /path/to/your/project
```

### 步骤 6: 重启服务

```bash
# 根据部署脚本的提示执行
# 如果使用 PM2:
sudo -u www-data pm2 restart all

# 或重新启动:
sudo -u www-data pm2 delete all
sudo -u www-data pm2 start npm --name 'nextjs' -- start

# 如果直接运行:
sudo -u www-data npm start
```

### 步骤 7: 验证部署

```bash
# 检查服务状态
pm2 status
# 或
ps aux | grep node

# 查看日志
pm2 logs
# 或
tail -f /var/log/nextjs.log

# 检查端口
netstat -tulpn | grep :3000
# 或
ss -tulpn | grep :3000

# 测试访问
curl http://localhost:3000
```

## 常见问题

### Q: 如果清理脚本发现可疑文件怎么办？

A: 
1. 仔细检查每个文件
2. 确认是恶意文件后，手动删除
3. 记录删除的文件，以便后续分析

### Q: 如何确认 Next.js 已正确升级？

A:
```bash
cd /path/to/project
npm list next
# 应该显示: next@15.5.9
```

### Q: 如何确认漏洞已修复？

A:
```bash
cd /path/to/project
npm audit --production
# 应该显示: found 0 vulnerabilities
```

### Q: 如果服务启动失败怎么办？

A:
1. 检查日志: `pm2 logs` 或 `npm start`
2. 检查端口占用: `netstat -tulpn | grep :3000`
3. 检查权限: `ls -la`
4. 检查 Node.js 版本: `node -v` (需要 Node.js 18+)

## 安全建议

1. **定期检查**: 每周运行一次 `npm audit`
2. **及时更新**: 发现漏洞立即修复
3. **监控日志**: 设置日志监控和告警
4. **备份数据**: 定期备份重要数据
5. **使用非 root 用户**: 永远不要使用 root 运行 Node.js
6. **配置防火墙**: 只开放必要端口
7. **使用 HTTPS**: 生产环境必须使用 HTTPS

## 需要帮助？

如果遇到问题，请提供：
1. 错误日志
2. 脚本输出
3. 系统信息 (uname -a)
4. Node.js 版本 (node -v)
5. npm 版本 (npm -v)




