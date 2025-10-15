// 用户基本信息响应
export interface UserBasicResponse {
  msg: string;
  code: number;
  data: User;
}

// 用户相关类型定义
export interface User {
  id: number;
  name: string;
  type: string;
  deleted: number;
  local: string;
  createDate: string;
}

export interface UserListResponse {
  msg: string;
  code: number;
  data: {
    number: number;
    size: number;
    totalPages: number;
    numberOfElements: number;
    totalElements: number;
    content: User[];
  };
}

export interface CreateUserRequest {
  name: string;
  type: string;
  password: string;
}

export interface ModifyUserRequest {
  id: number;
  name: string;
  type: string;
}


// 表单相关类型
export interface UserFormData {
  name: string;
  type: string;
  password?: string;
}

// 分页相关类型
export interface PaginationParams {
  page: number;
  size: number;
}

// 搜索分页参数
export interface SearchPageParams {
  desc: number;
  page: number;
  pageSize: number;
  sort: string;
}

// 用户列表请求参数
export interface UserListRequest {
  searchPage: SearchPageParams;
  keyWord: string;
}

// 商品设计相关类型
export interface DesignItem {
  id: number;
  type: string;
  design: string;
  salePrice: string;
  stock: number;
  previewPhoto: string;
}

export interface DesignListResponse {
  msg: string;
  code: number;
  data: {
    number: number;
    size: number;
    totalPages: number;
    numberOfElements: number;
    totalElements: number;
    content: DesignItem[];
  };
}

export interface DesignListRequest {
  typeList: string[];
  design: string;
  searchPage: SearchPageParams;
  hasStock?: number; // 是否有库存筛选
}

// 创建商品请求参数
export interface CreateDesignRequest {
  design: string;
  type: string;
  color: string[];
  size: string[];
  fabricList: Array<{ fabric: string; percent?: number }>;
  purchasePrice: string;
  salePrice: string;
  remark?: string;
  fabric: string;
  photos: string;
  previewPhoto: string;
}

// 创建Item请求参数
export interface CreateItemRequest {
  designId: number;
  warehouseName: string[];
  [key: string]: any;
}

// 爆/冷款商品数据类型
export interface HotColdItem {
  id: number;
  hot: number;
  type: string;
  design: string;
  salePrice: string;
  stock: number;
  previewPhoto: string;
}

export interface HotColdListResponse {
  msg: string;
  code: number;
  data: {
    number: number;
    size: number;
    totalPages: number;
    numberOfElements: number;
    totalElements: number;
    content: HotColdItem[];
  };
}

export interface HotColdListRequest {
  type: string;
  searchPage: SearchPageParams;
}

// 库存修改记录相关类型
export interface InventoryRecordItem {
  id: number;
  userId: number;
  userName: string;
  uri: string;
  body: string;
  createDate: string;
}

export interface InventoryRecordResponse {
  msg: string;
  code: number;
  data: {
    number: number;
    size: number;
    totalPages: number;
    numberOfElements: number;
    totalElements: number;
    content: InventoryRecordItem[];
  };
}

export interface InventoryRecordRequest {
  searchPage: SearchPageParams;
  uri: string;
  body?: string;
  userName?: string;
  startDate?: string;
  endDate?: string;
}

// 会员管理相关类型
export interface MemberData {
  id: number;
  name: string;
  phone: string;
  voucherNumber: number;
  balance: number;
  membershipPackageTotal: number;
  remark: string;
  registrationDate: string;
}

export interface MemberListResponse {
  msg: string;
  code: number;
  data: {
    number: number;
    size: number;
    totalPages: number;
    numberOfElements: number;
    totalElements: number;
    content: MemberData[];
  };
}

export interface MemberListRequest {
  searchPage: SearchPageParams;
  name?: string;
  phone?: string;
}

export interface ModifyMemberRequest {
  id: number;
  name: string;
  phone: string;
  registrationDate: string;
  voucherNumber: number;
  remark: string;
}

export interface TopUpMemberRequest {
  id: number;
  saler: string;
  balance: number;
  remark: string;
}

// 会员购买记录相关类型
export interface PurchaseItem {
  designCode: string;
  price: number;
}

export interface MemberPurchaseRecord {
  id: number;
  type: number;
  saler: string;
  memberId: number;
  designString: string;
  designList: PurchaseItem[];
  sum: number;
  memberRemainingAmount: number;
  purchaseDate: string;
  createDate: string;
  remark: string;
  memberName: string;
  memberPhone: string;
  voucherNumber: number;
}

export interface MemberPurchaseResponse {
  msg: string;
  code: number;
  data: {
    number: number;
    size: number;
    totalPages: number;
    numberOfElements: number;
    totalElements: number;
    content: MemberPurchaseRecord[];
  };
}

