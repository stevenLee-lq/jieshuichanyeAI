import type { ReactNode } from 'react';
import { ChevronRight } from 'lucide-react';
import { getPortalNewsById } from './portalNewsStore';
import { getPortalPolicyTechById } from './portalPolicyTechStore';
import { RichTextContent } from './WorkbenchRichTextEditor';
import {
  formatPolicyTechTagLabels,
  formatWaterSavingCategoryDisplay,
  type PolicyTechKind,
  type WorkbenchPolicyTechRecord,
} from './workbenchPolicyTech';
import { formatNewsTagLabels, type WorkbenchNewsRecord } from './workbenchNews';

export type PolicyInfoDetailKind = 'news' | 'policy' | 'tech';

const KIND_LABEL: Record<PolicyInfoDetailKind, string> = {
  news: '新闻资讯',
  policy: '政策公开',
  tech: '技术标准',
};

function DetailBackButton({ onBack }: { onBack: () => void }) {
  return (
    <button
      type="button"
      onClick={onBack}
      className="group flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-black text-gray-600 shadow-sm transition hover:border-teal-200 hover:bg-teal-50 hover:text-teal-700"
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-100 bg-gray-50 group-hover:border-teal-200 group-hover:bg-white">
        <ChevronRight className="h-4 w-4 rotate-180" aria-hidden />
      </span>
      返回
    </button>
  );
}

function DetailShell({
  onBack,
  badge,
  children,
}: {
  onBack: () => void;
  badge: string;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto max-w-[920px] px-4 py-6 sm:px-6 sm:py-8">
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <DetailBackButton onBack={onBack} />
        <span className="rounded-full border border-teal-100 bg-teal-50 px-3 py-1 text-[11px] font-black text-teal-800">
          {badge}
        </span>
      </div>
      {children}
    </div>
  );
}

function MissingDetail({ onBack }: { onBack: () => void }) {
  return (
    <div className="mx-auto max-w-[920px] px-4 py-6 sm:px-6 sm:py-8">
      <DetailBackButton onBack={onBack} />
      <p className="mt-6 text-sm font-bold text-gray-500">内容不存在或已下架，请返回列表重试。</p>
    </div>
  );
}

function NewsDetail({ row, badge, onBack }: { row: WorkbenchNewsRecord; badge: string; onBack: () => void }) {
  return (
    <DetailShell onBack={onBack} badge={badge}>
      <article className="overflow-hidden rounded-xl border border-gray-200/90 bg-white shadow-sm shadow-teal-900/5">
        {row.image ? (
          <div className="flex max-h-72 items-center justify-center border-b border-gray-100 bg-gray-50 p-4 sm:max-h-80">
            <img
              src={row.image}
              alt=""
              referrerPolicy="no-referrer"
              className="max-h-full max-w-full object-contain"
            />
          </div>
        ) : null}
        <div className="p-6 sm:p-10">
          <h1 className="text-xl font-black leading-snug tracking-tight text-gray-900 sm:text-2xl">{row.title}</h1>
          {formatNewsTagLabels(row).length > 0 ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {formatNewsTagLabels(row).map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-teal-100 bg-teal-50 px-3 py-0.5 text-[11px] font-black text-teal-800"
                >
                  {tag}
                </span>
              ))}
            </div>
          ) : null}
          <p className="mt-4 text-xs font-bold text-gray-400">
            {row.publisher} · {row.publishedAt}
          </p>
          <div className="mt-8 border-t border-gray-100 pt-8 text-sm leading-[1.9] text-gray-800 sm:text-[15px]">
            <RichTextContent html={row.content} />
          </div>
        </div>
      </article>
    </DetailShell>
  );
}

function MetaRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="grid grid-cols-1 border-b border-gray-100 last:border-b-0 sm:grid-cols-[minmax(0,10.5rem)_1fr]">
      <dt className="border-gray-100 bg-teal-50/40 px-4 py-2.5 font-black text-gray-600 sm:border-r">{label}</dt>
      <dd className="bg-white px-4 py-2.5 font-bold leading-relaxed text-gray-900">{value}</dd>
    </div>
  );
}

function PolicyTechDetail({
  row,
  kind,
  badge,
  onBack,
}: {
  row: WorkbenchPolicyTechRecord;
  kind: PolicyTechKind;
  badge: string;
  onBack: () => void;
}) {
  const tags = formatPolicyTechTagLabels(row);
  const waterSaving = formatWaterSavingCategoryDisplay(row);

  return (
    <DetailShell onBack={onBack} badge={badge}>
      <article className="rounded-xl border border-gray-200/90 bg-white p-6 shadow-sm shadow-teal-900/5 sm:p-10">
        <h1 className="text-center text-xl font-black leading-snug tracking-tight text-gray-900 sm:text-2xl">
          {row.title}
        </h1>
        {tags.length > 0 ? (
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-teal-100 bg-teal-50 px-3 py-0.5 text-[11px] font-black text-teal-800"
              >
                {tag}
              </span>
            ))}
          </div>
        ) : null}

        <dl className="mt-8 overflow-hidden rounded-lg border border-gray-200 text-sm sm:mt-10">
          {kind === 'policy' ? (
            <MetaRow label="发布单位" value={row.publisher || '—'} />
          ) : (
            <MetaRow label="标准号" value={row.code || '—'} />
          )}
          <MetaRow label="发布日期" value={row.time || '—'} />
          {waterSaving && waterSaving !== '—' ? <MetaRow label="节水产业分类" value={waterSaving} /> : null}
        </dl>

        <div className="mt-8 border-t border-gray-100 pt-8 text-sm leading-[1.9] text-gray-800 sm:text-[15px] sm:leading-[1.92]">
          <RichTextContent html={row.content} className="text-justify" />
        </div>
      </article>
    </DetailShell>
  );
}

export function PortalPolicyInfoDetailPage({
  kind,
  id,
  onBack,
}: {
  kind: PolicyInfoDetailKind;
  id: string;
  onBack: () => void;
}) {
  const badge = KIND_LABEL[kind];

  if (kind === 'news') {
    const row = getPortalNewsById(id);
    if (!row) return <MissingDetail onBack={onBack} />;
    return <NewsDetail row={row} badge={badge} onBack={onBack} />;
  }

  const ptKind: PolicyTechKind = kind === 'policy' ? 'policy' : 'tech';
  const row = getPortalPolicyTechById(id);
  if (!row || row.kind !== ptKind) return <MissingDetail onBack={onBack} />;
  return <PolicyTechDetail row={row} kind={ptKind} badge={badge} onBack={onBack} />;
}
