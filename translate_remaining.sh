#!/bin/bash

# 批量翻译脚本 - 处理剩余的member和bill文件

echo "开始批量翻译..."

# Member文件 - 添加useTranslation导入
for file in src/app/components/pages/member/{AllMemberPurchaseHistory,MemberTopUpHistory}.tsx; do
  if [ -f "$file" ]; then
    echo "处理 $file..."
    # 检查是否已经导入
    if ! grep -q "useTranslation" "$file"; then
      # 在import后添加useTranslation
      sed -i '' "s/import moment from 'moment';/import moment from 'moment';\nimport { useTranslation } from 'react-i18next';/" "$file"
      # 在组件开始添加const { t } = useTranslation();
      sed -i '' '/export default function/a\
  const { t } = useTranslation();
' "$file"
    fi
  fi
done

# Bill文件 - 添加useTranslation导入
for file in src/app/components/pages/bill/*.tsx; do
  if [ -f "$file" ] && [ "$(basename $file)" != "index.tsx" ]; then
    echo "处理 $file..."
    if ! grep -q "useTranslation" "$file"; then
      sed -i '' "s/import moment from 'moment';/import moment from 'moment';\nimport { useTranslation } from 'react-i18next';/" "$file"
      sed -i '' '/export default function/a\
  const { t } = useTranslation();
' "$file"
    fi
  fi
done

echo "导入完成！现在需要手动替换中文文本..."
