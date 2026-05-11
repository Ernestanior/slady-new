# 订单状态更新说明

## 新增状态

添加了两个新的订单状态：

| Status 值 | 中文名称 | 英文名称 | 颜色 |
|-----------|---------|---------|------|
| `"6"` | 货到未取 | Arrived Not Picked Up | 橙色 (#fa8c16) |
| `"7"` | 未付try | Unpaid Try | 粉红色 (#eb2f96) |

## 完整状态列表

| Status 值 | 中文名称 | 英文名称 | 颜色 | 是否需要填写日期和操作人 |
|-----------|---------|---------|------|------------------------|
| `"0"` | 待处理 | Pending | 黄色 (#faad14) | ❌ (自动使用当前账号和时间) |
| `"1"` | 已发货 | Shipped | 蓝色 (#1890ff) | ✅ (需要用户选择) |
| `"2"` | 已完成 | Completed | 绿色 (#52c41a) | ✅ (需要用户选择) |
| `"3"` | 缺货 | Out of Stock | 红色 (#ff4d4f) | ❌ (自动使用当前账号和时间) |
| `"4"` | 损坏 | Damaged | 紫色 (#722ed1) | ❌ (自动使用当前账号和时间) |
| `"5"` | 作废 | Void | 灰色 (#8c8c8c) | ❌ (自动使用当前账号和时间) |
| `"6"` | 货到未取 | Arrived Not Picked Up | 橙色 (#fa8c16) | ✅ (需要用户选择) |
| `"7"` | 未付try | Unpaid Try | 粉红色 (#eb2f96) | ✅ (需要用户选择) |

## 操作人员和时间记录

### 功能说明

**需要用户选择的状态（1、2、6、7）：**
- 弹出抽屉让用户选择操作人和输入时间
- 操作人从预设的店员列表中选择：`['Sandy', 'Serene', 'Jewaa', 'Yen', 'Xiao Li', 'Qi Qi', 'Staff']`
- 时间格式：`YYYY-MM-DD HH:mm:ss`
- 默认值：当前登录用户名和当前时间

**不需要用户选择的状态（0、3、4、5）：**
- 直接确认，不弹出抽屉
- 自动使用当前登录用户名和当前时间

### 后端接收参数格式

```json
{
  "id": 123,
  "status": "1",
  "statusChangeUserId": 45,
  "statusChangeUserName": "Sandy",
  "statusChangeTime": "2026-05-11 16:30:45"
}
```

**字段说明：**
- `id`: 订单ID
- `status`: 订单状态（"0"-"7"）
- `statusChangeUserId`: 当前登录用户的ID（目前未使用，传当前账号ID）
- `statusChangeUserName`: 操作人名字（状态1、2、6、7由用户选择，其他状态自动使用当前账号名）
- `statusChangeTime`: 状态变更时间（状态1、2、6、7由用户输入，其他状态自动使用当前时间）

### 数据字段

```typescript
// OrderData 接口字段
statusChangeUserId?: number; // 状态变更操作人ID
statusChangeUserName?: string; // 状态变更操作人名字
statusChangeTime?: string; // 状态变更时间

// ModifyOrderRequest 接口字段
statusChangeUserId?: number; // 状态变更操作人ID
statusChangeUserName?: string; // 状态变更操作人名字
statusChangeTime?: string; // 状态变更时间 (格式: YYYY-MM-DD HH:mm:ss)
```

## 操作流程

### 需要填写日期和操作人的状态变更（1、2、6、7）

当用户点击以下操作时，会弹出抽屉：

1. **已发货** - 用户选择操作人和输入发货时间
2. **已完成** - 用户选择操作人和输入完成时间
3. **货到未取** - 用户选择操作人和输入到货时间
4. **未付try** - 用户选择操作人和输入时间

抽屉内容：
- 订单信息展示（订单号、颜色、尺寸、数量）
- 操作人下拉选择（从店员列表选择）
- 时间输入框（格式：YYYY-MM-DD HH:mm:ss）
- 默认值：当前登录用户名 + 当前时间

### 不需要填写日期和操作人的状态变更（0、3、4、5）

以下操作直接确认即可，自动使用当前账号名和当前时间：

1. **缺货** - 直接标记为缺货
2. **损坏** - 直接标记为损坏
3. **作废** - 直接作废订单
4. **重置状态** - 重置为待处理状态

## 代码修改位置

### 1. OrderList.tsx (订单管理)
- ✅ 添加店员列表常量 `salerList`
- ✅ 修改 `handleSentSubmit` 提交新的参数格式
- ✅ 修改 `handleStatusChangeWithDate` 设置默认值（当前用户名和当前时间）
- ✅ 修改 `handleStatusChange` 自动传递当前用户名和当前时间
- ✅ 修改 `handleResetStatus` 自动传递当前用户名和当前时间
- ✅ 修改 `handleVoid` 自动传递当前用户名和当前时间
- ✅ 更新抽屉表单，添加操作人选择和时间输入
- ✅ 修改表格列，使用 `statusChangeTime` 和 `statusChangeUserName`
- ✅ 修改移动端卡片，使用 `statusChangeTime` 和 `statusChangeUserName`

### 2. types.ts (类型定义)
- ✅ `OrderData` 接口添加新字段，保留旧字段兼容性
- ✅ `ModifyOrderRequest` 接口添加新字段，保留旧字段兼容性

## 用户界面变化

### 桌面端

1. **状态 1、2、6、7 的操作流程：**
   - 点击操作按钮
   - 弹出抽屉
   - 选择操作人（下拉选择）
   - 输入时间（文本输入，格式：YYYY-MM-DD HH:mm:ss）
   - 点击确认

2. **其他状态的操作流程：**
   - 点击操作按钮
   - 弹出确认对话框
   - 点击确认（自动使用当前账号名和当前时间）

3. **表格列显示：**
   - 状态日期列：只有状态 1、2、6、7 显示 `statusChangeTime`
   - 操作人列：只有状态 1、2、6、7 显示 `statusChangeUserName`

### 移动端

1. 卡片中显示状态日期和操作人（当状态为 1、2、6、7 时）
2. 操作流程与桌面端相同

## 数据流程

### 需要用户选择的状态（1、2、6、7）

```
用户点击状态变更按钮
    ↓
弹出抽屉
    ↓
表单默认填充：当前用户名 + 当前时间
    ↓
用户选择操作人（从店员列表）
    ↓
用户输入时间（YYYY-MM-DD HH:mm:ss）
    ↓
点击确认
    ↓
提交到后端: { id, status, statusChangeUserId, statusChangeUserName, statusChangeTime }
    ↓
后端保存订单状态、操作人和时间
    ↓
前端刷新列表
    ↓
表格/卡片显示时间和操作人
```

### 不需要用户选择的状态（0、3、4、5）

```
用户点击状态变更按钮
    ↓
弹出确认对话框
    ↓
点击确认
    ↓
前端自动获取：当前用户ID、当前用户名、当前时间
    ↓
提交到后端: { id, status, statusChangeUserId, statusChangeUserName, statusChangeTime }
    ↓
后端保存订单状态、操作人和时间
    ↓
前端刷新列表
```

## 店员列表

```typescript
const salerList = ['Sandy', 'Serene', 'Jewaa', 'Yen', 'Xiao Li', 'Qi Qi', 'Staff'];
```

## 测试建议

1. **测试状态 1、2、6、7 的操作流程**
   - 点击对应状态按钮
   - 确认弹出抽屉
   - 确认默认值正确（当前用户名和当前时间）
   - 选择不同的操作人
   - 修改时间
   - 提交并确认保存成功

2. **测试其他状态的操作流程**
   - 点击对应状态按钮
   - 确认弹出确认对话框（不是抽屉）
   - 点击确认
   - 确认自动使用当前账号名和当前时间

3. **测试表格显示**
   - 创建不同状态的订单
   - 确认只有状态 1、2、6、7 显示时间和操作人
   - 确认其他状态不显示时间和操作人

4. **测试不同用户操作**
   - 使用不同账号登录
   - 修改订单状态
   - 确认记录的操作人是选择的店员名字

5. **测试移动端**
   - 在移动设备上测试
   - 确认抽屉正常显示
   - 确认卡片中正确显示时间和操作人

## 后端需要的修改

后端需要：
1. 在订单表中添加以下字段：
   - `statusChangeUserId` (INT) - 状态变更操作人ID
   - `statusChangeUserName` (VARCHAR) - 状态变更操作人名字
   - `statusChangeTime` (DATETIME) - 状态变更时间
2. 在订单修改接口中接收这三个参数
3. 保存到数据库
4. 在查询订单时返回这三个字段
5. 保留旧字段 `pendingDate` 和 `operator` 以保持兼容性（可选）
