'use client';

import React, { useState, useCallback } from 'react';
import { Button, Form, Input, notification, Select, Drawer } from 'antd';
import { useTranslation } from 'react-i18next';
import { PrintLabelRequest } from '@/lib/types';
import { printService, designService } from '@/lib/api';
import { colorList, sizeList } from '@/lib/types';

interface PrintLabelDrawerProps {
  visible: boolean;
  onClose: () => void;
}

export default function PrintLabelDrawer({ visible, onClose }: PrintLabelDrawerProps) {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // 获取价格
  const getPrice = useCallback(async () => {
    console.log('aaa');
    
    const data = form.getFieldsValue();
    if (data.code) {
      try {
        const res = await designService.getDesignDetail({ design: data.code });
        console.log(res.data);

        if (res.code === 200 && res.data && res.data.length > 0) {
          
          form.setFieldsValue({ salePrice: res.data[0].salePrice });
        }
      } catch (error) {
        console.error('获取价格失败:', error);
        notification.error({ message: '获取价格失败' });
      }
    }
  }, [form]);

  // 打印标签
  const onPrint = async () => {
    try {
      const data = form.getFieldsValue();
      const { code, color, size, salePrice } = data;
      
      if (code && color && size && salePrice) {
        setLoading(true);
        const params: PrintLabelRequest = {
          code,
          color,
          size,
          salePrice: parseFloat(salePrice)
        };
        
        await printService.printLabel(params);
        notification.success({ message: '打印标签成功' });
        form.resetFields();
        onClose();
      } else {
        notification.error({ message: '请填完整' });
      }
    } catch (error) {
      console.error('打印标签失败:', error);
      notification.error({ message: '打印标签失败' });
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
      title={t('printLabel')}
      placement="right"
      onClose={onClose}
      open={visible}
      width={400}
      footer={
        <div style={{ textAlign: 'right' }}>
          <Button onClick={onClose} style={{ marginRight: 8 }}>{t('cancel')}</Button>
          <Button onClick={onReset} style={{ marginRight: 8 }}>{t('reset')}</Button>
          <Button type="primary" loading={loading} onClick={onPrint}>{t('confirmPrint')}</Button>
        </div>
      }
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          color: colorList[0],
          size: sizeList[0]
        }}
      >
        <Form.Item
          name="code"
          label={t('designCode')}
          rules={[{ required: true, message: '请输入商品代码' }]}
        >
          <Input placeholder={t('pleaseEnterDesignCode')} />
        </Form.Item>

        <Form.Item
          name="color"
          label={t('color')}
          rules={[{ required: true, message: '请选择颜色' }]}
        >
          <Select placeholder={t('pleaseSelectColor')}>
            {colorList.map(color => (
              <Select.Option key={color} value={color}>{color}</Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="size"
          label={t('size')}
          rules={[{ required: true, message: '请选择尺寸' }]}
        >
          <Select placeholder={t('pleaseSelectSize')}>
            {sizeList.map(size => (
              <Select.Option key={size} value={size}>{size}</Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item>
          <Button onClick={getPrice} style={{ marginBottom: 16 }}>
            检测价格
          </Button>
        </Form.Item>

        <Form.Item
          name="salePrice"
          label={t('salePrice')}
          rules={[{ required: true, message: '请输入价格' }]}
        >
          <Input placeholder={t('pleaseEnterPrice')} type="number" />
        </Form.Item>
      </Form>
    </Drawer>
  );
}
