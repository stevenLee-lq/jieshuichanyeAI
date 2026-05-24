import React, { useMemo } from 'react';
import { ChevronRight } from 'lucide-react';
import {
  addDaysYmd,
  formatOutcomeApplicationFields,
  resolveOutcomeContactPhone,
  type OutcomeCategoryTone,
  type SupplyDemandOutcome,
} from './supplyDemandOutcomes';
import { cn } from './lib/utils';

function toneToTagClass(tone: OutcomeCategoryTone): string {
  switch (tone) {
    case 'green':
      return 'border-emerald-200 bg-emerald-50 text-emerald-800';
    case 'purple':
      return 'border-violet-200 bg-violet-50 text-violet-800';
    case 'blue':
      return 'border-cyan-200 bg-cyan-50 text-cyan-900';
    case 'sky':
      return 'border-sky-200 bg-sky-50 text-sky-900';
    case 'orange':
      return 'border-orange-200 bg-orange-50 text-orange-900';
    default:
      return 'border-gray-200 bg-gray-50 text-gray-800';
  }
}

function buildDetailBody(o: SupplyDemandOutcome): string {
  if (o.detailRichText?.trim()) return o.detailRichText.trim();
  return `${o.description}\n\n结合${o.province}区域用水与节水管理要求，本项目强调可落地、可验收、可量化。供方需在约定周期内完成方案澄清、试点验证与交付物归档；需方将组织联合评审并同步推进合同签订与现场实施。上述内容为演示文案，正式环境可由接口返回富文本。`;
}

function demoEmailFromPublisher(name: string): string {
  const slug = name.replace(/[^\da-zA-Z\u4e00-\u9fa5]+/g, '').slice(0, 10) || 'contact';
  return `${slug.toLowerCase()}@demo.org`;
}

