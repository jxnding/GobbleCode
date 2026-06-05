const INTERACTIVE =
  "button, a[href], input, select, textarea, [role='button'], [role='tab'], [role='menuitem']";

const BOX_CLASS_HINT =
  /\b(rounded|border|card|panel|surface|modal|dialog|section|aside|main|header|footer|container)\b/;

const HINT_CLASS_PREFIX = "hint-";

/** Tailwind / layout utilities — not useful as debug identifiers. */
const UTILITY_PATTERNS: RegExp[] = [
  /^-?(m[trblxy]?|p[trblxy]?|space-[xy]|gap)-/,
  /^-?(w|h|min-w|min-h|max-w|max-h|size)-/,
  /^(flex|inline-flex|grid|inline-grid|block|inline-block|inline|hidden|contents)$/,
  /^(flex-|grid-|col-|row-|auto-cols-|auto-rows-|grid-cols-|grid-rows-)/,
  /^(items-|justify-|content-|self-|place-|order-|grow|shrink|basis-)/,
  /^(static|fixed|absolute|relative|sticky|inset-)/,
  /^-?(top|left|right|bottom|start|end)-/,
  /^z-/,
  /^opacity-/,
  /^overflow-/,
  /^(text-|font-|leading-|tracking-|whitespace-|break-|line-clamp-)/,
  /^(uppercase|lowercase|capitalize|truncate|italic|underline|line-through)$/,
  /^(bg-|from-|to-|via-|fill-|stroke-)/,
  /^(border|ring|divide|outline|rounded)/,
  /^(shadow|drop-shadow)/,
  /^(transition|duration-|ease-|delay-|animate-)/,
  /^(cursor-|select-|pointer-events-|resize|appearance)/,
  /^(sr-only|not-sr-only|antialiased)$/,
  /^(hover|focus|active|disabled|group|peer|dark|sm|md|lg|xl|2xl):/,
  /^\[/,
];

export function getClassString(el: HTMLElement): string {
  if (typeof el.className === "string") return el.className.trim();
  if (el.classList?.length) return [...el.classList].join(" ");
  return "";
}

export function isUtilityClass(className: string): boolean {
  if (className.startsWith(HINT_CLASS_PREFIX)) return false;
  if (className.includes("[") || className.includes("var(--")) return true;
  return UTILITY_PATTERNS.some((pattern) => pattern.test(className));
}

export function getHintClasses(el: HTMLElement): string[] {
  return [...el.classList].filter((c) => c.startsWith(HINT_CLASS_PREFIX));
}

export function getSemanticClasses(el: HTMLElement): string[] {
  return [...el.classList].filter((c) => !isUtilityClass(c));
}

function findNearestHintClass(el: HTMLElement | null): string | null {
  let cur = el;
  while (cur && cur !== document.documentElement) {
    const hints = getHintClasses(cur);
    if (hints.length > 0) return hints[0]!;
    cur = cur.parentElement;
  }
  return null;
}

function tagName(el: HTMLElement): string {
  return el.tagName.toLowerCase();
}

function slugify(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
}

function getVisibleText(el: HTMLElement): string {
  if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
    return el.placeholder || el.name || el.type;
  }
  const text = el.textContent?.replace(/\s+/g, " ").trim() ?? "";
  if (!text || text.length > 48) return "";
  return text;
}

function childDescriptor(el: HTMLElement): string {
  const own = getHintClasses(el);
  if (own.length > 0) return own[0]!;
  const text = getVisibleText(el);
  if (text) return `${tagName(el)}.${slugify(text)}`;
  return tagName(el);
}

export function resolveHintElement(target: EventTarget | null): HTMLElement | null {
  if (!(target instanceof HTMLElement)) return null;
  if (target.closest("[data-no-hint]")) return null;

  let el: HTMLElement | null = target;
  while (el && el !== document.documentElement) {
    if (el.closest("[data-no-hint]")) return null;

    if (getHintClasses(el).length > 0) return el;
    if (el.hasAttribute("data-hint")) return el;
    if (el.id) return el;

    if (el.matches(INTERACTIVE)) return el;

    const classes = getClassString(el);
    const semantic = getSemanticClasses(el);
    if (
      el.hasAttribute("data-hint") ||
      semantic.length > 0 ||
      (classes && BOX_CLASS_HINT.test(classes))
    ) {
      return el;
    }

    el = el.parentElement;
  }

  return null;
}

export function getHintLabel(el: HTMLElement): string {
  const hintClasses = getHintClasses(el);
  if (hintClasses.length > 0) return hintClasses.join(" ");

  const dataHint = el.getAttribute("data-hint");
  if (dataHint) return dataHint;

  if (el.id) return el.id;

  const aria = el.getAttribute("aria-label");
  if (aria) return aria;

  const text = getVisibleText(el);
  if (text) return `${tagName(el)}.${slugify(text)}`;

  const semantic = getSemanticClasses(el);
  if (semantic.length > 0) return semantic.join(" ");

  const parentHint = findNearestHintClass(el.parentElement);
  if (parentHint) return `${parentHint} › ${childDescriptor(el)}`;

  return tagName(el);
}