export interface MemberPurchaseRequest {
  memberId: number;
  searchPage: SearchPageParams;
}

// 新增会员相关类型
export interface CreateMemberRequest {
  name: string;
  phone: string;
  registrationDate: string;
  voucherNumber: number;
  remark: string;
  balance: number;
  membershipPackageTotal: number;
}

// 新增购买记录相关类型
export interface CreatePurchaseRecordRequest {
  purchaseDate: string;
  designs: Array<{
    designCode: string;
    price: number;
  }>;
  saler: string;
  remark: string;
  memberId: number;
  sum: string;
}

// 会员购买记录查询相关类型
export interface MemberPurchaseHistoryRequest {
  searchPage: SearchPageParams;
  refund?: number;
  types?: number[];
  memberName?: string;
  voucherNumber?: string;
}

export interface MemberPurchaseHistoryResponse {
  msg: string;
  code: number;
  data: {
    number: number;
    size: number;
    totalPages: number;
    numberOfElements: number;
    totalElements: number;
    content: MemberPurchaseRecord[];
  };
}

// 员工操作历史记录相关类型
export interface EmployeeOperationLog {
  id: number;
  userId: number;
  userName: string;
  uri: string;
  body: string;
  createDate: string;
}

export interface EmployeeOperationLogResponse {
  msg: string;
  code: number;
  data: {
    number: number;
    size: number;
    totalPages: number;
    numberOfElements: number;
    totalElements: number;
    content: EmployeeOperationLog[];
  };
}

export interface EmployeeOperationLogRequest {
  searchPage: SearchPageParams;
  userName?: string;
  uri?: string;
  startDate?: string;
  endDate?: string;
}

// 账单管理相关类型
export interface ReceiptItem {
  qty: number;
  code: string;
  price: number;
  discount: number;
  finalPrice: number;
  discountPercent: number;
}

export interface ReceiptData {
  id: number;
  refNo: string;
  itemList: ReceiptItem[] | string;
  receiptDate: string;
  cashier: string;
}

export interface ReceiptListResponse {
  msg: string;
  code: number;
  data: {
    number: number;
    size: number;
    totalPages: number;
    numberOfElements: number;
    totalElements: number;
    content: ReceiptData[];
  };
}

export interface ReceiptListRequest {
  searchPage: SearchPageParams;
  store: number;
  refNo?: string;
  startDate?: string;
  endDate?: string;
}

// 打印账单相关类型
export interface PrintReceiptItem {
  code: string;
  qty: number;
  price: number;
  discountPercent: number;
  discount: number;
  finalPrice: number;
}

export interface PrintReceiptPayment {
  payment: string;
  amount: number;
}

export interface PrintReceiptRequest {
  shop: string;
  cashier: string;
  item: PrintReceiptItem[];
  paymentList: PrintReceiptPayment[];
  gst: number;
  totalPrice: number;
  store: number;
  address: string;
}

// 打印标签相关类型
export interface PrintLabelRequest {
  code: string;
  color: string;
  size: string;
  salePrice: number;
}

// 打印每日结单相关类型
export interface PrintDailyReportRequest {
  store: number;
  saler: string;
  date: string;
  shop: string;
}

// 每日销售情况相关类型
export interface DailySaleRequest {
  startDateTime: string;
  endDateTime: string;
  store: number;
}

export interface DailySaleData {
  date: string;
  cashier: string;
  totalPrice: number;
}

export interface DailySaleResponse {
  msg: string;
  code: number;
  data: DailySaleData[];
}

// 现金进出相关类型
export interface CashData {
  id: number;
  amount: number;
  createDate: string;
  remark: string;
  type?: number;
  store?: number;
}

export interface CashListResponse {
  msg: string;
  code: number;
  data: {
    number: number;
    size: number;
    totalPages: number;
    numberOfElements: number;
    totalElements: number;
    content: CashData[];
  };
}

export interface CashListRequest {
  searchPage: SearchPageParams;
  store: number;
  startDateTime?: string;
  endDateTime?: string;
}

export interface CreateCashRequest {
  type: number; // 1: Cash In, 2: Cash Out
  amount: number;
  remark: string;
  store: number;
}

// 现金抽屉余额相关类型
export interface CashDrawerData {
  id: number;
  amount: number;
  type: number; // 1: Opening Balance, 2: Closing Balance
  createDate: string;
  remark?: string;
  store?: number;
}

export interface CashDrawerListResponse {
  msg: string;
  code: number;
  data: {
    number: number;
    size: number;
    totalPages: number;
    numberOfElements: number;
    totalElements: number;
    content: CashDrawerData[];
  };
}

