import React, { useMemo } from 'react';
import { HorizontalCascaderPanel } from './HorizontalCascaderPanel';
import { IndustrySearchCascader } from './IndustrySearchCascader';
import type { IndustryLevelFields } from './enterpriseFormShared';
import {
  REGION_CASCADER_OPTIONS,
  WATER_USER_TYPE_CASCADER_OPTIONS,
  entityTypeFromPath,
  entityTypePathFromParts,
  formatRegionFromParts,
  parseRegionText,
  regionPartsFromPath,
  regionPathFromParts,
} from './waterUserFormShared';

export function RegionCascaderField({
  label = '所属区域',
  required,
  region,
  onRegionChange,
  disabled,
  className,
}: {
  label?: string;
  required?: boolean;
  region: string;
  onRegionChange: (region: string) => void;
  disabled?: boolean;
  className?: string;
}) {
  const parts = useMemo(() => parseRegionText(region), [region]);
  const valuePath = useMemo(
    () => regionPathFromParts(parts.regionProvince, parts.regionCity, parts.regionDistrict),
    [parts.regionProvince, parts.regionCity, parts.regionDistrict]
  );

  return (
    <HorizontalCascaderPanel
      label={label}
      required={required}
      placeholder="请选择"
      options={REGION_CASCADER_OPTIONS}
      valuePath={valuePath}
      onChange={(path) => {
        const next = regionPartsFromPath(path);
        onRegionChange(formatRegionFromParts(next.regionProvince, next.regionCity, next.regionDistrict));
      }}
      disabled={disabled}
      className={className}
    />
  );
}

export function EntityTypeCascaderField({
  label = '用户类型',
  required,
  userType,
  subType,
  subLevel3,
  onChange,
  disabled,
  className,
}: {
  label?: string;
  required?: boolean;
  userType: string;
  subType: string;
  subLevel3: string;
  onChange: (next: { userType: string; subType: string; subLevel3: string }) => void;
  disabled?: boolean;
  className?: string;
}) {
  const valuePath = useMemo(
    () => entityTypePathFromParts(userType, subType, subLevel3),
    [userType, subType, subLevel3]
  );

  return (
    <HorizontalCascaderPanel
      label={label}
      required={required}
      placeholder="请选择"
      options={WATER_USER_TYPE_CASCADER_OPTIONS}
      valuePath={valuePath}
      onChange={(path) => onChange(entityTypeFromPath(path))}
      disabled={disabled}
      className={className}
    />
  );
}

export function IndustryCascaderField({
  label = '所属行业',
  required,
  value,
  onChange,
  disabled,
  className,
}: {
  label?: string;
  required?: boolean;
  value: IndustryLevelFields;
  onChange: (next: IndustryLevelFields) => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <IndustrySearchCascader
      label={label}
      required={required}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={className}
    />
  );
}
