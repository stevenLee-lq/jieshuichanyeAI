import React from 'react';
import { APPLICATION_FIELD_OPTIONS, type ApplicationFieldOption } from './data';
import { cn } from './lib/utils';

/** 工作台 / 注册表单：应用领域可选项（不含「全部」） */
export const WORKBENCH_APPLICATION_FIELD_OPTIONS = APPLICATION_FIELD_OPTIONS;

const LEGACY_APPLICATION_FIELD_MAP: Record<string, ApplicationFieldOption> = {
  工业: '工业节水',
  农业: '农业节水',
  通用: '通用节水',
  城镇生活: '城镇生活节水',
  城镇供水: '城镇生活节水',
  循环冷却: '工业节水',
  园区与厂网: '工业节水',
  纯水制备与回用: '工业节水',
  非常规水: '非常规水开发利用',
  公共机构节水: '城镇生活节水',
  设备改造: '工业节水',
  节水咨询: '通用节水',
  '工业、服务业': '工业节水',
  服务业: '通用节水',
};

/** 将历史简称/别名归一为标准应用领域 */
export function normalizeApplicationFieldValue(raw: string): ApplicationFieldOption | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  if ((APPLICATION_FIELD_OPTIONS as readonly string[]).includes(trimmed)) {
    return trimmed as ApplicationFieldOption;
  }
  return LEGACY_APPLICATION_FIELD_MAP[trimmed] ?? null;
}

/** 多选/拼接字符串归一化并去重 */
export function normalizeApplicationFields(raw: readonly string[]): ApplicationFieldOption[] {
  const seen = new Set<ApplicationFieldOption>();
  const out: ApplicationFieldOption[] = [];
  for (const item of raw) {
    const parts = item.includes('、') || item.includes(',') || item.includes('，')
      ? item.split(/[、,，/|]/)
      : [item];
    for (const part of parts) {
      const normalized = normalizeApplicationFieldValue(part);
      if (normalized && !seen.has(normalized)) {
        seen.add(normalized);
        out.push(normalized);
      }
    }
  }
  return out;
}

export function formatApplicationFieldsList(fields: readonly string[]): string {
  const normalized = normalizeApplicationFields(fields);
  return normalized.length > 0 ? normalized.join('、') : '—';
}

export function ApplicationFieldTagGroup({
  value,
  onChange,
  label,
  required = false,
}: {
  value: string[];
  onChange: (next: string[]) => void;
  label?: string;
  required?: boolean;
}) {
  const toggle = (id: string) => {
    onChange(value.includes(id) ? value.filter((x) => x !== id) : [...value, id]);
  };
  return (
    <div>
      {label ? (
        <p className="text-xs font-black text-gray-700">
          {label}
          {required ? <span className="text-red-500"> *</span> : null}
        </p>
      ) : null}
      <div className={cn('flex flex-wrap gap-2', label && 'mt-2')}>
        {WORKBENCH_APPLICATION_FIELD_OPTIONS.map((opt) => {
          const active = value.includes(opt);
          return (
            <button
              key={opt}
              type="button"
              onClick={() => toggle(opt)}
              className={cn(
                'rounded-full border px-2.5 py-1 text-[11px] font-black transition',
                active
                  ? 'border-teal-600 bg-teal-50 text-teal-800'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-teal-200'
              )}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}
