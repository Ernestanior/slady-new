# 🚨 服务器入侵安全分析报告

## 问题确认

您的服务器确实存在严重的 RCE（远程代码执行）漏洞，导致反复被入侵。

## 🔴 根本原因：Next.js 15.5.4 存在严重的 RCE 漏洞

### 1. npm audit 检测结果

运行 `npm audit` 发现：

```
next  15.5.0 - 15.5.7
Severity: critical
Next.js is vulnerable to RCE in React flight protocol - https://github.com/advisories/GHSA-9qr9-h5gf-34mp
Next Server Actions Source Code Exposure  - https://github.com/advisories/GHSA-w37m-7fhw-fmv9
Next Vulnerable to Denial of Service with Server Components - https://github.com/advisories/GHSA-mwv6-3258-q52c
```

**您的 Next.js 版本 15.5.4 正好在这个漏洞范围内！**

### 2. 漏洞详情

- **CVE/Advisory**: GHSA-9qr9-h5gf-34mp
- **严重程度**: Critical（严重）
- **漏洞类型**: Remote Code Execution (RCE) - 远程代码执行
- **影响版本**: Next.js 15.5.0 - 15.5.7
- **您的版本**: Next.js 15.5.4 ❌

### 3. 攻击方式

攻击者可以通过：
1. 构造恶意的 React Flight Protocol 请求
2. 利用 Server Actions 源代码暴露漏洞
3. 通过 Server Components 进行 DoS 攻击并执行任意代码

## 🚨 为什么重新安装系统后又被入侵？

### 问题分析

1. **代码本身存在漏洞**
   - Next.js 15.5.4 的 RCE 漏洞是代码层面的问题
   - 只要部署这个版本的代码，漏洞就存在
   - 攻击者可以持续利用这个漏洞

2. **攻击者的入侵流程**
   ```
   攻击者扫描互联网 → 发现您的服务器 → 
   利用 Next.js RCE 漏洞 → 执行恶意代码 → 
   下载并执行木马（wget）→ 安装后门 → 
   即使重装系统，只要代码部署，漏洞仍在 → 再次被入侵
   ```

3. **从您提供的错误日志可以看出**
   - `wget 5.255.121.141:80` - 尝试下载恶意文件
   - 恶意字符串输出 - 说明已经有恶意代码在执行
   - 这些都是 RCE 漏洞被利用后的典型症状

## 🔍 代码安全检查结果

### ✅ 相对安全的部分

1. **没有发现明显的命令注入**
   - `buildZip.js` 中的 `execSync` 只在构建时使用，不对外暴露

2. **API 调用看起来正常**
   - 使用 axios 进行 HTTP 请求
   - 没有发现明显的 SQL 注入或命令执行

3. **文件上传有基本验证**
   - `ImageUpload.tsx` 有文件类型检查

### ⚠️ 需要注意的安全问题

1. **硬编码的 API URL**
   ```typescript
   const API_BASE_URL = 'http://119.28.104.20';
   ```
   - 应该使用环境变量
   - 但这不是导致 RCE 的直接原因

2. **Next.js 15.5.4 的 RCE 漏洞**
   - **这是最严重的问题，很可能是入侵的根本原因**

## 🔧 立即修复方案

### 步骤 1：立即升级 Next.js（最高优先级）

```bash
# 方法1：使用 npm audit fix（推荐）
npm audit fix --force

# 方法2：手动升级到安全版本
npm install next@15.5.9 --save-exact
# 或升级到最新稳定版
npm install next@latest --save-exact
```

**升级到 Next.js 15.5.9 或更高版本可以修复 RCE 漏洞。**

### 步骤 2：验证升级成功

```bash
npm audit
# 应该显示没有 critical 漏洞
```

### 步骤 3：重新构建和部署

```bash
# 清理旧的构建
rm -rf .next node_modules

# 重新安装依赖
npm install

# 重新构建
npm run build

# 部署新版本
```

### 步骤 4：服务器安全加固（必须执行）

#### 4.1 检查并清理服务器

```bash
# 1. 停止所有服务
pm2 stop all
systemctl stop nginx  # 如果使用 nginx

# 2. 检查可疑进程
ps aux | grep -E "wget|curl|nc|netcat|python|perl|php|sh|bash" | grep -v grep

# 3. 检查定时任务
crontab -l
cat /etc/crontab
ls -la /etc/cron.d/
ls -la /etc/cron.hourly/
ls -la /etc/cron.daily/

# 4. 检查最近修改的文件（过去24小时）
find / -type f -mtime -1 2>/dev/null | head -50

# 5. 检查可疑的网络连接
netstat -antp | grep ESTABLISHED

# 6. 检查是否有可疑的隐藏文件
find / -name ".*" -type f -perm -111 2>/dev/null
```

