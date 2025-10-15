'use client';

import { useTranslation } from 'react-i18next';
import EmployeeManagement from './pages/employee';
import HotColdItems from './pages/hotCold';
import InventoryRecords from './pages/inventory';
import EmployeeHistory from './pages/employee/history';
import MemberManagement from './pages/member';
import BillManagement from './pages/bill';
import Design from './pages/design/index';
import Order from './pages/order';
import OrderHistory from './pages/orderHistory/index';

interface ContentProps {
  activePage: string;
  sidebarCollapsed?: boolean;
}

export default function Content({ activePage, sidebarCollapsed = false }: ContentProps) {
  const { t } = useTranslation();

  const renderPage = () => {
    switch (activePage) {
      case 'employeeManagement':
        return <EmployeeManagement />;
      case 'designManagement':
        return <Design />;
      case 'orderManagement':
        return <Order />;
      case 'orderHistory':
        return <OrderHistory />;
      case 'hotColdItems':
        return <HotColdItems />;
      case 'inventoryRecords':
        return <InventoryRecords />;
      case 'employeeHistory':
        return <EmployeeHistory />;
      case 'memberManagement':
        return <MemberManagement />;
      case 'billManagement':
        return <BillManagement />;
      default:
        return <EmployeeManagement />;
    }
  };

  return (
    <main className={`flex-1 p-6 transition-all duration-300 ease-in-out min-w-[800px] w-full ${sidebarCollapsed ? 'ml-0' : ''}`}>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 min-h-[calc(100vh-120px)]">
        {renderPage()}
      </div>
    </main>
  );
}
