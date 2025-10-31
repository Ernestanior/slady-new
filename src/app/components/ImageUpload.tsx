'use client';

import React from 'react';
import { Upload, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd';

interface ImageUploadProps {
  changePic: (fileList: UploadFile[]) => void;
  maxCount?: number;
  value?: UploadFile[];
}

const ImageUpload: React.FC<ImageUploadProps> = ({ changePic, maxCount, value = [] }) => {
  const handleChange: UploadProps['onChange'] = ({ fileList: newFileList }) => {
    changePic(newFileList);
  };

  const beforeUpload = (file: File) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('只能上传图片文件!');
    }
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error('图片大小不能超过5MB!');
    }
    return false; // 阻止自动上传，我们手动处理
  };

  const uploadButton = (
    <div>
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>上传</div>
    </div>
  );

  return (
    <Upload
      listType="picture-card"
      fileList={value}
      onChange={handleChange}
      beforeUpload={beforeUpload}
      maxCount={maxCount}
      multiple={true}
      accept="image/*"
    >
      {(!maxCount || value.length < maxCount) && uploadButton}
    </Upload>
  );
};

export default ImageUpload;

