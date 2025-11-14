'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Button, Divider, Form, Input, InputNumber, InputRef, notification, Select, Space, Tag, Card } from 'antd';
import { MinusCircleOutlined, PlusOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { PrintReceiptItem, PrintReceiptPayment, PrintReceiptRequest, DesignListRequest } from '@/lib/types';
import { receipt, designService } from '@/lib/api';
import moment from 'moment';
import { saler, shops } from '@/app/components/pages/bill/PrintReceipt';

interface PrintReceiptProps {
  onBackToList: () => void;
}

const calcFinalPrice = (price: number = 0, discountPercent: number = 0, discount: number = 0, qty: number = 1) => {
  let final = (price || 0) * qty;
  if (discountPercent) {
    final = final * (1 - discountPercent / 100);
  }
  if (discount) {
    final = final - discount;
  }
  return parseFloat(final.toFixed(2));
};


let index = 0;

export default function PrintReceipt({ onBackToList }: PrintReceiptProps) {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [payment, setPayment] = useState('');
  const [shop, setShops] = useState(2);
  const inputRef = useRef<InputRef>(null);
  
  // 使用Form.useWatch监听表单字段变化
  const items = Form.useWatch('item', form) as Array<any> | undefined;
  const paymentList = Form.useWatch('paymentList', form) as Array<any> | undefined;
  
  const [newPayment, setNewPayment] = useState(['Cash', 'Card', 'Transfer']);

  // refs 持久化状态（不会触发重渲染）
  const addRef = useRef<((defaultValue?: any, insertIndex?: number) => void) | null>(null);
  const bufferRef = useRef<string>('');
  const lastTimeRef = useRef<number>(Date.now());

  const totalPrice = useMemo(() => {
    if (!Array.isArray(items) || items.length === 0) {
      return 0;
    }
    return items.reduce((sum, item) => {
      // 添加安全检查，确保item存在且有所需属性
      if (!item || typeof item !== 'object') {
        return sum;
      }
      const finalPrice = calcFinalPrice(
        item.price || 0,
        item.discountPercent || 0,
        item.discount || 0,
        item.qty || 1
      );
      return sum + finalPrice;
    }, 0);
  }, [items]);

  // 计算已支付金额
  const paidAmount = useMemo(() => {
    if (!Array.isArray(paymentList) || paymentList.length === 0) {
      return 0;
    }
    const result = paymentList.reduce((sum: number, payment: any) => {
      if (!payment || typeof payment !== 'object') {
        return sum;
      }
      const amount = Number(payment.amount) || 0;
      return sum + amount;
    }, 0);
    return Number(result) || 0;
  }, [paymentList]);

  // 计算剩余金额
  const remainingAmount = totalPrice - paidAmount;

  // 安全的数字格式化函数
  const formatCurrency = (value: number) => {
    const num = Number(value) || 0;
    return num.toFixed(2);
  };

  // 添加商品 - 现在由Form.List内部的按钮直接调用add()方法
  const addItem = useCallback(() => {
    // 这个函数现在主要用于初始化，实际添加由Form.List内部处理
    console.log('addItem called');
  }, []);

  // 删除商品
  const removeItem = useCallback((index: number) => {
    const currentItems = form.getFieldValue('item') || [];
    const newItems = currentItems.filter((_: any, i: number) => i !== index);
    form.setFieldValue('item', newItems);
  }, [form]);

  // 处理商品代码输入
  const handleCodeChange = useCallback(async (value: string, index: number) => {
    if (!value) return;
    
    try {
      const res = await designService.getDesignDetail({ design: value });
      if (res.code === 200 && res.data && res.data.length > 0) {
        const design = res.data[0];
        form.setFieldValue(['item', index, 'price'], design.salePrice);
        form.setFieldValue(['item', index, 'finalPrice'], design.salePrice);
      }
    } catch (error) {
      console.error('获取商品信息失败:', error);
    }
  }, [form]);

  // 计算最终价格
  const handlePriceChange = useCallback((index: number) => {
    const item = form.getFieldValue(['item', index]);
    if (item && typeof item === 'object') {
      const finalPrice = calcFinalPrice(
        item.price || 0,
        item.discountPercent || 0,
        item.discount || 0,
        item.qty || 1
      );
      form.setFieldValue(['item', index, 'finalPrice'], finalPrice);
    }
  }, [form]);

  // 打印账单
  const handlePrint = async () => {
    try {
      const values = await form.validateFields();
      const params: PrintReceiptRequest = {
        ...values,
        gst: 0,
        totalPrice,
        address: values.store === 1 ? 'Raffles City (#03-29B)' : 'Raffles Place (#04-24/25)',
        cashier: values.saler,
        item: values.item.map((item: any) => ({
          ...item,
          finalPrice: calcFinalPrice(item.price || 0, item.discountPercent || 0, item.discount || 0, item.qty || 1)
        })),
        paymentList: values.paymentList || []
      };
      
      await receipt.print(params);
      notification.success({ message: t('printReceiptSuccess') });
      form.resetFields();
    } catch (error) {
      console.error('打印账单失败:', error);
      notification.error({ message: t('printReceiptFailed') });
    }
  };

  // 初始化
  useEffect(() => {
    // 初始化时设置默认值，与网页版保持一致
    form.setFieldsValue({
      shop: 2, // 默认选择店铺2
      saler: saler[0], 
      item: [], 
      paymentList: []
    });
  }, [form]);

  return (
    <div className="p-4">
      {/* 头部 */}
      <Card className="mb-4" style={{ borderRadius: 12 }}>
        <div className="flex items-center justify-between mb-4">
          <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={onBackToList}
            className="flex items-center"
          >
            {t('backToList')}
          </Button>
          <h2 className="text-lg font-bold text-gray-900">{t('printReceipt')}</h2>
        </div>
      </Card>

      {/* 表单内容 */}
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          shop: 1,
          saler: saler[0],
          date: moment()
        }}
      >
        {/* 基本信息 */}
        <Card className="mb-4" style={{ borderRadius: 12 }}>
          <div className="grid grid-cols-1">
            <Form.Item
              name="store"
              label="店铺"
              rules={[{ required: true, message: '请选择店铺' }]}
              initialValue={2}
            >
              <Select 
                placeholder="请选择店铺"
              >
                {shops.slice(1).map((shopName, index) => (
                  <Select.Option key={index + 1} value={index + 1}>
                    {shopName}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="saler"
              label={t('cashier')}
              rules={[{ required: true, message: t('pleaseSelectCashier') }]}
            >
              <Select placeholder={t('pleaseSelectCashier')}>
                {saler.map(name => (
                  <Select.Option key={name} value={name}>{name}</Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="date"
              label="日期"
              rules={[{ required: true, message: '请选择日期' }]}
            >
              <Input value={moment().format('YYYY-MM-DD')} disabled />
            </Form.Item>
          </div>
        </Card>

        {/* 商品列表 */}
        <Card style={{marginTop:12,marginBottom:12, borderRadius: 12 }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">{t('itemList')}</h3>
          </div>

          <Form.List name="item">
          {(fields, { add, remove }) => {
            console.log('Form.List渲染，fields数量:', fields.length);
            addRef.current = add;
            return (
              <>
                <Form.Item>
                  {t('item')}：
                  <Button
                    type="dashed"
                    onClick={() => {
                      console.log('添加商品按钮被点击');
                      add();
                    }}
                    icon={<PlusOutlined />}
                    style={{ marginLeft: 8 }}
                  >
                    {t('addItem')}
                  </Button>
                </Form.Item>

                {fields.map(({ key, name, ...restField }) => {
                  const cur = (items && items[name]) || {};
                  const qty = Number(cur?.qty ?? 0);
                  const price = Number(cur?.price ?? 0);
                  const discountPercent = Number(cur?.discountPercent ?? 0);
                  const discount = Number(cur?.discount ?? 0);
                  const finalPrice = calcFinalPrice(price, discountPercent, discount, qty);
                  return (
                    <Card key={key} className="border border-gray-200 mb-4" style={{ borderRadius: 8 }}>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-600">{t('item')} #{name + 1}</span>
                          <Button
                            type="link"
                            danger
                            icon={<MinusCircleOutlined />}
                            onClick={() => remove(name)}
                            size="small"
                          >
                            删除
                          </Button>
                        </div>

                    <div className="grid grid-cols-1 gap-3">
                      <Form.Item
                        {...restField}
                        name={[name, 'code']}
                        label={t('designCode')}
                        rules={[{ required: true, message: t('pleaseEnterDesignCode') }]}
                      >
                        <div className="flex gap-2">
                          <Input
                            placeholder={t('pleaseEnterDesignCode')}
                            onChange={(e) => handleCodeChange(e.target.value, name)}
                            style={{ flex: 1 }}
                          />
                          <Button 
                            onClick={async () => {
                              const code = form.getFieldValue(['item', name, 'code']);
                              if (!code) {
                                notification.warning({ message: t('pleaseEnterDesignCodeFirst') });
                                return;
                              }
                              try {
                                const res = await designService.getDesignDetail({ design: code });
                                if (res.code === 200 && res.data && res.data.length > 0) {
                                  const salePrice = res.data[0].salePrice;
                                  const currentItems = form.getFieldValue(['item']) || [];
                                  const updatedItems = currentItems.map((item: any, index: number) => 
                                    index === name ? { ...item, price: parseFloat(salePrice) } : item
                                  );
                                  form.setFieldsValue({ item: updatedItems });
                                  notification.success({ message: t('priceAutoFilled') });
                                } else {
                                  notification.error({ message: t('productNotFoundWhenDetectingPrice') });
                                }
                              } catch (error) {
                                console.error('获取价格失败:', error);
                                notification.error({ message: t('getPriceFailed') });
                              }
                            }}
                          >
                            {t('detectPrice')}
                          </Button>
                        </div>
                      </Form.Item>

                      <div className="grid grid-cols-2 gap-3">
                        <Form.Item
                          {...restField}
                          name={[name, 'price']}
                          label="价格"
                          rules={[{ required: true, message: '请输入价格' }]}
                        >
                          <InputNumber 
                            placeholder="价格"
                            style={{ width: '100%' }}
                            onChange={() => handlePriceChange(name)}
                          />
                        </Form.Item>

                        <Form.Item
                          {...restField}
                          name={[name, 'qty']}
                          label="数量"
                          rules={[{ required: true, message: '请输入数量' }]}
                          initialValue={1}
                        >
                          <InputNumber 
                            placeholder="数量"
                            style={{ width: '100%' }}
                            min={1}
                            onChange={() => handlePriceChange(name)}
                          />
                        </Form.Item>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <Form.Item
                          {...restField}
                          name={[name, 'discountPercent']}
                          label="折扣百分比"
                        >
                          <InputNumber 
                            placeholder="折扣%"
                            style={{ width: '100%' }}
                            min={0}
                            max={100}
                            onChange={() => handlePriceChange(name)}
                          />
                        </Form.Item>

                        <Form.Item
                          {...restField}
                          name={[name, 'discount']}
                          label="折扣金额"
                        >
                          <InputNumber 
                            placeholder="折扣金额"
                            style={{ width: '100%' }}
                            min={0}
                            onChange={() => handlePriceChange(name)}
                          />
                        </Form.Item>
                      </div>

                      <Form.Item
                        {...restField}
                        name={[name, 'finalPrice']}
                        label="最终价格"
                      >
                        <InputNumber 
                          placeholder="最终价格"
                          style={{ width: '100%' }}
                          disabled
                        />
                      </Form.Item>
                      
                      {/* 显示计算结果 */}
                      <div className="text-center p-2 bg-gray-50 rounded">
                        <span className="font-bold text-blue-600">最终价格: ${finalPrice.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </Card>
                  );
                })}
              </>
            );
          }}
          </Form.List>
        </Card>

        {/* 支付方式列表 */}
        <Card style={{marginBottom:12, borderRadius: 12 }}>
          <h3 className="text-lg font-bold text-gray-900 mb-4">{t('paymentMethod')}</h3>
          
          <Form.List name="paymentList">
            {(fields, { add, remove }) => (
              <>
                <Form.Item>
                  {t('paymentMethod')}：
                  <Button 
                    type="dashed" 
                    onClick={() => {
                      console.log('添加支付方式按钮被点击');
                      console.log('items:', items);
                      console.log('paymentList:', paymentList);
                      
                      if (items && items.length > 0) {
                        try {
                          const price = items.reduce((prev: number, current: any) => {
                            console.log('计算商品价格，current:', current);
                            if (!current || typeof current !== 'object') {
                              return prev;
                            }
                            const { price, discount, discountPercent, qty } = current;
                            const finalPrice = calcFinalPrice(price || 0, discountPercent || 0, discount || 0, qty || 1);
                            console.log('商品最终价格:', finalPrice);
                            return prev + finalPrice;
                          }, 0);
                          
                          const pay = (paymentList || []).reduce((prev: number, current: any) => {
                            if (!current || typeof current !== 'object') {
                              return prev;
                            }
                            const { amount } = current;
                            return prev + (amount || 0);
                          }, 0);
                          
                          console.log('总价格:', price, '已支付:', pay);
                          add({ payment: '', amount: (price - pay).toFixed(2) });
                        } catch (error) {
                          console.error('添加支付方式时出错:', error);
                          notification.error({ message: "添加支付方式时出错: " + (error instanceof Error ? error.message : String(error)) });
                        }
                      } else {
                        notification.error({ message: "请先添加商品再添加支付方式" });
                      }
                    }} 
                    icon={<PlusOutlined />}
                    style={{ marginLeft: 8 }}
                  >
                    添加支付方式
                  </Button>
                </Form.Item>
                
                {fields.map(({ key, name, ...restField }) => (
                  <Card key={key} className="border border-gray-200 mb-3" style={{ borderRadius: 8 }}>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-600">支付方式 #{name + 1}</span>
                        <Button
                          type="link"
                          danger
                          icon={<MinusCircleOutlined />}
                          onClick={() => remove(name)}
                          size="small"
                        >
                          删除
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-1 gap-3">
                        <Form.Item
                          {...restField}
                          name={[name, 'payment']}
                          label="支付方式"
                          rules={[{ required: true, message: '请选择支付方式' }]}
                        >
                          <Select
                            placeholder="请选择支付方式"
                            dropdownRender={(menu) => (
                              <>
                                {menu}
                                <Divider style={{ margin: '8px 0' }} />
                                <div className="p-2">
                                  <Input
                                    placeholder="请输入新的支付方式"
                                    value={payment}
                                    onChange={(e) => setPayment(e.target.value)}
                                    className="mb-2"
                                  />
                                  <Button 
                                    type="text" 
                                    icon={<PlusOutlined />} 
                                    onClick={() => {
                                      if (payment) {
                                        setNewPayment([...newPayment, payment]);
                                        setPayment('');
                                      }
                                    }}
                                    className="w-full"
                                  >
                                    添加新支付方式
                                  </Button>
                                </div>
                              </>
                            )}
                            options={newPayment.map((item) => ({ label: item, value: item }))}
                          />
                        </Form.Item>

                        <Form.Item
                          {...restField}
                          name={[name, 'amount']}
                          label="支付金额"
                          rules={[{ required: true, message: '请输入支付金额' }]}
                        >
                          <InputNumber 
                            placeholder="支付金额" 
                            min={0} 
                            style={{ width: '100%' }}
                          />
                        </Form.Item>
                      </div>
                    </div>
                  </Card>
                ))}
              </>
            )}
          </Form.List>
        </Card>

        {/* 总金额和操作 */}
        <Card style={{ borderRadius: 12 }}>
          <div className="space-y-4">
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold text-blue-600">
                {t('totalAmount')}: ${formatCurrency(totalPrice)}
              </div>
              {paidAmount > 0 && (
                <div className="text-lg text-green-600">
                  已支付: ${formatCurrency(paidAmount)}
                </div>
              )}
              {remainingAmount !== 0 && (
                <div className={`text-lg font-bold ${
                  remainingAmount > 0 ? 'text-red-600' : 'text-green-600'
                }`}>
                  {remainingAmount > 0 ? '剩余' : '找零'}: ${formatCurrency(Math.abs(remainingAmount))}
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Button 
                type="primary" 
                onClick={handlePrint}
                className="flex-1"
                size="large"
                disabled={Math.abs(remainingAmount) > 0.01}
              >
                打印账单
              </Button>
            </div>
            
            {Math.abs(remainingAmount) > 0.01 && (
              <div className="text-center text-red-500 text-sm">
                {remainingAmount > 0 ? t('pleaseCompletePaymentBeforePrint') : t('paymentExceedsTotalAmount')}
              </div>
            )}
          </div>
        </Card>
      </Form>
    </div>
  );
}
