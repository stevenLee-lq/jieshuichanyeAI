import React, { useEffect, useState } from 'react';
import { cn } from './lib/utils';
import { CATEGORIES_HIERARCHY } from './data';
import { WATER_SAVING_SUB_CATEGORIES } from './productWorkbenchCatalog';
import { WORKBENCH_POLICY_TECH_APPLICATION_OPTIONS } from './workbenchPolicyTech';

const selectClass =
  'w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-bold text-gray-900 outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-500/30';

const applicationOptions = WORKBENCH_POLICY_TECH_APPLICATION_OPTIONS.map((o) => ({ id: o, label: o }));

export type PortalTagsValue = {
  applicationFields: string[];
  waterSavingCategorySubIds: string[];
};

function TagToggleGroup({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: readonly { id: string; label: string }[];
  value: string[];
  onChange: (next: string[]) => void;
}) {
  const toggle = (id: string) => {
    onChange(value.includes(id) ? value.filter((x) => x !== id) : [...value, id]);
  };
  return (
    <div>
      <p className="text-xs font-black text-gray-700">{label}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {options.map((opt) => {
          const active = value.includes(opt.id);
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => toggle(opt.id)}
              className={cn(
                'rounded-full border px-2.5 py-1 text-[11px] font-black transition',
                active
                  ? 'border-teal-600 bg-teal-50 text-teal-800'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-teal-200'
              )}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function resolveWaterSavingTopId(subIds: string[]): string {
  if (subIds.length > 0) {
    const hit = WATER_SAVING_SUB_CATEGORIES.find((s) => s.subId === subIds[0]);
    if (hit) return hit.topId;
  }
  return CATEGORIES_HIERARCHY[0]?.id ?? '';
}

/** 门户内容后台通用标签区：应用领域（必选）+ 节水产业分类（选填级联） */
export function WorkbenchPortalTagsFields({
  value,
  onChange,
  syncKey,
}: {
  value: PortalTagsValue;
  onChange: (next: PortalTagsValue) => void;
  /** 编辑/新建切换时同步一级分类 */
  syncKey?: string;
}) {
  const [waterTopId, setWaterTopId] = useState(() => resolveWaterSavingTopId(value.waterSavingCategorySubIds));

  useEffect(() => {
    setWaterTopId(resolveWaterSavingTopId(value.waterSavingCategorySubIds));
  }, [syncKey, value.waterSavingCategorySubIds]);

  const waterSavingSubOptions = WATER_SAVING_SUB_CATEGORIES.filter((s) => s.topId === waterTopId).map((s) => ({
    id: s.subId,
    label: s.subName,
  }));

  const waterSubId = value.waterSavingCategorySubIds[0] ?? '';

  const handleWaterSavingTopChange = (topId: string) => {
    setWaterTopId(topId);
    onChange({ ...value, waterSavingCategorySubIds: [] });
  };

  const handleWaterSavingSubChange = (subId: string) => {
    onChange({ ...value, waterSavingCategorySubIds: subId ? [subId] : [] });
  };

  return (
    <div className="space-y-4 rounded-xl border border-gray-200 bg-gray-50/80 p-4">
      <p className="text-xs font-black text-gray-800">标签</p>
      <TagToggleGroup
        label="应用领域（可多选） *"
        options={applicationOptions}
        value={value.applicationFields}
        onChange={(applicationFields) => onChange({ ...value, applicationFields })}
      />
      <div className="block text-xs font-black text-gray-700">
        节水产业分类
        <div className="mt-1.5 grid gap-3 sm:grid-cols-2">
          <select
            className={selectClass}
            value={waterTopId}
            onChange={(e) => handleWaterSavingTopChange(e.target.value)}
            aria-label="节水产业分类一级"
          >
            {CATEGORIES_HIERARCHY.map((top) => (
              <option key={top.id} value={top.id}>
                {top.name}
              </option>
            ))}
          </select>
          <select
            className={cn(
              selectClass,
              'disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400'
            )}
            value={waterSubId}
            onChange={(e) => handleWaterSavingSubChange(e.target.value)}
            disabled={waterSavingSubOptions.length === 0}
            aria-label="节水产业分类二级"
          >
            <option value="">请选择二级分类</option>
            {waterSavingSubOptions.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
