const XHS_SCAN_MESSAGE = "XHS_COLLECTION_SCAN";
const XHS_PING_MESSAGE = "XHS_COLLECTION_PING";

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function normalizeText(value) {
  return (value || "").replace(/\s+/g, " ").trim();
}

function absoluteUrl(url) {
  if (!url) return "";
  try {
    return new URL(url, location.href).toString();
  } catch {
    return url;
  }
}

function extractNoteId(url) {
  const raw = String(url || "");
  const candidates = [raw];
  try {
    candidates.push(decodeURIComponent(raw));
  } catch {
    // Keep the raw candidate when the URL is not percent-encoded.
  }

  for (const candidate of candidates) {
    const match = candidate.match(/\/(?:explore|discovery\/item|search_result)\/([A-Za-z0-9_-]{12,})/);
    if (match) return match[1];
  }

  try {
    const parsed = new URL(raw, location.href);
    const noteId = parsed.searchParams.get("note_id");
    if (noteId) return noteId;
    const redirectPath = parsed.searchParams.get("redirectPath") || parsed.searchParams.get("source");
    if (redirectPath) return extractNoteId(redirectPath);
  } catch {
    return "";
  }

  return "";
}

function canonicalNoteUrl(id) {
  return `https://www.xiaohongshu.com/explore/${id}`;
}

function findCard(anchor) {
  return (
    anchor.closest("section") ||
    anchor.closest("article") ||
    anchor.closest("[class*='note']") ||
    anchor.closest("[class*='card']") ||
    anchor.parentElement
  );
}

function pickTitle(card, anchor) {
  const selectors = [
    "[class*='title']",
    "[class*='desc']",
    "span",
    "p",
    "h1",
    "h2",
    "h3"
  ];
  for (const selector of selectors) {
    const item = card?.querySelector(selector);
    const text = normalizeText(item?.textContent);
    if (text && text.length > 1 && text.length < 160) return text;
  }
  return normalizeText(anchor.getAttribute("title") || anchor.textContent || document.title);
}

function pickAuthor(card) {
  const selectors = [
    "[class*='author']",
    "[class*='user']",
    "[class*='name']",
    "a[href*='/user/profile']"
  ];
  for (const selector of selectors) {
    const item = card?.querySelector(selector);
    const text = normalizeText(item?.textContent);
    if (text && text.length < 80) return text;
  }
  return "";
}

function pickCover(card) {
  const image = card?.querySelector("img");
  const src = image?.currentSrc || image?.src || image?.getAttribute("data-src") || "";
  return absoluteUrl(src);
}

function pageLooksLoggedIn() {
  const text = normalizeText(document.body?.innerText || "");
  const hasLoginWords = /登录|验证码|扫码登录|手机号登录/.test(text);
  const hasUserOrNoteContent = /收藏|笔记|关注|粉丝|赞过/.test(text);
  return hasUserOrNoteContent && !hasLoginWords;
}

function parseCount(text) {
  const normalized = normalizeText(text).replace(/,/g, "");
  const match = normalized.match(/([0-9]+(?:\.[0-9]+)?)\s*([万千kK]?)/);
  if (!match) return null;

  const value = Number(match[1]);
  if (!Number.isFinite(value)) return null;
  const unit = match[2];
  if (unit === "万") return Math.round(value * 10000);
  if (unit === "千") return Math.round(value * 1000);
  if (unit === "k" || unit === "K") return Math.round(value * 1000);
  return Math.round(value);
}

function readProfileCounts() {
  const counts = {};
  const text = normalizeText(document.body?.innerText || "");
  const patterns = [
    ["notes", /(?:笔记|收藏)\s*[·:：]?\s*([0-9][0-9,.]*\s*[万千kK]?)/],
    ["albums", /(?:专辑|收藏夹)\s*[·:：]?\s*([0-9][0-9,.]*\s*[万千kK]?)/],
    ["files", /(?:文件)\s*[·:：]?\s*([0-9][0-9,.]*\s*[万千kK]?)/]
  ];

  for (const [key, pattern] of patterns) {
    const match = text.match(pattern);
    const count = match ? parseCount(match[1]) : null;
    if (count !== null) counts[key] = count;
  }

  for (const element of document.querySelectorAll("button, a, div, span")) {
    const itemText = normalizeText(element.textContent);
    if (!itemText || itemText.length > 32) continue;
    const match = itemText.match(/^(笔记|收藏|专辑|收藏夹|文件)\s*[·:：]\s*(.+)$/);
    if (!match) continue;
    const key = match[1] === "专辑" || match[1] === "收藏夹" ? "albums" : match[1] === "文件" ? "files" : "notes";
    const count = parseCount(match[2]);
    if (count !== null) counts[key] = count;
  }

  return counts;
}

function readVisibleNotes() {
  const anchors = Array.from(document.querySelectorAll("a[href]"));
  const notes = new Map();

  for (const anchor of anchors) {
    const href = absoluteUrl(anchor.getAttribute("href"));
    const id = extractNoteId(href);
    if (!id || notes.has(id)) continue;

    const card = findCard(anchor);
    const title = pickTitle(card, anchor);
    if (!title) continue;

    notes.set(id, {
      id,
      title,
      author: pickAuthor(card),
      cover: pickCover(card),
      url: canonicalNoteUrl(id),
      collect_time: "",
      source_album: normalizeText(document.title).replace(/ - 小红书$/, ""),
      imported_at: new Date().toISOString()
    });
  }

  return Array.from(notes.values());
}

async function scanCollectionPage(options = {}) {
  const maxScrolls = Math.max(0, Math.min(Number(options.maxScrolls ?? 8), 80));
  const waitMs = Math.max(400, Math.min(Number(options.waitMs ?? 900), 3000));
  const seen = new Map();
  let stableRounds = 0;
  let previousCount = 0;

  for (let round = 0; round <= maxScrolls; round += 1) {
    for (const note of readVisibleNotes()) seen.set(note.id, note);

    if (seen.size === previousCount) stableRounds += 1;
    else stableRounds = 0;
    previousCount = seen.size;

    if (round >= maxScrolls || stableRounds >= 3) break;

    window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "smooth" });
    await sleep(waitMs);
  }

  return {
    ok: true,
    loggedIn: pageLooksLoggedIn(),
    url: location.href,
    title: normalizeText(document.title),
    pageCounts: readProfileCounts(),
    scannedAt: new Date().toISOString(),
    notes: Array.from(seen.values())
  };
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type === XHS_PING_MESSAGE) {
    sendResponse({ ok: true, loggedIn: pageLooksLoggedIn(), url: location.href });
    return false;
  }

  if (message?.type === XHS_SCAN_MESSAGE) {
    scanCollectionPage(message.options)
      .then(sendResponse)
      .catch((error) => sendResponse({ ok: false, error: error?.message || String(error) }));
    return true;
  }

  return false;
});
