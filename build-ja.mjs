/*
 * Prerender the Japanese pages.
 *
 * The site ships English HTML and swaps in Japanese at runtime from a `T`
 * dictionary keyed by data-i18n. That works for visitors but not for crawlers:
 * GPTBot, ClaudeBot and friends do not run the script, so every /ja/ URL used
 * to serve English text. This applies T.ja at build time and writes real
 * Japanese HTML under ja/, using the same rules the runtime uses:
 *
 *   el.innerHTML = T.ja[key]                for [data-i18n]
 *   el.placeholder = T.ja[key]              for [data-i18n-placeholder]
 *
 * Run:  node build-ja.mjs
 */

import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import vm from "node:vm";

const PAGES = ["", "crm", "web", "ads", "recovery", "about", "contact", "terms", "privacy"];
const ORIGIN = "https://hanjo.ai";

/*
 * Titles and descriptions live in <head> attributes, not in data-i18n content,
 * so the runtime never translated them and the dictionary has no keys for them
 * (except ads and recovery, which carry their own ja.page_title). Without these
 * the Japanese pages would surface English titles and snippets in search.
 */
const HEAD_JA = {
  "": {
    title: "hanjo · ロサンゼルスの日英グロースパートナー",
    description: "ロサンゼルスを拠点に、日本語と英語で中小企業の集客とリピートを支えます。広告、サイト・ECサイト制作、メール・SMS、予約の取りこぼし回復。30分の無料相談を受付中。",
  },
  crm: {
    title: "hanjo CRM · メール & SMSマーケティング · ロサンゼルス",
    description: "Shopifyで販売するD2Cブランド向けのメール・SMS運用。コピーからデザイン、自動フローの構築まで一貫して対応し、初回購入者をリピーターに変えます。",
  },
  web: {
    title: "hanjo Web · ホームページ・ECサイト制作 · ロサンゼルス",
    description: "日本語と英語のホームページ、ランディングページ、Shopifyストア。構成・コピー・デザイン・実装まで一貫対応。テンプレートは使いません。Shopifyパートナー。",
  },
  ads: {
    description: "hanjo Adsは、広告プラットフォームが本来受け取れない成果データを届け、実際に購入・予約・再来するお客様に配信を集中させます。",
  },
  recovery: {
    description: "予約フォームの再構築と、SMS・メールの自動フォローで、取りこぼした予約を売上に戻します。サロン・スパ・クリニック向け。初期費用も月額費用もない成果報酬型。",
  },
  about: {
    title: "hanjoについて · ロサンゼルス",
    description: "ロサンゼルスを拠点に、日本語と英語で活動するグロースパートナー、hanjoについて。代表は中山ケイ。",
  },
  contact: {
    title: "お問い合わせ · hanjo · ロサンゼルス",
    description: "事業のことをお聞かせください。30分の無料相談を、日本語でも英語でも承ります。",
  },
  terms: {
    title: "利用規約 · hanjo · ロサンゼルス",
    description: "hanjo.ai ウェブサイトの利用規約。",
  },
  privacy: {
    title: "プライバシーポリシー · hanjo · ロサンゼルス",
    description: "hanjo.ai ウェブサイトのプライバシーポリシー。",
  },
};

/* ── extract the T dictionary by evaluating just that declaration ── */
function extractDict(html, file) {
  const start = html.search(/\b(?:const|var|let)\s+T\s*=\s*\{/);
  if (start === -1) throw new Error(`${file}: no T dictionary found`);
  const braceStart = html.indexOf("{", start);
  let depth = 0, i = braceStart, inStr = null, esc = false;
  for (; i < html.length; i++) {
    const c = html[i];
    if (inStr) {
      if (esc) esc = false;
      else if (c === "\\") esc = true;
      else if (c === inStr) inStr = null;
      continue;
    }
    if (c === "'" || c === '"' || c === "`") inStr = c;
    else if (c === "{") depth++;
    else if (c === "}" && --depth === 0) { i++; break; }
  }
  const literal = html.slice(braceStart, i);
  return vm.runInNewContext(`(${literal})`);
}

/* ── find the close tag matching an already-open tag, honouring nesting ── */
function matchingClose(html, tag, from) {
  const open = new RegExp(`<${tag}\\b`, "gi");
  const close = new RegExp(`</${tag}\\s*>`, "gi");
  let depth = 1, pos = from;
  while (depth > 0) {
    open.lastIndex = pos;
    close.lastIndex = pos;
    const o = open.exec(html);
    const c = close.exec(html);
    if (!c) return -1;
    if (o && o.index < c.index) { depth++; pos = o.index + o[0].length; }
    else if (--depth === 0) return c.index;
    else pos = c.index + c[0].length;
  }
  return -1;
}

/* ── swap innerHTML for every [data-i18n] that has a Japanese string ── */
function applyI18n(html, ja, stats) {
  const re = /<([a-zA-Z][\w-]*)\b[^>]*?\sdata-i18n="([^"]+)"[^>]*?>/g;
  let out = "", pos = 0, m;
  while ((m = re.exec(html)) !== null) {
    if (m.index < pos) continue;                 // inside a region already rewritten
    const [tagText, tag, key] = m;
    if (tagText.endsWith("/>")) continue;        // self-closing, nothing to replace
    const innerStart = m.index + tagText.length;
    const closeAt = matchingClose(html, tag, innerStart);
    if (closeAt === -1) { stats.unmatched.push(key); continue; }
    const value = ja[key];
    if (value === undefined) { stats.missing.push(key); continue; }
    out += html.slice(pos, innerStart) + value;
    pos = closeAt;
    stats.replaced++;
    re.lastIndex = closeAt;
  }
  return out + html.slice(pos);
}