export interface CashDrawerListRequest {
  searchPage: SearchPageParams;
  store: number;
  startDateTime?: string;
  endDateTime?: string;
}

export interface CreateCashDrawerRequest {
  type: number; // 1: Opening Balance, 2: Closing Balance
  amount: number;
  store: number;
  date: string;
}

// 商品类型选项
export const typeList: any[] = [
  { value: 'AL', label: 'A型裙' },
  { value: 'DR', label: 'DR连衣裙' },
  { value: 'TB', label: 'TB上衣' },
  { value: 'SK', label: 'SK半裙' },
  { value: 'ST', label: 'ST短裤' },
  { value: 'PT', label: 'PT裤子' },
  { value: 'GO', label: 'GO晚礼服' },
  { value: 'JK', label: 'JK外套' },
  { value: 'JS', label: 'JS连体裤' },
  { value: 'BT', label: 'BT皮带' },
  { value: 'SH', label: 'SH鞋子' },
  { value: 'SE', label: 'SE套装' },
  { value: 'SI', label: 'SI真丝' },
  { value: 'AC', label: 'AC饰品' },
  { value: 'BG', label: 'BG包包' },
  { value: 'CDJ', label: 'CDJ穿戴甲' },
  { value: 'SO', label: "SO特价" },
  { value: 'CL', label: 'Classic经典款' },
  { value: 'IN', label: 'IN内搭' },
  { value: 'BP', label: 'BP护肤' },
  { value: 'XL', label: "L & XL加价大码" },
];

// 颜色选项
export const colorList = ['Khaki', 'Grey', 'Red', 'Orange', 'Yellow', 'Green', 'Blue', 'Black', 'Stripes', 'Grid', 'Purple', 'White', 'Pink', 'Beige', 'Brown', 'Champagne', 'Navy', 'Sky', 'Mustard', 'Mint', 'Peach', 'Cream', 'Charcoal', 'Silver', 'Gold'];

// 面料选项
export const fabricList = ['Knits', 'Denim', 'Silk', 'Polyester', 'Lace', 'Chiffon', 'Cotton', 'Linen', 'Tweed fabric', 'Stretch fabrics', 'leather', 'PVC'];

// 尺码选项
export const sizeList = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL', 'One Size', '32', '33', '34', '35', '36', '37', '38', '39', '40', '41', '42', '43', '44'];

// 仓库枚举
export enum WAREHOUSE {
  SLADY = 'Slady一店',
  SL = 'SL二店',
  LIVE = 'Live直播间'
}

// 商品详情类型
export interface DesignDetail {
  id: number;
  design: string;
  type: string;
  hot: number;
  fabric: string;
  photos: string;
  stock: number;
  salePrice: string;
  purchasePrice: string;
  previewPhoto: string;
  color: string[];
  size: string[];
  createDate: string;
}

export interface DesignDetailResponse {
  msg: string;
  code: number;
  data: DesignDetail;
}

// 修改商品请求参数
export interface ModifyDesignRequest {
  id: number;
  design: string;
  type: string;
  purchasePrice: string;
  salePrice: string;
  remark?: string;
}

// Item相关类型定义
export interface ItemData {
  id: number;
  designId: number;
  color: string;
  size: string;
  stock: number;
  warehouseName: string;
  createDate: string;
}

// 创建订单请求参数
export interface CreateOrderRequest {
  itemId: number;
  amount: number;
  type: number;
  remark: string;
  paymentStatus: number;
  status: string;
}

// 创建商品请求参数
export interface CreateItemRequest {
  designId: number;
  warehouseName: string[];
  color: string[];
  size: string[];
  stock: number;
}

// 订单数据
export interface OrderData {
  id: number;
  itemId: number;
  previewPhoto: string;
  design: string;
  warehouseName: string;
  designCode: string;
  salePrice: string;
  color: string;
  size: string;
  amount: number;
  date: string;
  remark: string;
  status: string;
  paymentStatus: number;
  createDate: string;
  pendingDate?: string;
}

// 订单分页请求参数
export interface OrderPageRequest {
  areaType: number;
  warehouseName: string;
  searchPage: SearchPageParams;
  status: string[];
  design?: string;
  remark?: string;
  startDate?: string;
  endDate?: string;
}

// 订单分页响应
export interface OrderPageResponse {
  number: number;
  size: number;
  totalPages: number;
  numberOfElements: number;
  totalElements: number;
  content: OrderData[];
}

// 修改订单请求参数
export interface ModifyOrderRequest {
  size?: string;
  color?: string;
  remark?: string;
  amount?: number;
  id: number;
  pendingDate?: string;
  status?: string;
}
