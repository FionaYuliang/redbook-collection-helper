const XHS_SCAN_MESSAGE = "XHS_COLLECTION_SCAN";
const XHS_API_SCAN_MESSAGE = "XHS_COLLECTION_API_SCAN";
const XHS_CANCEL_SCAN_MESSAGE = "XHS_COLLECTION_CANCEL_SCAN";
const XHS_PING_MESSAGE = "XHS_COLLECTION_PING";
const XHS_API_STORAGE_KEY = "__xhsCollectionApiEntries";
const COLLECT_TIME_PATTERN =
  /((?:(?:\d{4}[-/.年]\d{1,2}(?:[-/.月]\d{1,2}日?)?)|(?:\d{1,2}[-/.月]\d{1,2}日?)|(?:今天|昨天|前天))(?:\s*(?:[T ]|日)?\d{1,2}:\d{2}(?::\d{2})?)?|(?:\d+\s*(?:分钟前|小时前|天前|周前|个月前|年前)))/;
const XHS_IMAGE_FORMATS = "jpg,webp,avif";
const observedApiRequests = [];
let activePageScanToken = null;
let activeApiScanToken = null;

function isCollectionApiUrl(url) {
  const rawUrl = String(url || "");
  if (!/\/api\/sns\/web\//.test(rawUrl)) return false;
  if (/collect|favorite|fav/i.test(rawUrl)) return true;
  if (/\/api\/sns\/web\/v\d+\/user_posted/i.test(rawUrl)) {
    return /[?&]tab=fav(?:&|$)/.test(location.search) || /xsec_?source=pc_collect/i.test(rawUrl) || /收藏/.test(document.title);
  }
  return false;
}

function rememberApiRequest(request) {
  const url = absoluteUrl(request?.url || "");
  if (!isCollectionApiUrl(url)) return;
  const key = `${request.method || "GET"} ${url} ${request.body || ""}`;
  const existing = observedApiRequests.find((item) => item.key === key);
  if (existing) {
    if (typeof request.response === "string" && request.response.length > (existing.response || "").length) {
      existing.response = request.response;
      existing.status = request.status || existing.status || 0;
      existing.observed_at = Date.now();
    }
    return;
  }
  observedApiRequests.unshift({
    key,
    url,
    method: request.method || "GET",
    body: request.body || "",
    status: request.status || 0,
    response: typeof request.response === "string" ? request.response : "",
    observed_at: Date.now()
  });
  observedApiRequests.splice(24);
}

function installApiObserver() {
  window.addEventListener("XHS_COLLECTION_API_OBSERVED", (event) => rememberApiRequest(event.detail));
}

installApiObserver();

function readObservedApiDataset() {
  try {
    const rows = JSON.parse(sessionStorage.getItem(XHS_API_STORAGE_KEY) || document.documentElement.dataset.xhsCollectionApis || "[]");
    for (const row of rows) rememberApiRequest(row);
  } catch {
    // Ignore malformed observer data.
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function throwIfCanceled(scanToken, message = "已停止采集") {
  if (scanToken?.canceled) throw new Error(message);
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
    const match =
      candidate.match(/\/(?:explore|discovery\/item|search_result)\/([A-Za-z0-9_-]{12,})/) ||
      candidate.match(/\/user\/profile\/[A-Za-z0-9_-]+\/([A-Za-z0-9_-]{12,})/);
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

function fallbackNoteUrl(id) {
  return `https://www.xiaohongshu.com/explore/${id}`;
}

function normalizeNoteUrl(url, id) {
  try {
    const parsed = new URL(url, location.href);
    const noteId = extractNoteId(parsed.toString());
    const isNotePath = /\/(?:explore|discovery\/item|search_result)\//.test(parsed.pathname) || /\/user\/profile\/[A-Za-z0-9_-]+\//.test(parsed.pathname);
    if (noteId === id && isNotePath) return parsed.toString();

    const redirectPath = parsed.searchParams.get("redirectPath") || parsed.searchParams.get("source");
    if (redirectPath) return normalizeNoteUrl(redirectPath, id);
  } catch {
    // Fall back to a stable explore URL if the page exposes an unusual href.
  }

  return fallbackNoteUrl(id);
}

function appendQuery(path, params) {
  const url = new URL(path, location.origin);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") url.searchParams.set(key, String(value));
  }
  return url.toString();
}

function getPathValue(object, paths) {
  for (const path of paths) {
    const value = path.split(".").reduce((current, key) => current?.[key], object);
    if (value !== undefined && value !== null && value !== "") return value;
  }
  return "";
}

function readCurrentUserId() {
  const fromUrl = location.pathname.match(/\/user\/profile\/([A-Za-z0-9_-]+)/)?.[1];
  if (fromUrl) return fromUrl;

  for (const anchor of document.querySelectorAll("a[href*='/user/profile/']")) {
    const userId = anchor.getAttribute("href")?.match(/\/user\/profile\/([A-Za-z0-9_-]+)/)?.[1];
    if (userId) return userId;
  }

  try {
    for (let index = 0; index < localStorage.length; index += 1) {
      const value = localStorage.getItem(localStorage.key(index));
      if (!value || value.length > 20000) continue;
      const match = value.match(/"(?:user_id|userId|userid)"\s*:\s*"([A-Za-z0-9_-]{8,})"/);
      if (match) return match[1];
    }
  } catch {
    // Some embedded pages can block storage access.
  }

  const textMatch = document.documentElement.innerHTML.match(/\/user\/profile\/([A-Za-z0-9_-]{8,})/);
  return textMatch?.[1] || "";
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
  const src =
    image?.currentSrc ||
    image?.src ||
    image?.getAttribute("data-src") ||
    image?.getAttribute("data-original") ||
    image?.getAttribute("data-lazy") ||
    "";
  return absoluteUrl(src);
}

function isNearViewport(element, margin = 240) {
  const rect = element.getBoundingClientRect();
  const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 0;
  return rect.bottom >= -margin && rect.top <= viewportHeight + margin;
}

async function waitForImagesToSettle(root = document, timeoutMs = 1000) {
  const images = Array.from(root.querySelectorAll("img")).filter(
    (image) => isNearViewport(image) && (!image.complete || !pickImageSource(image))
  );
  if (!images.length) return;

  await Promise.race([
    Promise.all(
      images.slice(0, 80).map(
        (image) =>
          new Promise((resolve) => {
            const done = () => resolve();
            image.addEventListener("load", done, { once: true });
            image.addEventListener("error", done, { once: true });
          })
      )
    ),
    sleep(timeoutMs)
  ]);
}

function pickImageSource(image) {
  return (
    image?.currentSrc ||
    image?.src ||
    image?.getAttribute("data-src") ||
    image?.getAttribute("data-original") ||
    image?.getAttribute("data-lazy") ||
    ""
  );
}

function pageScrollState() {
  const scrollingElement = document.scrollingElement || document.documentElement;
  const scrollTop = window.scrollY || scrollingElement.scrollTop || 0;
  const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 0;
  const scrollHeight = Math.max(
    scrollingElement.scrollHeight || 0,
    document.documentElement.scrollHeight || 0,
    document.body?.scrollHeight || 0
  );
  const bottomGap = Math.max(0, scrollHeight - scrollTop - viewportHeight);
  return { scrollTop, viewportHeight, scrollHeight, bottomGap, atBottom: bottomGap <= 24 };
}

async function scrollOneViewport(waitMs) {
  const before = pageScrollState();
  const step = Math.max(360, Math.round(before.viewportHeight * 0.82));
  window.scrollBy({ top: step, behavior: "auto" });
  await sleep(waitMs);
  await waitForImagesToSettle(document, Math.min(1600, waitMs + 600));
  return pageScrollState();
}

function normalizeTag(value) {
  return normalizeText(value).replace(/^#+/, "").replace(/[，,。.!！?？;；:：]+$/g, "").slice(0, 32);
}

function pickTags(card, title = "") {
  const tags = new Set();
  const collect = (value) => {
    const tag = normalizeTag(value);
    if (tag && tag.length > 1 && !/^(赞|评论|收藏|分享|更多)$/.test(tag)) tags.add(tag);
  };

  const text = normalizeText([title, card?.textContent].join(" "));
  for (const match of text.matchAll(/#\s*([^#\s，,。.!！?？;；:：]{2,32})/g)) collect(match[1]);

  for (const element of card?.querySelectorAll("a[href*='search'], a[href*='tag'], [class*='tag'], [class*='topic']") || []) {
    const elementText = normalizeText(element.textContent);
    if (elementText.startsWith("#")) collect(elementText);
    const href = element.getAttribute("href") || "";
    try {
      const parsed = new URL(href, location.href);
      collect(parsed.searchParams.get("keyword") || parsed.searchParams.get("q") || parsed.searchParams.get("tag"));
    } catch {
      // Ignore unusual hrefs exposed by the page.
    }
  }

  return Array.from(tags).slice(0, 12);
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

function countKeyForLabel(label) {
  if (label === "笔记") return "notes";
  if (label === "收藏") return "favorites";
  if (label === "专辑" || label === "收藏夹") return "albums";
  if (label === "文件") return "files";
  return "";
}

function setCount(counts, key, value) {
  if (!key || value === null || value === undefined) return;
  counts[key] = value;
}

function readFavoriteSubtabCounts() {
  const counts = {};
  for (const element of document.querySelectorAll(".feeds-tab-container, .tab-content-item, [class*='feeds'], [class*='tab']")) {
    const text = normalizeText(element.textContent);
    if (!/笔记[·・:：]/.test(text) || !/(专辑|收藏夹|文件)[·・:：]/.test(text)) continue;
    const notes = text.match(/笔记\s*[·・:：]\s*([0-9][0-9,.]*\s*[万千kK]?)/);
    const albums = text.match(/(?:专辑|收藏夹)\s*[·・:：]\s*([0-9][0-9,.]*\s*[万千kK]?)/);
    const files = text.match(/文件\s*[·・:：]\s*([0-9][0-9,.]*\s*[万千kK]?)/);
    setCount(counts, "favoriteNotes", notes ? parseCount(notes[1]) : null);
    setCount(counts, "notes", notes ? parseCount(notes[1]) : null);
    setCount(counts, "albums", albums ? parseCount(albums[1]) : null);
    setCount(counts, "files", files ? parseCount(files[1]) : null);
    if (counts.favoriteNotes) return counts;
  }
  return counts;
}

function readProfileCounts() {
  const counts = readFavoriteSubtabCounts();
  const text = normalizeText(document.body?.innerText || "");
  const likesAndCollects = text.match(/获赞与收藏\s*([0-9][0-9,.]*\s*[万千kK]?)/);
  setCount(counts, "likesAndCollects", likesAndCollects ? parseCount(likesAndCollects[1]) : null);

  if (!counts.notes) {
    const notes = text.match(/(?:^|\s)笔记\s*[·・:：]\s*([0-9][0-9,.]*\s*[万千kK]?)/);
    setCount(counts, "notes", notes ? parseCount(notes[1]) : null);
  }

  if (!counts.favoriteNotes && /[?&]tab=fav(?:&|$)/.test(location.search)) {
    counts.favoriteNotes = counts.notes || 0;
  }

  for (const element of document.querySelectorAll("button, a, div, span")) {
    const itemText = normalizeText(element.textContent);
    if (!itemText || itemText.length > 32) continue;
    if (/获赞与收藏/.test(itemText)) continue;
    const match =
      itemText.match(/^(笔记|收藏夹|专辑|文件)\s*[·・:：]\s*(.+)$/) ||
      itemText.match(/^(.+?)\s*(笔记|收藏夹|专辑|文件)$/);
    if (!match) continue;
    const label = countKeyForLabel(match[1]) ? match[1] : match[2];
    const rawCount = countKeyForLabel(match[1]) ? match[2] : match[1];
    const key = countKeyForLabel(label);
    const count = parseCount(rawCount);
    if (key === "notes" && counts.favoriteNotes) continue;
    setCount(counts, key, count);
  }

  return counts;
}

function collectTimeFromText(text) {
  const match =
    normalizeText(text).match(new RegExp(`收藏(?:于|时间)?\\s*[·:：]?\\s*${COLLECT_TIME_PATTERN.source}`)) ||
    normalizeText(text).match(new RegExp(`${COLLECT_TIME_PATTERN.source}\\s*(?:收藏|收藏于)`));
  return normalizeText(match?.[1] || "");
}

function pickCollectTime(card) {
  const fromText = collectTimeFromText(card?.textContent || "");
  if (fromText) return fromText;

  const elements = Array.from(card?.querySelectorAll("time, [datetime], [title], [aria-label]") || []);
  for (const element of elements) {
    const value = normalizeText(
      [
        element.textContent,
        element.getAttribute("datetime"),
        element.getAttribute("title"),
        element.getAttribute("aria-label")
      ].join(" ")
    );
    const context = normalizeText(element.parentElement?.textContent || "");
    const collectedValue = collectTimeFromText(`${context} ${value}`);
    if (collectedValue) return collectedValue;
    if (/收藏/.test(context) && COLLECT_TIME_PATTERN.test(value)) return normalizeText(value.match(COLLECT_TIME_PATTERN)?.[1] || "");
  }

  return "";
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
      tags: pickTags(card, title),
      cover: pickCover(card),
      url: normalizeNoteUrl(href, id),
      collect_time: pickCollectTime(card),
      source_album: normalizeText(document.title).replace(/ - 小红书$/, ""),
      imported_at: new Date().toISOString()
    });
  }

  return Array.from(notes.values());
}

function pickApiArray(payload) {
  const queue = [payload?.data, payload];
  const seen = new Set();
  while (queue.length) {
    const item = queue.shift();
    if (!item || typeof item !== "object" || seen.has(item)) continue;
    seen.add(item);

    for (const key of ["items", "list", "notes", "note_list", "noteList", "feeds", "data"]) {
      const value = item[key];
      if (Array.isArray(value) && value.length) return value;
      if (value && typeof value === "object") queue.push(value);
    }
  }
  return [];
}

function pickApiCursor(payload) {
  return (
    getPathValue(payload, [
      "data.cursor",
      "data.next_cursor",
      "data.nextCursor",
      "data.last_cursor",
      "data.page_info.cursor",
      "data.pageInfo.cursor",
      "cursor",
      "next_cursor",
      "nextCursor"
    ]) || ""
  );
}

function pickApiHasMore(payload, itemCount) {
  const raw = getPathValue(payload, [
    "data.has_more",
    "data.hasMore",
    "data.more",
    "data.page_info.has_more",
    "data.pageInfo.hasMore",
    "has_more",
    "hasMore"
  ]);
  if (raw === "") return itemCount > 0;
  return Boolean(raw);
}

function pickApiImage(value) {
  if (!value) return "";
  if (typeof value === "string") return absoluteUrl(value);
  if (Array.isArray(value)) return pickApiImage(value[0]);
  return absoluteUrl(
    value.url ||
      value.urlDefault ||
      value.src ||
      value.file_id ||
      value.fileId ||
      value.url_default ||
      value.url_pre ||
      value.urlPre ||
      value.info_list?.[0]?.url ||
      value.infoList?.[0]?.url ||
      value.url_list?.[0] ||
      value.urlList?.[0] ||
      value.urls?.[0] ||
      value.image_list?.[0]?.url ||
      value.imageList?.[0]?.url ||
      ""
  );
}

function normalizeApiNote(raw) {
  const note = raw?.note || raw?.note_card || raw?.noteCard || raw?.card || raw;
  const id = String(getPathValue(note, ["note_id", "noteId", "id"]) || getPathValue(raw, ["note_id", "noteId", "id"]) || "");
  if (!id) return null;

  const title =
    normalizeText(getPathValue(note, ["display_title", "displayTitle", "title", "desc", "description"])) ||
    normalizeText(getPathValue(raw, ["display_title", "displayTitle", "title", "desc", "description"])) ||
    "未命名笔记";
  const author = normalizeText(
    getPathValue(note, ["user.nickname", "user.nickName", "user.nick_name", "user.name", "author.nickname", "author.nickName", "author.name"]) ||
      getPathValue(raw, ["user.nickname", "user.nickName", "user.nick_name", "author.nickname", "author.nickName", "author.name"])
  );
  const cover = pickApiImage(
    getPathValue(note, ["cover", "image", "images_list.0", "imagesList.0", "image_list.0", "imageList.0"]) ||
      getPathValue(raw, ["cover", "image", "images_list.0", "image_list.0"])
  );
  const tags = normalizeTagsForApi(
    getPathValue(note, ["tag_list", "tagList", "tags", "hash_tags", "hashTags"]) ||
      getPathValue(raw, ["tag_list", "tagList", "tags", "hash_tags", "hashTags"])
  );
  const xsecToken = getPathValue(note, ["xsec_token", "xsecToken"]) || getPathValue(raw, ["xsec_token", "xsecToken"]);
  const url = xsecToken ? `${fallbackNoteUrl(id)}?xsec_token=${encodeURIComponent(xsecToken)}` : fallbackNoteUrl(id);

  return {
    id,
    title,
    author,
    tags,
    cover,
    url,
    collect_time: normalizeText(getPathValue(raw, ["collect_time", "collectTime", "time"]) || ""),
    source_album: "小红书收藏",
    imported_at: new Date().toISOString()
  };
}

function normalizeTagsForApi(value) {
  const rawTags = Array.isArray(value)
    ? value.map((item) => (typeof item === "string" ? item : item?.name || item?.tag_name || item?.tagName || item?.title || ""))
    : String(value || "").split(/[#,\n，、;；/]+/);
  return rawTags.map(normalizeTag).filter(Boolean).slice(0, 16);
}

function observedCollectionApiRequests() {
  readObservedApiDataset();
  const requests = [...observedApiRequests];
  for (const entry of performance.getEntriesByType("resource")) {
    if (isCollectionApiUrl(entry.name)) rememberApiRequest({ url: entry.name, method: "GET" });
  }
  return [...observedApiRequests, ...requests]
    .filter((request, index, array) => array.findIndex((item) => item.key === request.key) === index)
    .slice(0, 16);
}

function observedCollectionApiPayloads() {
  readObservedApiDataset();
  const payloads = [];
  const seen = new Set();
  for (const request of observedApiRequests) {
    if (!request.response || typeof request.response !== "string") continue;
    const key = `${request.url} ${request.status || 0} ${request.response.length} ${request.response.slice(0, 40)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    try {
      payloads.push({ url: request.url, payload: JSON.parse(request.response), observed_at: request.observed_at || 0 });
    } catch {
      // Ignore non-JSON responses captured by the page observer.
    }
  }
  return payloads;
}

function collectNotesFromApiPayloads(payloadRows) {
  const notes = new Map();
  let sawPayload = false;
  let sawTerminalPage = false;
  let sawPageWithItems = false;

  for (const row of payloadRows) {
    const payload = row.payload;
    const items = pickApiArray(payload);
    if (!items.length) continue;
    sawPayload = true;
    sawPageWithItems = true;
    for (const item of items) {
      const note = normalizeApiNote(item);
      if (note && !notes.has(note.id)) notes.set(note.id, note);
    }
    if (!pickApiHasMore(payload, items.length)) sawTerminalPage = true;
  }

  return { notes, sawPayload, sawTerminalPage, sawPageWithItems };
}

function mergeObservedApiNotes(target) {
  const collected = collectNotesFromApiPayloads(observedCollectionApiPayloads());
  for (const note of collected.notes.values()) {
    if (!target.has(note.id)) target.set(note.id, note);
  }
  return collected;
}

async function collectObservedApiNotesByScrolling(options = {}) {
  const maxScrolls = Math.max(0, Math.min(Number(options.maxScrolls ?? 40), 600));
  const waitMs = Math.max(500, Math.min(Number(options.waitMs ?? 900), 2600));
  const scanToken = options.scanToken;
  const notes = new Map();
  let sawPayload = false;
  let sawTerminalPage = false;
  let reachedBottom = false;
  let stableRounds = 0;
  let previousCount = 0;

  window.scrollTo({ top: 0, behavior: "auto" });
  await sleep(Math.min(1200, waitMs));

  for (let round = 0; round <= maxScrolls; round += 1) {
    const collected = mergeObservedApiNotes(notes);
    sawPayload = sawPayload || collected.sawPayload;
    sawTerminalPage = sawTerminalPage || collected.sawTerminalPage;
    if (scanToken?.canceled) break;

    if (notes.size === previousCount) stableRounds += 1;
    else stableRounds = 0;
    previousCount = notes.size;

    const scrollState = pageScrollState();
    reachedBottom = reachedBottom || scrollState.atBottom;
    if (round >= maxScrolls || (sawTerminalPage && stableRounds >= 1) || (reachedBottom && stableRounds >= 4)) break;

    await scrollOneViewport(waitMs);
    if (scanToken?.canceled) {
      const lastCollected = mergeObservedApiNotes(notes);
      sawPayload = sawPayload || lastCollected.sawPayload;
      sawTerminalPage = sawTerminalPage || lastCollected.sawTerminalPage;
      break;
    }
  }

  const collected = mergeObservedApiNotes(notes);
  sawPayload = sawPayload || collected.sawPayload;
  sawTerminalPage = sawTerminalPage || collected.sawTerminalPage;

  return {
    notes,
    sawPayload,
    sawTerminalPage,
    reachedBottom: reachedBottom || pageScrollState().atBottom,
    canceled: Boolean(scanToken?.canceled)
  };
}

function requestForPage(request, cursor, pageSize, userId) {
  const method = String(request.method || "GET").toUpperCase();
  const url = new URL(request.url, location.href);
  for (const key of ["cursor", "last_cursor", "next_cursor"]) {
    if (url.searchParams.has(key) || key === "cursor") url.searchParams.set(key, cursor || "");
  }
  for (const key of ["num", "count", "page_size", "pageSize"]) {
    if (url.searchParams.has(key)) url.searchParams.set(key, String(pageSize));
  }
  if (userId && url.searchParams.has("user_id")) url.searchParams.set("user_id", userId);
  if (userId && url.searchParams.has("userId")) url.searchParams.set("userId", userId);
  if (!url.searchParams.has("image_formats")) url.searchParams.set("image_formats", XHS_IMAGE_FORMATS);
  if (!url.searchParams.has("imageFormats")) url.searchParams.set("imageFormats", XHS_IMAGE_FORMATS);
  if (!url.searchParams.has("xsec_source") && !url.searchParams.has("xsecSource")) url.searchParams.set("xsec_source", "pc_collect");

  let body = request.body || "";
  if (body && /^\s*[{[]/.test(body)) {
    try {
      const parsed = JSON.parse(body);
      for (const key of ["cursor", "last_cursor", "next_cursor"]) {
        if (Object.prototype.hasOwnProperty.call(parsed, key) || key === "cursor") parsed[key] = cursor || "";
      }
      for (const key of ["num", "count", "page_size", "pageSize"]) {
        if (Object.prototype.hasOwnProperty.call(parsed, key)) parsed[key] = pageSize;
      }
      if (userId && Object.prototype.hasOwnProperty.call(parsed, "user_id")) parsed.user_id = userId;
      if (userId && Object.prototype.hasOwnProperty.call(parsed, "userId")) parsed.userId = userId;
      if (Object.prototype.hasOwnProperty.call(parsed, "image_formats")) parsed.image_formats = XHS_IMAGE_FORMATS;
      if (Object.prototype.hasOwnProperty.call(parsed, "imageFormats")) parsed.imageFormats = XHS_IMAGE_FORMATS;
      body = JSON.stringify(parsed);
    } catch {
      // Keep the captured body when it is not valid JSON.
    }
  }

  return { url: url.toString(), method, body };
}

async function discoverCollectionApiPaths() {
  const paths = new Set();
  const collect = (text) => {
    for (const match of String(text || "").matchAll(/\/api\/sns\/web\/[^"'`\\\s]+/g)) {
      const path = match[0].replace(/\\u002F/g, "/");
      if (/collect|favorite|fav/i.test(path)) paths.add(path.split("?")[0]);
    }
  };

  for (const script of document.scripts) collect(script.textContent);
  for (const entry of performance.getEntriesByType("resource")) {
    if (!/\.js(?:\?|$)/.test(entry.name) || !entry.name.startsWith(location.origin)) continue;
    if (paths.size >= 8) break;
    try {
      const response = await fetch(entry.name, { credentials: "include" });
      if (response.ok) collect(await response.text());
    } catch {
      // Keep the hardcoded candidates when bundles cannot be inspected.
    }
  }

  return Array.from(paths).slice(0, 8);
}

async function fetchJson(request) {
  const method = request.method || "GET";
  const response = await fetch(request.url || request, {
    method,
    credentials: "include",
    headers: {
      Accept: "application/json, text/plain, */*",
      ...(method !== "GET" ? { "Content-Type": "application/json" } : {})
    },
    ...(method !== "GET" && request.body ? { body: request.body } : {})
  });
  const text = await response.text();
  let payload = null;
  try {
    payload = JSON.parse(text);
  } catch {
    throw new Error(`接口返回非 JSON：${text.slice(0, 80)}`);
  }
  if (!response.ok || payload?.success === false || payload?.code === -1) {
    throw new Error(payload?.msg || payload?.message || `接口返回 ${response.status}`);
  }
  return payload;
}

async function scanCollectionApi(options = {}) {
  const userId = readCurrentUserId();
  const pageSize = Math.max(10, Math.min(Number(options.pageSize || 30), 50));
  const maxPages = Math.max(1, Math.min(Number(options.maxPages || 80), 600));
  const scanToken = { canceled: false };
  activeApiScanToken = scanToken;

  try {
    const captured = await collectObservedApiNotesByScrolling({ ...options, maxScrolls: options.maxScrolls ?? maxPages, scanToken });
    const capturedPageCounts = readProfileCounts();
    const capturedExpectedTotal = Number(capturedPageCounts.favoriteNotes || capturedPageCounts.notes || captured.notes.size);

    if (captured.notes.size) {
      if (!captured.canceled && capturedExpectedTotal > 0 && captured.notes.size < capturedExpectedTotal && !captured.sawTerminalPage) {
        throw new Error(
          `接口响应不完整：仅捕获到 ${captured.notes.size}/${capturedExpectedTotal} 篇。是否回退到页面采集？`
        );
      }
      const countComplete = capturedExpectedTotal > 0 && captured.notes.size >= capturedExpectedTotal;
      return {
        ok: true,
        source: "api",
        loggedIn: true,
        url: location.href,
        title: normalizeText(document.title),
        pageCounts: capturedPageCounts,
        scannedAt: new Date().toISOString(),
        reachedBottom: countComplete || (!capturedExpectedTotal && (captured.reachedBottom || captured.sawTerminalPage)),
        incomplete: captured.canceled || (capturedExpectedTotal > 0 && captured.notes.size < capturedExpectedTotal),
        canceled: captured.canceled,
        stopReason: captured.canceled ? "stopped" : "",
        expectedTotal: capturedExpectedTotal,
        notes: Array.from(captured.notes.values())
      };
    }
    if (captured.canceled) throw new Error("已停止接口采集，未采集到可保存的笔记");

    const requestCandidates = observedCollectionApiRequests();
    const triedRequests = new Set();
    const errors = captured.sawPayload ? ["页面接口响应未包含可识别的收藏笔记列表"] : [];

    for (let phase = 0; phase < 2; phase += 1) {
      throwIfCanceled(scanToken, "已停止接口采集");
      if (phase === 1) {
        for (const path of await discoverCollectionApiPaths()) {
          requestCandidates.push({ url: appendQuery(path, { user_id: userId, image_formats: XHS_IMAGE_FORMATS }), method: "GET", body: "" });
        }
      }

      for (const baseRequest of requestCandidates) {
        throwIfCanceled(scanToken, "已停止接口采集");
        const requestKey = `${baseRequest.method || "GET"} ${baseRequest.url} ${baseRequest.body || ""}`;
        if (triedRequests.has(requestKey)) continue;
        triedRequests.add(requestKey);
        const notes = new Map();
        let cursor = "";
        let hasMore = true;
        let lastCursor = "";

        try {
          for (let page = 0; page < maxPages && hasMore; page += 1) {
            throwIfCanceled(scanToken, "已停止接口采集");
            const pageRequest = requestForPage(baseRequest, cursor, pageSize, userId);
            const payload = await fetchJson(pageRequest);
            const items = pickApiArray(payload);
            for (const item of items) {
              const note = normalizeApiNote(item);
              if (note && !notes.has(note.id)) notes.set(note.id, note);
            }

            const nextCursor = String(pickApiCursor(payload) || "");
            hasMore = pickApiHasMore(payload, items.length) && nextCursor !== lastCursor && items.length > 0;
            lastCursor = cursor;
            cursor = nextCursor;
            if (!nextCursor && items.length < pageSize) hasMore = false;
          }

          if (notes.size) {
            const pageCounts = readProfileCounts();
            const expectedTotal = Number(pageCounts.favoriteNotes || pageCounts.notes || notes.size);
            const countComplete = expectedTotal > 0 && notes.size >= expectedTotal;
            return {
              ok: true,
              source: "api",
              loggedIn: true,
              url: location.href,
              title: normalizeText(document.title),
              pageCounts,
              scannedAt: new Date().toISOString(),
              reachedBottom: countComplete,
              incomplete: expectedTotal > 0 && notes.size < expectedTotal,
              expectedTotal,
              notes: Array.from(notes.values())
            };
          }
          errors.push(`${new URL(baseRequest.url, location.href).pathname}: 空列表`);
        } catch (error) {
          if (scanToken.canceled) throw error;
          errors.push(`${new URL(baseRequest.url, location.href).pathname}: ${error.message || String(error)}`);
        }
      }
    }

    const prefix = observedApiRequests.length ? "已观察到收藏接口但复用失败" : "未观察到页面真实收藏接口";
    throw new Error(`${prefix}：${errors.slice(0, 3).join("；") || "请先在小红书页面打开收藏列表后重试"}`);
  } finally {
    if (activeApiScanToken === scanToken) activeApiScanToken = null;
  }
}

async function scanCollectionPage(options = {}) {
  const maxScrolls = Math.max(0, Math.min(Number(options.maxScrolls ?? 60), 600));
  const waitMs = Math.max(700, Math.min(Number(options.waitMs ?? 1200), 5000));
  const scanToken = { canceled: false };
  activePageScanToken = scanToken;
  const seen = new Map();
  let stableRounds = 0;
  let bottomStableRounds = 0;
  let stuckRounds = 0;
  let previousCount = 0;
  let physicalBottom = false;

  try {
    window.scrollTo({ top: 0, behavior: "auto" });
    await sleep(Math.min(1400, waitMs));
    for (let round = 0; round <= maxScrolls; round += 1) {
      if (scanToken.canceled) break;
      await waitForImagesToSettle(document, Math.min(1600, waitMs));
      for (const note of readVisibleNotes()) seen.set(note.id, note);
      if (scanToken.canceled) break;

      if (seen.size === previousCount) stableRounds += 1;
      else stableRounds = 0;
      previousCount = seen.size;

      const beforeScroll = pageScrollState();
      if (beforeScroll.atBottom) {
        physicalBottom = true;
        bottomStableRounds += 1;
      } else {
        bottomStableRounds = 0;
      }

      const pageCounts = readProfileCounts();
      const expectedTotal = Number(pageCounts.favoriteNotes || pageCounts.notes || 0);
      const countComplete = expectedTotal > 0 && seen.size >= expectedTotal;
      if (round >= maxScrolls || countComplete || (physicalBottom && stableRounds >= 2 && bottomStableRounds >= 1) || stuckRounds >= 2) break;

      const afterScroll = await scrollOneViewport(waitMs);
      if (afterScroll.atBottom) physicalBottom = true;

      if (afterScroll.scrollTop <= beforeScroll.scrollTop + 8 && afterScroll.scrollHeight <= beforeScroll.scrollHeight + 8) {
        stableRounds += 1;
        stuckRounds += 1;
        if (stuckRounds >= 2) physicalBottom = true;
      } else {
        stuckRounds = 0;
      }
    }

    if (!scanToken.canceled) {
      await sleep(Math.min(1400, waitMs));
      await waitForImagesToSettle(document, Math.min(1800, waitMs));
    }
    for (const note of readVisibleNotes()) seen.set(note.id, note);
  } finally {
    if (activePageScanToken === scanToken) activePageScanToken = null;
  }

  const finalScrollState = pageScrollState();
  const pageCounts = readProfileCounts();
  const remoteTotal = Number(pageCounts.favoriteNotes || pageCounts.notes || 0);
  const countComplete = remoteTotal > 0 && seen.size >= remoteTotal;

  return {
    ok: true,
    loggedIn: pageLooksLoggedIn(),
    url: location.href,
    title: normalizeText(document.title),
    pageCounts,
    scannedAt: new Date().toISOString(),
    reachedBottom: countComplete || (!remoteTotal && (physicalBottom || finalScrollState.atBottom)),
    incomplete: scanToken.canceled || (remoteTotal > 0 && seen.size < remoteTotal),
    physicalBottom: physicalBottom || finalScrollState.atBottom,
    canceled: scanToken.canceled,
    stopReason: scanToken.canceled ? "stopped" : "",
    expectedTotal: remoteTotal,
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

  if (message?.type === XHS_API_SCAN_MESSAGE) {
    scanCollectionApi(message.options)
      .then(sendResponse)
      .catch((error) => sendResponse({ ok: false, source: "api", error: error?.message || String(error) }));
    return true;
  }

  if (message?.type === XHS_CANCEL_SCAN_MESSAGE) {
    if (activeApiScanToken) activeApiScanToken.canceled = true;
    if (activePageScanToken) activePageScanToken.canceled = true;
    sendResponse({ ok: true });
    return false;
  }

  return false;
});