/* ── placeholders are attribute values, not content ── */
function applyPlaceholders(html, ja, stats) {
  return html.replace(
    /<([a-zA-Z][\w-]*)\b([^>]*?)\sdata-i18n-placeholder="([^"]+)"([^>]*?)>/g,
    (whole, tag, pre, key, post) => {
      const value = ja[key];
      if (value === undefined) { stats.missing.push(key); return whole; }
      const esc = value.replace(/"/g, "&quot;");
      const rebuilt = `<${tag}${pre} data-i18n-placeholder="${key}"${post}>`;
      return /\splaceholder="/.test(rebuilt)
        ? rebuilt.replace(/\splaceholder="[^"]*"/, ` placeholder="${esc}"`)
        : rebuilt.replace(`<${tag}`, `<${tag} placeholder="${esc}"`);
    }
  );
}

const attr = (s) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;");

function localise(html, ja, path, head, stats) {
  html = applyI18n(html, ja, stats);
  html = applyPlaceholders(html, ja, stats);

  // <html lang> drives the JA typography rules on most pages; ads and recovery
  // key off body.lang-ja instead, so set both.
  html = html.replace(/<html([^>]*?)\slang="[^"]*"/, '<html$1 lang="ja"');
  html = html.replace(/<body\b([^>]*?)class="([^"]*)"/, '<body$1class="$2 lang-ja"');
  if (!/<body\b[^>]*class=/.test(html)) html = html.replace(/<body\b/, '<body class="lang-ja"');

  // ads and recovery carry their own ja.page_title; everything else uses HEAD_JA.
  const title = ja.page_title || head.title;
  if (title) {
    html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${title}</title>`);
    html = html.replace(/(<meta property="og:title" content=")[^"]*(")/, `$1${attr(title)}$2`);
    html = html.replace(/(<meta name="twitter:title" content=")[^"]*(")/, `$1${attr(title)}$2`);
  }
  if (head.description) {
    const d = attr(head.description);
    html = html.replace(/(<meta name="description" content=")[^"]*(")/, `$1${d}$2`);
    html = html.replace(/(<meta property="og:description" content=")[^"]*(")/, `$1${d}$2`);
    html = html.replace(/(<meta name="twitter:description" content=")[^"]*(")/, `$1${d}$2`);
  }

  // ads and recovery paint their language pill from JS. Static output should
  // already read the way the script would leave it.
  html = html.replace(
    /(<button[^>]*id="lang-pill"[^>]*>)[\s\S]*?(<\/button>)/,
    "$1EN$2"
  );
  html = html.replace(/(<button[^>]*id="btn-en"[^>]*)\sclass="lang-btn active"/, '$1 class="lang-btn"');
  html = html.replace(/(<button[^>]*id="btn-ja"[^>]*)\sclass="lang-btn"/, '$1 class="lang-btn active"');
  html = html.replace(/(<button[^>]*id="btn-en"[^>]*)aria-pressed="true"/, '$1aria-pressed="false"');
  html = html.replace(/(<button[^>]*id="btn-ja"[^>]*)aria-pressed="false"/, '$1aria-pressed="true"');

  // This page's own canonical is the /ja/ URL; the alternates stay reciprocal.
  const jaUrl = `${ORIGIN}/ja${path}`;
  html = html.replace(/(<link rel="canonical" href=")[^"]*(")/, `$1${jaUrl}$2`);
  html = html.replace(/(<meta property="og:url" content=")[^"]*(")/, `$1${jaUrl}$2`);
  html = html.replace(
    /(<meta property="og:type"[^>]*>)/,
    `$1\n  <meta property="og:locale" content="ja_JP" />`
  );

  // Keep visitors inside /ja/ when they click through.
  html = html.replace(/(<a\b[^>]*\shref=")\/(?!\/)([^"]*)(")/g, (whole, a, rest, b) => {
    if (/^(ja|en)(\/|$)/.test(rest)) return whole;
    return `${a}/ja/${rest}${b}`;
  });

  return html;
}

let total = 0;
if (existsSync("ja")) rmSync("ja", { recursive: true });
for (const page of PAGES) {
  const src = page ? `${page}/index.html` : "index.html";
  const path = page ? `/${page}/` : "/";
  const html = readFileSync(src, "utf8");
  const dict = extractDict(html, src);
  if (!dict.ja) throw new Error(`${src}: dictionary has no ja block`);

  const stats = { replaced: 0, missing: [], unmatched: [] };
  const out = localise(html, dict.ja, path, HEAD_JA[page] || {}, stats);

  const dest = join("ja", page, "index.html");
  mkdirSync(dirname(dest), { recursive: true });
  writeFileSync(dest, out, "utf8");
  total += stats.replaced;

  const notes = [];
  if (stats.missing.length) notes.push(`${stats.missing.length} key(s) with no ja string`);
  if (stats.unmatched.length) notes.push(`${stats.unmatched.length} unmatched tag(s)`);
  console.log(
    `${dest.padEnd(26)} ${String(stats.replaced).padStart(3)} strings` +
    (notes.length ? `  (${notes.join(", ")})` : "")
  );
  if (stats.unmatched.length) console.log(`    unmatched: ${stats.unmatched.join(", ")}`);
}
console.log(`\n${PAGES.length} Japanese pages written, ${total} strings applied.`);
