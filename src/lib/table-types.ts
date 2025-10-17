import { ReactNode } from 'react';
import { FormInstance } from 'antd';

// 操作项类型
export interface TableAction {
  key: string;
  label: string;
  icon?: ReactNode;
  onClick: (record: any) => void;
  danger?: boolean;
  disabled?: boolean;
}

// 表格列配置
export interface TableColumn {
  title: string;
  dataIndex: string;
  key: string;
  width?: number;
  render?: (value: any, record: any, index: number) => ReactNode;
  sorter?: boolean;
  filters?: Array<{ text: string; value: any }>;
  onFilter?: (value: any, record: any) => boolean;
}

// 高级搜索配置
export interface AdvancedSearchConfig {
  visible: boolean;
  onToggle: () => void;
  form: FormInstance;
  children: ReactNode;
  onSearch?: (values: any) => void;
  onReset?: () => void;
}

// 新增/编辑配置
export interface DrawerConfig {
  title: string;
  visible: boolean;
  onClose: () => void;
  onSubmit: (values: any) => void;
  form: FormInstance;
  children: ReactNode;
  loading?: boolean;
}

// 删除配置
export interface DeleteConfig {
  title: string;
  content: string;
  visible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

// 通用Table组件Props
export interface UniversalTableProps {
  // 基础配置
  columns: TableColumn[];
  dataSource: any[];
  loading?: boolean;
  rowKey: string;
  
  // 分页配置
  pagination?: {
    current?: number;
    pageSize?: number;
    total?: number;
    onChange?: (page: number, pageSize: number) => void;
    showSizeChanger?: boolean;
    showQuickJumper?: boolean;
    showTotal?: (total: number, range: [number, number]) => string;
  };
  
  // 高级搜索
  advancedSearch?: AdvancedSearchConfig;
  
  // 新增功能
  onAdd?: () => void;
  addButtonText?: string;
  addButtonIcon?: ReactNode;
  showAddButton?: boolean;
  
  // 编辑功能
  editDrawer?: DrawerConfig;
  
  // 删除功能
  deleteModal?: DeleteConfig;
  
  // 操作栏
  actions?: TableAction[];
  maxVisibleActions?: number; // 最多显示的操作数量，超出显示...
  
  // 其他配置
  scroll?: { x?: number; y?: number };
  size?: 'small' | 'middle' | 'large';
  bordered?: boolean;
  className?: string;
}
