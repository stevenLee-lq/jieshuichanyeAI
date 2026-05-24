import React from 'react';
import { IndustryCascaderField } from './SharedCascadeFormFields';
import type { IndustryLevelFields } from './enterpriseFormShared';

type EnterpriseIndustryCascadeFieldsProps = {
  value: IndustryLevelFields;
  onChange: (next: IndustryLevelFields) => void;
  required?: boolean;
  hint?: string;
  /** @deprecated 已统一为搜索级联，保留参数兼容旧调用 */
  selectClass?: string;
};

/** 所属行业：与用水户主体注册一致的搜索 + 逐级选择 */
export function EnterpriseIndustryCascadeFields({
  value,
  onChange,
  required,
}: EnterpriseIndustryCascadeFieldsProps) {
  return (
    <IndustryCascaderField label="所属行业" required={required} value={value} onChange={onChange} />
  );
}