export function SupplyDemandOutcomeDetailPage({
  outcome: o,
  onBack,
  revealContactPhone = false,
}: {
  outcome: SupplyDemandOutcome;
  onBack: () => void;
  /** 为 true 时在联系邮箱下方展示联系电话（由「与我联系」入口打开） */
  revealContactPhone?: boolean;
}) {
  const publisher = o.publisherDisplay ?? o.demander;
  const email = o.contactEmail ?? demoEmailFromPublisher(publisher);
  const contactPhoneDisplay = revealContactPhone ? resolveOutcomeContactPhone(o) : null;
  const location = o.locationLine ?? `${o.province}（演示地址）`;
  const deadline = o.deadline ?? '--';
  const brief = o.demandBriefLine ?? o.description;
  const budgetLine =
    o.budgetLine ??
    (o.amountDisplay.startsWith('需求金额')
      ? o.amountDisplay.replace(/^需求金额:\s*/, '预算: ')
      : `预算: ${o.amountDisplay}`);
  const detailBody = useMemo(() => buildDetailBody(o), [o]);

  const timeline = useMemo(() => {
    const ymdOk = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s);
    const ymd = ymdOk(o.publishedAt);
    const dockYmd = ymd ? addDaysYmd(o.publishedAt, 14) : '—';
    const doneYmd =
      o.achievedAt !== '--' ? o.achievedAt : ymd ? addDaysYmd(o.publishedAt, 45) : '—';
    const at = (d: string, hm: string) => (ymdOk(d) ? `${d} ${hm}` : d);
    return [
      { label: '发布需求', date: at(o.publishedAt, '09:00') },
      { label: '对接需求', date: at(dockYmd, '14:00') },
      { label: '合作达成', date: at(doneYmd, '18:00') },
    ];
  }, [o.publishedAt, o.achievedAt]);

  return (
    <div className="mx-auto max-w-[920px] px-4 py-6 sm:px-6 sm:py-8">
      <button
        type="button"
        onClick={onBack}
        className="group mb-6 flex items-center gap-2 text-sm font-black text-gray-600 transition hover:text-teal-600"
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white shadow-sm group-hover:border-teal-200 group-hover:bg-teal-50">
          <ChevronRight className="h-4 w-4 rotate-180" aria-hidden />
        </span>
        返回列表
      </button>

      <div className="rounded-xl border border-gray-200/90 bg-white p-5 shadow-sm shadow-teal-900/5 sm:p-8">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-black leading-snug text-gray-900 sm:text-2xl">{o.title}</h1>
            <div className="mt-3 flex flex-wrap gap-2">
              <span
                className={cn(
                  'rounded-md border px-2.5 py-1 text-xs font-black',
                  toneToTagClass(o.categoryTone)
                )}
              >
                行业应用 · {o.categoryLabel}
              </span>
              <span className="rounded-md border border-teal-200 bg-teal-50 px-2.5 py-1 text-xs font-black text-teal-800">
                {o.demandStatus ?? '可对接'}
              </span>
            </div>

            <dl className="mt-6 space-y-3 text-sm">
              <div className="flex flex-wrap gap-x-2 border-b border-gray-50 pb-2">
                <dt className="shrink-0 font-black text-gray-500">发布单位</dt>
                <dd className="min-w-0 flex-1 font-bold text-gray-900">{publisher}</dd>
              </div>
              <div className="flex flex-wrap gap-x-2 border-b border-gray-50 pb-2">
                <dt className="shrink-0 font-black text-gray-500">应用领域</dt>
                <dd className="min-w-0 flex-1 font-bold text-gray-900">{formatOutcomeApplicationFields(o)}</dd>
              </div>
              <div className="flex flex-wrap gap-x-2 border-b border-gray-50 pb-2">
                <dt className="shrink-0 font-black text-gray-500">联系邮箱</dt>
                <dd className="min-w-0 flex-1 break-all font-bold text-teal-600">{email}</dd>
              </div>
              {contactPhoneDisplay ? (
                <div className="flex flex-wrap gap-x-2 border-b border-gray-50 pb-2">
                  <dt className="shrink-0 font-black text-gray-500">手机号码</dt>
                  <dd className="min-w-0 flex-1 font-bold tabular-nums text-gray-900">{contactPhoneDisplay}</dd>
                </div>
              ) : null}
              <div className="flex flex-wrap gap-x-2 border-b border-gray-50 pb-2">
                <dt className="shrink-0 font-black text-gray-500">所在地</dt>
                <dd className="min-w-0 flex-1 font-bold text-gray-900">{location}</dd>
              </div>
              <div className="flex flex-wrap gap-x-2 border-b border-gray-50 pb-2">
                <dt className="shrink-0 font-black text-gray-500">发布时间</dt>
                <dd className="font-bold text-gray-900 tabular-nums">{o.publishedAt}</dd>
              </div>
              <div className="flex flex-wrap gap-x-2 border-b border-gray-50 pb-2">
                <dt className="shrink-0 font-black text-gray-500">截止时间</dt>
                <dd className="font-bold text-gray-900 tabular-nums">{deadline}</dd>
              </div>
              <div className="flex flex-wrap gap-x-2 pb-1">
                <dt className="shrink-0 font-black text-gray-500">需求简介</dt>
                <dd className="min-w-0 flex-1 font-medium leading-relaxed text-gray-700">{brief}</dd>
              </div>
            </dl>
          </div>

          <div className="mx-auto w-full max-w-[280px] shrink-0 lg:mx-0">
            <div className="overflow-hidden rounded-xl border border-gray-100 bg-gray-50 shadow-inner">
              <img src={o.image} alt="" className="aspect-[4/3] w-full object-cover" />
            </div>
            <p className="mt-3 text-center text-sm font-black text-amber-700">{budgetLine}</p>
          </div>
        </div>
      </div>

      <section className="mt-6 rounded-xl border border-gray-200/90 bg-white p-5 shadow-sm shadow-teal-900/5 sm:p-8">
        <h2 className="flex items-center gap-2 border-l-4 border-teal-600 pl-3 text-lg font-black text-gray-900">需求详情</h2>
        <div className="mt-4 whitespace-pre-line text-sm font-medium leading-relaxed text-gray-700">{detailBody}</div>
      </section>

      <section className="mt-6 rounded-xl border border-gray-200/90 bg-white p-5 shadow-sm shadow-teal-900/5 sm:p-8">
        <h2 className="flex items-center gap-2 border-l-4 border-teal-600 pl-3 text-lg font-black text-gray-900">合作历程</h2>
        <div className="relative mt-6 px-2 sm:px-6">
          <div
            className="absolute left-[12%] right-[12%] top-[26px] hidden h-0.5 bg-teal-100 sm:block"
            aria-hidden
          />
          <div className="grid grid-cols-3 gap-2 sm:gap-4">
            {timeline.map((step) => (
              <div key={step.label} className="relative flex flex-col items-center text-center">
                <span className="mb-2 rounded-full bg-teal-50 px-2 py-1 text-[11px] font-black text-teal-700 tabular-nums sm:text-xs">
                  {step.date}
                </span>
                <div className="relative z-[1] h-3 w-3 shrink-0 rounded-full border-2 border-teal-600 bg-white shadow-[0_0_0_4px_white]" />
                <span className="mt-2 text-[11px] font-black leading-tight text-gray-800 sm:text-xs">{step.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
