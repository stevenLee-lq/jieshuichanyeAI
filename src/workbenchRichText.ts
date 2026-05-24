/** 去除 HTML 标签，用于校验富文本是否为空 */
export function stripRichTextHtml(html: string): string {
  if (typeof document !== 'undefined') {
    const el = document.createElement('div');
    el.innerHTML = html;
    return (el.textContent ?? el.innerText ?? '').replace(/\u00a0/g, ' ').trim();
  }
  return html
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .trim();
}

export function isRichTextEmpty(html: string): boolean {
  return !stripRichTextHtml(html);
}

/** 门户列表摘要：优先取纯文本前 N 字 */
export function richTextExcerpt(html: string, maxLen = 160): string {
  const plain = stripRichTextHtml(html);
  if (plain.length <= maxLen) return plain;
  return `${plain.slice(0, maxLen)}…`;
}
