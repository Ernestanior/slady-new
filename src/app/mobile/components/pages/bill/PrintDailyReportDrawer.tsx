'use client';

import React, { useState } from 'react';
import { Button, Form, Select, DatePicker, notification, Drawer, Card } from 'antd';
import { useTranslation } from 'react-i18next';
import { PrintDailyReportRequest } from '@/lib/types';
import { printService } from '@/lib/api';
import moment from 'moment';

interface PrintDailyReportDrawerProps {
  visible: boolean;
  onClose: () => void;
}

const counter = [
  { label: 'Slady Fashion', value: 1 },
  { label: 'SL Studio', value: 2 }
];

const saler = ["Serene", "Staff", "Xiao Li", "Yen"];

export default function PrintDailyReportDrawer({ visible, onClose }: PrintDailyReportDrawerProps) {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // 打印每日结单
  const onPrint = async () => {
    try {
      const data = form.getFieldsValue();
      setLoading(true);
      
      const params: PrintDailyReportRequest = {
        ...data,
        shop: "Slady Studio Pte. Ltd.",
        date: moment(data.date).format('YYYY-MM-DD')
      };
      
      await printService.printDailyReport(params);
      notification.success({ message: '打印每日结单成功' });
      form.resetFields();
      onClose();
    } catch (error) {
      console.error('打印每日结单失败:', error);
      notification.error({ message: '打印每日结单失败' });
    } finally {
      setLoading(false);
    }
  };

  // 重置表单
  const onReset = () => {
    form.resetFields();
  };

  return (
    <Drawer
      title={t('printDailyReport')}
      placement="bottom"
      onClose={onClose}
      open={visible}
      height="70%"
      footer={
        <div className="flex gap-2 p-4">
          <Button onClick={onClose} className="flex-1">
            {t('cancel')}
          </Button>
          <Button onClick={onReset} className="flex-1">
            {t('reset')}
          </Button>
          <Button type="primary" loading={loading} onClick={onPrint} className="flex-1">
            {t('confirmPrint')}
          </Button>
        </div>
      }
    >
      <div className="p-4">
        <Card style={{ borderRadius: 12 }}>
          <Form
            form={form}
            layout="vertical"
            initialValues={{
              store: 2,
              saler: saler[0]
            }}
          >
            <Form.Item
              name="store"
              label={t('store')}
              rules={[{ required: true, message: '请选择店铺' }]}
            >
              <Select placeholder={t('pleaseSelectStore')}>
                {counter.map(item => (
                  <Select.Option key={item.value} value={item.value}>
                    {item.label}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="saler"
              label={t('cashier')}
              rules={[{ required: true, message: '请选择收银员' }]}
            >
              <Select placeholder={t('pleaseSelectCashier')}>
                {saler.map(item => (
                  <Select.Option key={item} value={item}>{item}</Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="date"
              label={t('date')}
              rules={[{ required: true, message: '请选择日期' }]}
            >
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
          </Form>
        </Card>
      </div>
    </Drawer>
  );
}