#### 4.2 清理恶意文件和后门

```bash
# 查找可疑的脚本文件
find / -name "*.sh" -perm -111 -mtime -7 2>/dev/null
find / -name "*.py" -perm -111 -mtime -7 2>/dev/null

# 检查 node_modules 中是否有可疑文件
find node_modules -name "*.js" -exec grep -l "eval\|exec\|spawn\|child_process" {} \;

# 检查 .next 目录是否有可疑文件
find .next -type f -name "*.js" | head -20
```

#### 4.3 服务器配置加固

```bash
# 1. 修改 SSH 配置（如果使用）
# 编辑 /etc/ssh/sshd_config
# - 禁用 root 登录
# - 使用密钥认证
# - 更改默认端口

# 2. 配置防火墙
# 只开放必要的端口（如 80, 443, 3000）
# 关闭所有不必要的端口

# 3. 限制 Node.js 进程权限
# 不要使用 root 运行 Node.js
# 使用非特权用户运行
```

#### 4.4 重新部署代码

```bash
# 1. 使用全新的干净代码（从 Git 拉取）
git clean -fd
git reset --hard HEAD
npm install
npm run build

# 2. 使用非 root 用户运行
sudo -u www-data pm2 start npm --name "nextjs" -- start
# 或
sudo -u www-data npm start
```

### 步骤 5：持续监控

```bash
# 设置日志监控
# 监控 Node.js 进程的输出
pm2 logs

# 监控系统日志
tail -f /var/log/syslog
tail -f /var/log/auth.log

# 监控网络连接
watch -n 5 'netstat -antp | grep ESTABLISHED'
```

## 📋 安全检查清单

- [ ] 升级 Next.js 到 15.5.9 或更高版本
- [ ] 运行 `npm audit` 确认没有 critical 漏洞
- [ ] 清理服务器上的恶意文件
- [ ] 检查并清理定时任务
- [ ] 检查并清理恶意进程
- [ ] 使用非 root 用户运行 Node.js
- [ ] 配置防火墙，只开放必要端口
- [ ] 重新部署代码
- [ ] 监控系统日志和进程
- [ ] 定期更新依赖包

## 🔐 长期安全建议

### 1. 依赖管理

```bash
# 定期检查依赖漏洞
npm audit

# 使用自动更新工具
npm-check-updates -u
npm install

# 使用 lockfile
# 确保 package-lock.json 提交到版本控制
```

### 2. 环境变量

```bash
# 创建 .env.local 文件（不要提交到 Git）
# 将敏感信息放在环境变量中
API_BASE_URL=http://your-api-server.com
NODE_ENV=production
```

### 3. 代码审查

- 定期审查代码，特别是涉及用户输入的部分
- 使用代码扫描工具（如 Snyk, SonarQube）
- 实施 CI/CD 安全检查

### 4. 服务器加固

- 定期更新操作系统
- 使用 fail2ban 防止暴力破解
- 配置 WAF（Web Application Firewall）
- 使用 CDN 隐藏真实服务器 IP
- 定期备份数据

### 5. 监控和告警

- 设置服务器监控（CPU、内存、磁盘、网络）
- 设置异常行为告警
- 记录并分析访问日志
- 使用入侵检测系统（IDS）

## 🚨 如果问题持续存在

如果升级 Next.js 后问题仍然存在，可能的原因：

1. **服务器上仍有后门**
   - 需要彻底重装系统
   - 从干净的系统镜像开始

2. **其他漏洞**
   - 后端 API 服务可能存在漏洞
   - 数据库可能存在注入漏洞
   - 其他依赖包可能存在漏洞

3. **供应链攻击**
   - node_modules 中的某个包可能被污染
   - 建议删除 node_modules 和 package-lock.json，重新安装

## 📞 需要更多信息

为了更好地帮助您，请提供以下信息：

1. **服务器信息**
   - 操作系统版本
   - Node.js 版本
   - PM2 版本（如果使用）
   - Web 服务器（Nginx/Apache）

2. **部署方式**
   - 如何部署代码到服务器？
   - 使用 Docker 吗？
   - 使用 CI/CD 吗？

3. **网络配置**
   - 服务器是否直接暴露在公网？
   - 是否使用反向代理（Nginx）？
   - 防火墙配置如何？

4. **错误日志**
   - 完整的错误日志
   - 系统日志（/var/log/syslog）
   - PM2 日志

5. **检查结果**
   - `crontab -l` 的输出
   - `ps aux | grep node` 的输出
   - `netstat -antp` 的输出

---

**最后更新**: 2025年1月  
**严重程度**: 🔴 Critical  
**建议操作**: 立即升级 Next.js 并按照上述步骤加固服务器




