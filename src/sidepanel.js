const DB_NAME = "xhs_collection_assistant";
const DB_VERSION = 1;
const PING_TYPE = "XHS_COLLECTION_PING";
const SCAN_TYPE = "XHS_COLLECTION_SCAN";
const API_SCAN_TYPE = "XHS_COLLECTION_API_SCAN";
const CANCEL_SCAN_TYPE = "XHS_COLLECTION_CANCEL_SCAN";
const SCAN_PROGRESS_TYPE = "XHS_COLLECTION_SCAN_PROGRESS";
const LOCAL_DATA_STORES = ["notes", "categories", "topics", "note_topics", "collections", "collection_notes", "meta"];
const MAX_CATEGORY_LEVEL = 3;
const DEFAULT_MAX_SCAN_SCROLLS = 240;
const DEFAULT_API_PAGE_SIZE = 30;
const DEFAULT_SCAN_WAIT_MS = 1200;
const MIN_SCAN_TIMEOUT_MS = 300000;
const MAX_SCAN_TIMEOUT_MS = 1800000;

const DEFAULT_CATEGORIES = [
  ["cat-travel", "旅游"],
  ["cat-home", "家居"],
  ["cat-parenting", "育儿"],
  ["cat-learning", "学习成长"],
  ["cat-digital", "数码"],
  ["cat-food", "美食"],
  ["cat-health", "健康运动"],
  ["cat-pet", "宠物"],
  ["cat-car", "汽车"],
  ["cat-other", "其他"]
];

const CATEGORY_PREFERENCE_KEY = "ai_category_preferences";

const CATEGORY_RULES = [
  ["旅游", ["旅行", "旅游", "东京", "日本", "京都", "大阪", "酒店", "签证", "自由行", "机票", "攻略", "民宿", "景点", "行程", "北海道", "镰仓", "小樽", "札幌", "富良野", "美瑛", "箱根", "奈良", "神户", "冲绳", "迪士尼", "环球影城", "出行", "周边游"]],
  ["家居", ["装修", "家居", "收纳", "软装", "厨房", "客厅", "卧室", "新房", "租房", "改造", "柜", "灯", "玄关", "阳台", "卫生间", "浴室", "餐边柜", "全屋", "家装"]],
  ["育儿", ["儿童", "孩子", "宝宝", "绘本", "亲子", "幼儿", "早教", "育儿", "小学", "玩具", "养娃", "带娃", "母婴", "辅食", "奶粉", "尿不湿", "绘本", "启蒙", "幼升小", "学龄前", "孕产", "妈妈"]],
  ["学习成长", ["托福", "雅思", "英语", "学习", "备考", "口语", "模板", "效率", "AI", "工具", "考研", "读书", "课程", "笔记", "写作", "面试", "简历", "职场", "留学", "单词"]],
  ["数码", ["手机", "电脑", "相机", "镜头", "iPhone", "Mac", "App", "软件", "数码", "耳机", "平板", "键盘", "充电", "摄影", "小程序", "设备", "硬盘"]],
  ["美食", ["美食", "餐厅", "菜谱", "咖啡", "烘焙", "甜品", "早餐", "晚餐", "火锅", "探店", "食谱", "减脂餐", "下午茶", "茶饮", "料理", "做饭", "下厨"]],
  ["健康运动", ["健身", "瑜伽", "跑步", "减脂", "健康", "运动", "训练", "睡眠", "康复", "普拉提", "力量", "拉伸", "体态", "塑形", "增肌", "有氧"]],
  ["宠物", ["猫", "狗", "宠物", "猫粮", "狗粮", "铲屎", "猫咪", "狗狗", "主子", "毛孩子", "养猫", "养狗", "猫砂"]],
  ["汽车", ["汽车", "买车", "车险", "自驾", "新能源", "特斯拉", "驾驶", "保养", "试驾", "充电桩", "油耗", "车载", "停车"]]
];

const TOPIC_RULES = {
  "旅游": [
    ["日本旅行", ["日本", "东京", "京都", "大阪", "北海道", "镰仓", "小樽", "札幌", "富良野", "美瑛", "箱根", "奈良", "神户", "冲绳"]],
    ["国内旅行", ["国内", "云南", "新疆", "成都", "上海", "北京", "杭州", "三亚", "广州", "深圳", "重庆", "长沙", "西安", "南京", "苏州", "青岛", "厦门"]],
    ["酒店推荐", ["酒店", "民宿", "住宿"]],
    ["签证攻略", ["签证", "入境", "护照"]],
    ["旅行攻略", ["行程", "攻略", "路线", "自由行", "出行", "周边游", "机票", "景点"]]
  ],
  "家居": [
    ["装修案例", ["装修", "新房", "硬装", "软装"]],
    ["收纳整理", ["收纳", "整理", "柜"]],
    ["厨房餐厨", ["厨房", "餐具", "锅"]],
    ["家居好物", ["家居", "好物", "灯", "椅"]]
  ],
  "育儿": [
    ["儿童英语", ["英语", "启蒙", "绘本"]],
    ["亲子活动", ["亲子", "活动", "周末"]],
    ["绘本玩具", ["绘本", "玩具"]],
    ["早教成长", ["早教", "幼儿", "宝宝", "儿童", "孩子", "养娃", "带娃", "母婴", "辅食", "幼升小", "学龄前"]]
  ],
  "学习成长": [
    ["英语学习", ["英语", "托福", "雅思", "口语", "单词"]],
    ["AI工具", ["AI", "提示词", "ChatGPT", "智能"]],
    ["效率工具", ["效率", "工具", "App", "软件", "模板"]],
    ["考试备考", ["备考", "考研", "考试"]]
  ],
  "数码": [
    ["手机平板", ["手机", "iPhone", "平板"]],
    ["电脑软件", ["电脑", "Mac", "软件", "App"]],
    ["摄影设备", ["相机", "镜头", "摄影"]],
    ["数码配件", ["耳机", "键盘", "充电"]]
  ],
  "美食": [
    ["餐厅探店", ["餐厅", "探店", "火锅"]],
    ["家常菜谱", ["菜谱", "早餐", "晚餐"]],
    ["咖啡甜品", ["咖啡", "甜品", "烘焙"]]
  ],
  "健康运动": [
    ["健身训练", ["健身", "训练", "力量"]],
    ["跑步瑜伽", ["跑步", "瑜伽"]],
    ["减脂健康", ["减脂", "健康", "睡眠"]]
  ],
  "宠物": [
    ["猫咪护理", ["猫", "猫咪", "猫粮"]],
    ["狗狗护理", ["狗", "狗狗", "狗粮"]],
    ["宠物用品", ["宠物", "用品"]]
  ],
  "汽车": [
    ["买车参考", ["买车", "新能源", "特斯拉"]],
    ["用车保养", ["车险", "保养", "驾驶"]],
    ["自驾路线", ["自驾", "路线"]]
  ],
  "其他": [
    ["待整理", []]
  ]
};

const state = {
  activeTab: "categories",
  notes: [],
  categories: [],
  topics: [],
  noteTopics: [],
  collections: [],
  collectionNotes: [],
  meta: {},
  settings: {},
  filters: {
    query: "",
    categoryId: "",
    topicId: "",
    sort: "collect_desc"
  },
  categoryPageParentId: "",
  noteReturnCategoryId: "",
  expandedCategories: new Set(DEFAULT_CATEGORIES.map(([id]) => id)),
  isImporting: false,
  importStatus: null,
  scanProgress: null,
  activeImportTabId: null,
  stopRequested: false
};

let dbPromise;

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));

function uid(prefix) {
  return `${prefix}-${crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2)}`;
}

function nowIso() {
  return new Date().toISOString();
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function cleanCategoryName(value, fallback = "待整理") {
  return String(value || fallback).trim().replace(/\s+/g, " ").slice(0, 20) || fallback;
}

function normalizeTag(value) {
  return String(value || "")
    .trim()
    .replace(/^#+/, "")
    .replace(/\s+/g, " ")
    .replace(/[，,。.!！?？;；:：]+$/g, "")
    .slice(0, 32);
}

function normalizeTags(value) {
  const rawTags = Array.isArray(value) ? value : String(value || "").split(/[#,\n，、;；/]+/);
  const tags = [];
  for (const rawTag of rawTags) {
    const tag = normalizeTag(rawTag);
    if (tag && tag.length > 1 && !tags.includes(tag)) tags.push(tag);
  }
  return tags.slice(0, 16);
}

function parseCategoryPreferences(value) {
  const names = String(value || "")
    .split(/[\n,，、;；/]+/)
    .map((name) => cleanCategoryName(name, ""))
    .filter(Boolean);
  const unique = [];
  for (const name of names) {
    if (!unique.includes(name) && name !== "其他") unique.push(name);
  }
  unique.push("其他");
  return unique;
}

function rootCategoryPreferenceText() {
  const saved = state.settings[CATEGORY_PREFERENCE_KEY];
  if (saved) return saved;
  const roots = categoryChildren("").map((category) => category.name).filter((name) => name !== "其他");
  if (roots.length) return roots.join("，");
  return DEFAULT_CATEGORIES.map(([, name]) => name).filter((name) => name !== "其他").join("，");
}

function fallbackNoteUrl(id) {
  return id ? `https://www.xiaohongshu.com/explore/${id}` : "";
}

function noteUrlFromRedirect(value, noteId) {
  try {
    const parsed = new URL(value, "https://www.xiaohongshu.com");
    const redirected = parsed.searchParams.get("redirectPath") || parsed.searchParams.get("source");
    if (!redirected) return "";
    return resolveNoteUrl({ id: noteId, url: redirected });
  } catch {
    return "";
  }
}

function resolveNoteUrl(note) {
  const rawUrl = note?.url || "";
  if (rawUrl) {
    try {
      const parsed = new URL(rawUrl, "https://www.xiaohongshu.com");
      const isXhs = parsed.hostname === "www.xiaohongshu.com" || parsed.hostname.endsWith(".xiaohongshu.com");
      if (isXhs && !parsed.pathname.startsWith("/404")) return parsed.toString();
      const redirected = noteUrlFromRedirect(parsed.toString(), note?.id);
      if (redirected) return redirected;
    } catch {
      // Keep moving to the id fallback for legacy or malformed values.
    }
  }

  return fallbackNoteUrl(note?.id);
}

function pageNoteTotal(pageCounts, fallback = 0) {
  const favoriteNotes = Number(pageCounts?.favoriteNotes);
  if (Number.isFinite(favoriteNotes) && favoriteNotes > 0) return favoriteNotes;
  const notes = Number(pageCounts?.notes);
  if (Number.isFinite(notes) && notes > 0) return notes;
  return fallback;
}

function formatYmd(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatYmdHms(date) {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  return `${formatYmd(date)} ${hours}:${minutes}:${seconds}`;
}

function collectTimeSortValue(value, referenceIso = nowIso()) {
  const normalized = String(value || "").trim();
  if (!normalized) return 0;

  const directDate = new Date(normalized);
  if (!Number.isNaN(directDate.getTime())) return directDate.getTime();

  const reference = new Date(referenceIso);
  const base = Number.isNaN(reference.getTime()) ? new Date() : reference;
  const timeParts = normalized.match(/(\d{1,2}):(\d{2})(?::(\d{2}))?/);
  const hours = Number(timeParts?.[1] || 0);
  const minutes = Number(timeParts?.[2] || 0);
  const seconds = Number(timeParts?.[3] || 0);
  const withYear = normalized.match(/^(\d{4})[-/.年](\d{1,2})(?:[-/.月](\d{1,2})日?)?/);
  if (withYear) return new Date(Number(withYear[1]), Number(withYear[2]) - 1, Number(withYear[3] || 1), hours, minutes, seconds).getTime();

  const withoutYear = normalized.match(/^(\d{1,2})[-/.月](\d{1,2})日?/);
  if (withoutYear) return new Date(base.getFullYear(), Number(withoutYear[1]) - 1, Number(withoutYear[2]), hours, minutes, seconds).getTime();

  if (normalized.includes("今天")) return new Date(base.getFullYear(), base.getMonth(), base.getDate(), hours, minutes, seconds).getTime();
  if (normalized.includes("昨天")) return new Date(base.getFullYear(), base.getMonth(), base.getDate() - 1, hours, minutes, seconds).getTime();
  if (normalized.includes("前天")) return new Date(base.getFullYear(), base.getMonth(), base.getDate() - 2, hours, minutes, seconds).getTime();

  const relative = normalized.match(/(\d+)\s*(分钟前|小时前|天前|周前|个月前|年前)/);
  if (relative) {
    const amount = Number(relative[1]);
    const unitMs = {
      "分钟前": 60 * 1000,
      "小时前": 60 * 60 * 1000,
      "天前": 24 * 60 * 60 * 1000,
      "周前": 7 * 24 * 60 * 60 * 1000,
      "个月前": 30 * 24 * 60 * 60 * 1000,
      "年前": 365 * 24 * 60 * 60 * 1000
    }[relative[2]];
    return base.getTime() - amount * unitMs;
  }

  return 0;
}

function noteMetaSegments(note) {
  const segments = [];
  if (note.author) segments.push(note.author);
  const collectTime = Number(note.collect_time_sort) || collectTimeSortValue(note.collect_time, note.updated_at || note.imported_at);
  if (collectTime) {
    segments.push(`收藏于${formatYmdHms(new Date(collectTime))}`);
  }
  return segments;
}

function requestToPromise(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function txDone(tx) {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

function openDb() {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      const notes = db.createObjectStore("notes", { keyPath: "id" });
      notes.createIndex("updated_at", "updated_at");
      notes.createIndex("category_id", "category_id");
      notes.createIndex("removed_at", "removed_at");

      const categories = db.createObjectStore("categories", { keyPath: "id" });
      categories.createIndex("name", "name", { unique: true });
      categories.createIndex("sort_order", "sort_order");

      const topics = db.createObjectStore("topics", { keyPath: "id" });
      topics.createIndex("category_id", "category_id");
      topics.createIndex("name", "name");

      const noteTopics = db.createObjectStore("note_topics", { keyPath: "id" });
      noteTopics.createIndex("note_id", "note_id");
      noteTopics.createIndex("topic_id", "topic_id");

      const collections = db.createObjectStore("collections", { keyPath: "id" });
      collections.createIndex("updated_at", "updated_at");

      const collectionNotes = db.createObjectStore("collection_notes", { keyPath: "id" });
      collectionNotes.createIndex("collection_id", "collection_id");
      collectionNotes.createIndex("note_id", "note_id");

      db.createObjectStore("meta", { keyPath: "key" });
      db.createObjectStore("settings", { keyPath: "key" });
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  return dbPromise;
}

async function getAll(storeName) {
  const db = await openDb();
  return requestToPromise(db.transaction(storeName, "readonly").objectStore(storeName).getAll());
}

async function getOne(storeName, key) {
  const db = await openDb();
  return requestToPromise(db.transaction(storeName, "readonly").objectStore(storeName).get(key));
}

async function putMany(storeName, records) {
  const db = await openDb();
  const tx = db.transaction(storeName, "readwrite");
  const store = tx.objectStore(storeName);
  for (const record of records) store.put(record);
  await txDone(tx);
}

async function deleteOne(storeName, key) {
  const db = await openDb();
  const tx = db.transaction(storeName, "readwrite");
  tx.objectStore(storeName).delete(key);
  await txDone(tx);
}

async function clearStore(storeName) {
  const db = await openDb();
  const tx = db.transaction(storeName, "readwrite");
  tx.objectStore(storeName).clear();
  await txDone(tx);
}

async function seedRootCategories(categoryNames) {
  const timestamp = nowIso();
  const names = parseCategoryPreferences(categoryNames.join("，"));
  await putMany(
    "categories",
    names.map((name, index) => ({
      id: name === "其他" ? "cat-other" : uid("cat"),
      name,
      parent_id: "",
      level: 1,
      sort_order: index,
      is_system: false,
      created_at: timestamp,
      updated_at: timestamp
    }))
  );
}

async function seedDefaults() {
  const existing = await getAll("categories");
  if (existing.length) return;
  const timestamp = nowIso();
  await putMany(
    "categories",
    DEFAULT_CATEGORIES.map(([id, name], index) => ({
      id,
      name,
      parent_id: "",
      level: 1,
      sort_order: index,
      is_system: true,
      created_at: timestamp,
      updated_at: timestamp
    }))
  );
}

function sortCategoryRecords(categories) {
  return categories.sort(
    (a, b) =>
      (a.level ?? 1) - (b.level ?? 1) ||
      String(a.parent_id || "").localeCompare(String(b.parent_id || ""), "zh-Hans-CN") ||
      (a.sort_order ?? 0) - (b.sort_order ?? 0) ||
      a.name.localeCompare(b.name, "zh-Hans-CN")
  );
}

async function normalizeCategoryTree(categories) {
  const byId = new Map(categories.map((category) => [category.id, category]));
  let changed = false;
  const normalized = categories.map((category, index) => {
    const parentId = category.parent_id && byId.has(category.parent_id) ? category.parent_id : "";
    const parent = parentId ? byId.get(parentId) : null;
    const parentLevel = Number(parent?.level || 1);
    const level = Math.min(MAX_CATEGORY_LEVEL, Math.max(1, Number(category.level || (parentId ? parentLevel + 1 : 1))));
    const next = {
      ...category,
      parent_id: parentId,
      level,
      sort_order: Number(category.sort_order ?? index)
    };
    if (next.parent_id !== category.parent_id || next.level !== category.level || next.sort_order !== category.sort_order) changed = true;
    return next;
  });

  if (changed) await putMany("categories", normalized);
  return sortCategoryRecords(normalized);
}

async function loadState() {
  await seedDefaults();
  const [notes, categories, topics, noteTopics, collections, collectionNotes, metaRows, settingsRows] =
    await Promise.all([
      getAll("notes"),
      getAll("categories"),
      getAll("topics"),
      getAll("note_topics"),
      getAll("collections"),
      getAll("collection_notes"),
      getAll("meta"),
      getAll("settings")
    ]);

  state.notes = notes;
  state.categories = await normalizeCategoryTree(categories);
  state.topics = topics.sort((a, b) => a.name.localeCompare(b.name, "zh-Hans-CN"));
  state.noteTopics = noteTopics;
  state.collections = collections.sort((a, b) => String(b.updated_at).localeCompare(String(a.updated_at)));
  state.collectionNotes = collectionNotes;
  state.meta = Object.fromEntries(metaRows.map((row) => [row.key, row.value]));
  state.settings = Object.fromEntries(settingsRows.map((row) => [row.key, row.value]));
}

function activeNotes() {
  return state.notes.filter((note) => !note.removed_at);
}

function categoryById(id) {
  return state.categories.find((category) => category.id === id);
}

function isOtherCategoryId(categoryId) {
  return categoryById(categoryId)?.name === "其他";
}

function categoryParentId(category) {
  return category?.parent_id || "";
}

function categoryLevel(category) {
  return Math.min(MAX_CATEGORY_LEVEL, Math.max(1, Number(category?.level || 1)));
}

function categoryChildren(parentId = "") {
  return state.categories
    .filter((category) => categoryParentId(category) === parentId)
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0) || a.name.localeCompare(b.name, "zh-Hans-CN"));
}

function categoryDescendantIds(categoryId) {
  const ids = [];
  const queue = [categoryId];
  while (queue.length) {
    const currentId = queue.shift();
    for (const child of categoryChildren(currentId)) {
      ids.push(child.id);
      queue.push(child.id);
    }
  }
  return ids;
}

function categoryBranchIds(categoryId) {
  return new Set([categoryId, ...categoryDescendantIds(categoryId)]);
}

function categoryPath(categoryId) {
  const names = [];
  let current = categoryById(categoryId);
  const seen = new Set();
  while (current && !seen.has(current.id)) {
    names.unshift(current.name);
    seen.add(current.id);
    current = categoryById(categoryParentId(current));
  }
  return names.join(" / ");
}

function treeCategoryOptions(selectedId = "", emptyLabel = "未分类") {
  const rows = [`<option value="" ${selectedId ? "" : "selected"}>${escapeHtml(emptyLabel)}</option>`];
  const walk = (parentId = "") => {
    for (const category of categoryChildren(parentId)) {
      const level = categoryLevel(category);
      const prefix = `${"　".repeat(level - 1)}${level > 1 ? "└ " : ""}`;
      rows.push(
        `<option value="${escapeHtml(category.id)}" ${selectedId === category.id ? "selected" : ""}>${prefix}${escapeHtml(category.name)}</option>`
      );
      walk(category.id);
    }
  };
  walk("");
  return rows.join("");
}

function topicById(id) {
  return state.topics.find((topic) => topic.id === id);
}

function topicsForCategory(categoryId) {
  return state.topics.filter((topic) => topic.category_id === categoryId);
}

function topicsForNote(noteId) {
  const topicIds = state.noteTopics.filter((row) => row.note_id === noteId).map((row) => row.topic_id);
  return state.topics.filter((topic) => topicIds.includes(topic.id));
}

function shouldClassifyNote(note) {
  if (!note?.category_id) return true;
  if (!state.noteTopics.some((row) => row.note_id === note.id)) return true;
  return isOtherCategoryId(note.category_id) && !note.is_confirmed;
}

function categoryNoteCount(categoryId) {
  const categoryIds = categoryBranchIds(categoryId);
  return activeNotes().filter((note) => categoryIds.has(note.category_id)).length;
}

function topicNoteCount(topicId) {
  const noteIds = new Set(state.noteTopics.filter((row) => row.topic_id === topicId).map((row) => row.note_id));
  return activeNotes().filter((note) => noteIds.has(note.id)).length;
}

function collectionNoteCount(collectionId) {
  return state.collectionNotes.filter((row) => row.collection_id === collectionId).length;
}

function noteTags(note) {
  return normalizeTags(note?.tags);
}

function noteClassificationText(note) {
  const tags = noteTags(note);
  return [
    note?.title || "",
    note?.author || "",
    note?.source_album || "",
    tags.join(" "),
    tags.map((tag) => `#${tag}`).join(" "),
    tags.join(" ")
  ].join(" ");
}

function scoreKeywords(text, keywords) {
  const lower = text.toLowerCase();
  return keywords.reduce((score, keyword) => score + (lower.includes(keyword.toLowerCase()) ? 1 : 0), 0);
}

function scoreNoteKeywords(note, keywords) {
  const textScore = scoreKeywords(noteClassificationText(note), keywords);
  const tags = noteTags(note).map((tag) => tag.toLowerCase());
  const tagScore = keywords.reduce((score, keyword) => {
    const lowerKeyword = String(keyword).toLowerCase();
    return score + tags.reduce((sum, tag) => sum + (tag === lowerKeyword || tag.includes(lowerKeyword) || lowerKeyword.includes(tag) ? 2 : 0), 0);
  }, 0);
  return textScore + tagScore;
}

function keywordsForCategory(categoryName) {
  const directKeywords = CATEGORY_RULES.find(([name]) => name === categoryName)?.[1] || [categoryName];
  const topicKeywords = (TOPIC_RULES[categoryName] || []).flatMap(([, keywords]) => keywords);
  return Array.from(new Set([categoryName, ...directKeywords, ...topicKeywords].filter(Boolean)));
}

function fallbackClassify(note, allowedCategories = categoryChildren("")) {
  let winner = { category: allowedCategories.find((category) => category.name === "其他")?.name || allowedCategories[0]?.name || "其他", score: 0 };
  for (const category of allowedCategories) {
    const keywords = keywordsForCategory(category.name);
    const score = scoreNoteKeywords(note, keywords);
    if (score > winner.score) winner = { category: category.name, score };
  }

  const topicRules = TOPIC_RULES[winner.category] || TOPIC_RULES["其他"];
  let topic = topicRules[topicRules.length - 1]?.[0] || "待整理";
  let topicScore = 0;
  for (const [name, keywords] of topicRules) {
    const score = scoreNoteKeywords(note, keywords);
    if (score > topicScore) {
      topic = name;
      topicScore = score;
    }
  }

  return {
    note_id: note.id,
    category: winner.category,
    topic,
    confidence: Math.min(0.96, winner.score > 0 ? 0.62 + winner.score * 0.11 + topicScore * 0.05 : 0.42)
  };
}

function tagPriorityClassify(note, allowedCategories = categoryChildren("")) {
  const tags = noteTags(note);
  if (!tags.length) return null;

  let winner = { category: null, score: 0, topic: "" };
  for (const category of allowedCategories.filter((item) => item.name !== "其他")) {
    const categoryName = category.name.toLowerCase();
    const keywords = keywordsForCategory(category.name).map((item) => String(item).toLowerCase());
    let score = 0;
    for (const tag of tags) {
      const lowerTag = tag.toLowerCase();
      if (lowerTag === categoryName || lowerTag.includes(categoryName) || categoryName.includes(lowerTag)) score += 8;
      for (const keyword of keywords) {
        if (lowerTag === keyword || lowerTag.includes(keyword) || keyword.includes(lowerTag)) score += 3;
      }
    }
    if (score > winner.score) winner = { category, score, topic: tags[0] };
  }

  if (!winner.category || winner.score < 3) return null;
  const fallback = fallbackClassify(note, allowedCategories);
  return {
    note_id: note.id,
    category: winner.category.name,
    topic: fallback.category === winner.category.name ? fallback.topic : winner.topic,
    confidence: Math.min(0.96, 0.78 + winner.score * 0.02),
    source: "tag"
  };
}

function decodeJsonText(value) {
  try {
    return JSON.parse(`"${String(value).replace(/"/g, '\\"')}"`);
  } catch {
    return value;
  }
}

function tagsFromText(text) {
  const tags = [];
  const collect = (value) => {
    const tag = normalizeTag(decodeJsonText(value));
    if (tag && tag.length > 1 && !tags.includes(tag)) tags.push(tag);
  };

  for (const match of String(text || "").matchAll(/#\s*([^#<>\s，,。.!！?？;；:："'“”‘’]{2,32})/g)) collect(match[1]);
  for (const match of String(text || "").matchAll(/"tagName"\s*:\s*"((?:\\.|[^"\\]){2,80})"/g)) collect(match[1]);
  for (const match of String(text || "").matchAll(/"tag_name"\s*:\s*"((?:\\.|[^"\\]){2,80})"/g)) collect(match[1]);
  for (const match of String(text || "").matchAll(/"hashtag"\s*:\s*"((?:\\.|[^"\\]){2,80})"/g)) collect(match[1]);

  return tags.slice(0, 16);
}

async function fetchNoteDetailTags(note) {
  const url = resolveNoteUrl(note);
  if (!url) return [];

  const response = await fetch(url, { credentials: "include" });
  if (!response.ok) return [];

  const html = await response.text();
  const tags = new Set(tagsFromText(html));
  const doc = new DOMParser().parseFromString(html, "text/html");
  for (const meta of doc.querySelectorAll("meta[name='keywords'], meta[name='description'], meta[property='og:description']")) {
    for (const tag of tagsFromText(meta.getAttribute("content") || "")) tags.add(tag);
    for (const part of String(meta.getAttribute("content") || "").split(/[,，、;；/]+/)) {
      const tag = normalizeTag(part);
      if (tag && tag.length > 1) tags.add(tag);
    }
  }

  return Array.from(tags).slice(0, 16);
}

async function enrichNotesWithDetailTags(notes, onProgress = null) {
  const changed = [];
  const prepared = notes.map((note) => ({ ...note, tags: noteTags(note) }));
  const missingTagNotes = prepared.filter((note) => !note.tags.length);

  for (let index = 0; index < missingTagNotes.length; index += 4) {
    const chunk = missingTagNotes.slice(index, index + 4);
    onProgress?.({
      phase: "tags",
      done: Math.min(index + chunk.length, missingTagNotes.length),
      total: missingTagNotes.length
    });
    const fetchedTags = await Promise.all(
      chunk.map((note) => fetchNoteDetailTags(note).catch(() => []))
    );

    fetchedTags.forEach((tags, tagIndex) => {
      if (!tags.length) return;
      const note = chunk[tagIndex];
      note.tags = normalizeTags(tags);
      changed.push(note);

      const stateNote = state.notes.find((item) => item.id === note.id);
      if (stateNote) stateNote.tags = note.tags;
    });
  }

  if (changed.length) {
    const records = changed.map((note) => ({
      ...(state.notes.find((item) => item.id === note.id) || note),
      tags: note.tags,
      updated_at: nowIso()
    }));
    await putMany("notes", records);
  }

  return prepared;
}

async function remoteClassify(notes, categories, options = {}) {
  const apiKey = state.settings.ai_api_key;
  const endpoint = state.settings.ai_endpoint || "https://api.openai.com/v1/chat/completions";
  const model = state.settings.ai_model || "gpt-4o-mini";
  if (!apiKey || !endpoint || !model) return null;

  const input = notes.map((note) => ({
    id: note.id,
    title: note.title,
    author: note.author,
    tags: noteTags(note),
    source_album: note.source_album
  }));

  const body = {
    model,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content:
          `你是小红书收藏分类助手。只返回 JSON。一级分类来自用户创建的大类，必须优先尊重这些大类。分类优先级：1 用户创建的大类；2 笔记 tags/话题；3 标题、作者、原始专辑；4 AI 语义判断。${options.allowOther === false ? "本轮不要使用“其他”，必须选择最接近的已有一级分类。" : "只有完全无法判断时才允许归入“其他”。"}输出格式为 {"items":[{"note_id":"...","category":"...","topic":"...","confidence":0.0}]}。confidence 取 0 到 1。`
      },
      {
        role: "user",
        content: JSON.stringify({
          categories: categories.map((item) => item.name),
          notes: input
        })
      }
    ]
  };

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`AI 接口返回 ${response.status}: ${text.slice(0, 140)}`);
  }

  const payload = await response.json();
  const content = payload.choices?.[0]?.message?.content || "{}";
  const parsed = JSON.parse(content);
  return Array.isArray(parsed.items) ? parsed.items : null;
}

async function classifyNotes(notes, onProgress = null, options = {}) {
  const results = [];
  const categories = options.allowOther === false ? categoryChildren("").filter((category) => category.name !== "其他") : categoryChildren("");
  const chunks = [];
  const preparedNotes = await enrichNotesWithDetailTags(notes, onProgress);
  const remainingNotes = [];

  for (const note of preparedNotes) {
    const tagResult = tagPriorityClassify(note, categories);
    if (tagResult) results.push(tagResult);
    else remainingNotes.push(note);
  }

  for (let index = 0; index < remainingNotes.length; index += 25) chunks.push(remainingNotes.slice(index, index + 25));

  for (let index = 0; index < chunks.length; index += 1) {
    const chunk = chunks[index];
    onProgress?.({
      phase: "classify",
      done: Math.min(results.length + index * 25 + chunk.length, preparedNotes.length),
      total: preparedNotes.length
    });
    let chunkResult = null;
    try {
      chunkResult = await remoteClassify(chunk, categories, options);
    } catch (error) {
      showToast(`AI 接口不可用，已使用本地分类：${error.message}`);
    }
    if (!chunkResult) onProgress?.({ phase: "local", done: Math.min(results.length + index * 25 + chunk.length, preparedNotes.length), total: preparedNotes.length });
    const fallbackResults = chunk.map((note) => fallbackClassify(note, categories));
    results.push(...(chunkResult || fallbackResults).map((result, resultIndex) => {
      if (options.allowOther === false && result.category === "其他") return fallbackResults[resultIndex];
      return result;
    }));
  }

  return results;
}

function categoryBranchNotes(categoryId) {
  const ids = categoryBranchIds(categoryId);
  return activeNotes().filter((note) => ids.has(note.category_id));
}

function fallbackSubdivide(note, parentCategory, existingChildren = []) {
  let winner = { child_category: "", topic: "", score: 0 };

  for (const child of existingChildren) {
    const score = scoreNoteKeywords(note, keywordsForCategory(child.name));
    if (score > winner.score) winner = { child_category: child.name, topic: child.name, score };
  }

  for (const [topicName, keywords] of TOPIC_RULES[parentCategory.name] || []) {
    const score = scoreNoteKeywords(note, keywords);
    if (score > winner.score) winner = { child_category: topicName, topic: topicName, score };
  }

  if (winner.child_category) {
    return {
      note_id: note.id,
      child_category: winner.child_category,
      topic: winner.topic,
      confidence: Math.min(0.96, 0.62 + winner.score * 0.1)
    };
  }

  const existingTopic = topicsForNote(note.id).find((topic) => topic.name && topic.name !== "待整理")?.name;
  const album = /小红书|收藏/.test(note.source_album || "") ? "" : note.source_album;
  const tagName = noteTags(note)[0] || "";
  const fallbackName = existingTopic || tagName || album || "待整理";
  return {
    note_id: note.id,
    child_category: fallbackName,
    topic: fallbackName,
    confidence: existingTopic || tagName || album ? 0.58 : 0.38
  };
}

async function remoteSubdivideNotes(notes, parentCategory) {
  const apiKey = state.settings.ai_api_key;
  const endpoint = state.settings.ai_endpoint || "https://api.openai.com/v1/chat/completions";
  const model = state.settings.ai_model || "gpt-4o-mini";
  if (!apiKey || !endpoint || !model) return null;

  const input = notes.map((note) => ({
    id: note.id,
    title: note.title,
    author: note.author,
    tags: noteTags(note),
    source_album: note.source_album,
    current_category: categoryPath(note.category_id)
  }));

  const body = {
    model,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content:
          "你是小红书收藏分类助手。只返回 JSON。把笔记细分到当前父分类下的下一层子分类。优先参考 tags，其次参考标题、作者和原始专辑。可以复用已有子分类，也可以生成新的短子分类名。输出格式为 {\"items\":[{\"note_id\":\"...\",\"child_category\":\"...\",\"topic\":\"...\",\"confidence\":0.0}]}。child_category 不超过 20 个字，confidence 取 0 到 1。"
      },
      {
        role: "user",
        content: JSON.stringify({
          parent_category: categoryPath(parentCategory.id),
          next_level: categoryLevel(parentCategory) + 1,
          existing_children: categoryChildren(parentCategory.id).map((item) => item.name),
          max_child_categories: 12,
          notes: input
        })
      }
    ]
  };

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`AI 接口返回 ${response.status}: ${text.slice(0, 140)}`);
  }

  const payload = await response.json();
  const content = payload.choices?.[0]?.message?.content || "{}";
  const parsed = JSON.parse(content);
  return Array.isArray(parsed.items) ? parsed.items : null;
}

function uniqueChildCategoryName(parentId, rawName) {
  const baseName = cleanCategoryName(rawName);
  const existingChild = state.categories.find((category) => categoryParentId(category) === parentId && category.name === baseName);
  if (existingChild) return baseName;
  if (!state.categories.some((category) => category.name === baseName)) return baseName;

  for (let index = 2; index < 100; index += 1) {
    const suffix = ` ${index}`;
    const candidate = `${baseName.slice(0, 20 - suffix.length)}${suffix}`;
    if (!state.categories.some((category) => category.name === candidate)) return candidate;
  }
  return uid("分类").slice(0, 20);
}

async function findOrCreateChildCategory(parentId, rawName) {
  const parent = categoryById(parentId);
  if (!parent) throw new Error("父分类不存在。");
  const level = categoryLevel(parent) + 1;
  if (level > MAX_CATEGORY_LEVEL) throw new Error(`最多支持 ${MAX_CATEGORY_LEVEL} 级分类。`);

  const cleanName = cleanCategoryName(rawName);
  const existing = state.categories.find((category) => categoryParentId(category) === parentId && category.name === cleanName);
  if (existing) return existing;

  const timestamp = nowIso();
  const category = {
    id: uid("cat"),
    name: uniqueChildCategoryName(parentId, cleanName),
    parent_id: parentId,
    level,
    sort_order: categoryChildren(parentId).length,
    is_system: false,
    created_at: timestamp,
    updated_at: timestamp
  };
  await putMany("categories", [category]);
  state.categories.push(category);
  state.expandedCategories.add(parentId);
  return category;
}

async function applySubcategoryClassifications(parentCategory, results) {
  const timestamp = nowIso();
  const branchIds = categoryBranchIds(parentCategory.id);
  const notesToSave = [];
  const relationsToSave = [];

  for (const result of results) {
    const note = state.notes.find((item) => item.id === result.note_id);
    if (!note || !branchIds.has(note.category_id)) continue;

    const childName = result.child_category && result.child_category !== parentCategory.name ? result.child_category : "待整理";
    const childCategory = await findOrCreateChildCategory(parentCategory.id, childName);
    const topic = await findOrCreateTopic(childCategory.id, result.topic || childCategory.name);
    const confidence = Number(result.confidence || 0);

    await deleteNoteTopicLinks(note.id);
    notesToSave.push({
      ...note,
      category_id: childCategory.id,
      ai_confidence: confidence,
      is_confirmed: confidence >= 0.78,
      removed_at: "",
      updated_at: timestamp
    });
    relationsToSave.push({
      id: `${note.id}:${topic.id}`,
      note_id: note.id,
      topic_id: topic.id,
      confidence,
      is_confirmed: confidence >= 0.78,
      created_at: timestamp,
      updated_at: timestamp
    });
  }

  if (notesToSave.length) await putMany("notes", notesToSave);
  if (relationsToSave.length) await putMany("note_topics", relationsToSave);
  return notesToSave.length;
}

async function subdivideCategoryWithAi(categoryId, triggerButton = null) {
  const parentCategory = categoryById(categoryId);
  if (!parentCategory) return;
  if (categoryLevel(parentCategory) >= MAX_CATEGORY_LEVEL) return showToast(`最多支持 ${MAX_CATEGORY_LEVEL} 级分类。`);

  const notes = categoryBranchNotes(categoryId);
  if (!notes.length) return showToast("这个分类下还没有可细分的笔记。");

  const previousText = triggerButton?.textContent;
  if (triggerButton) {
    triggerButton.disabled = true;
    triggerButton.textContent = "…";
  }

  try {
    const children = categoryChildren(categoryId);
    const results = [];
    for (let index = 0; index < notes.length; index += 25) {
      const chunk = notes.slice(index, index + 25);
      let chunkResult = null;
      try {
        chunkResult = await remoteSubdivideNotes(chunk, parentCategory);
      } catch (error) {
        showToast(`AI 细分不可用，已使用本地规则：${error.message}`);
      }
      results.push(...(chunkResult || chunk.map((note) => fallbackSubdivide(note, parentCategory, children))));
    }

    const movedCount = await applySubcategoryClassifications(parentCategory, results);
    await loadState();
    state.expandedCategories.add(parentCategory.id);
    render();
    showToast(`已细分 ${movedCount} 篇「${parentCategory.name}」下的笔记。`);
  } catch (error) {
    showToast(error.message || String(error));
  } finally {
    if (triggerButton) {
      triggerButton.disabled = false;
      triggerButton.textContent = previousText || "AI";
    }
  }
}

async function findOrCreateTopic(categoryId, name) {
  const cleanName = String(name || "待整理").trim().slice(0, 24) || "待整理";
  const existing = state.topics.find((topic) => topic.category_id === categoryId && topic.name === cleanName);
  if (existing) return existing;

  const timestamp = nowIso();
  const topic = {
    id: uid("topic"),
    category_id: categoryId,
    name: cleanName,
    description: "",
    created_at: timestamp,
    updated_at: timestamp
  };
  await putMany("topics", [topic]);
  state.topics.push(topic);
  return topic;
}

function categoryFromResult(result) {
  return (
    state.categories.find((category) => category.name === result.category) ||
    state.categories.find((category) => category.name === "其他") ||
    state.categories[0]
  );
}

async function applyClassifications(results) {
  const timestamp = nowIso();
  const notesToSave = [];
  const relationsToSave = [];

  for (const result of results) {
    const note = state.notes.find((item) => item.id === result.note_id);
    if (!note) continue;

    const category = categoryFromResult(result);
    const topic = await findOrCreateTopic(category.id, result.topic);
    const confidence = Number(result.confidence || 0);

    notesToSave.push({
      ...note,
      category_id: category.id,
      ai_confidence: confidence,
      is_confirmed: confidence >= 0.78,
      removed_at: "",
      updated_at: timestamp
    });

    relationsToSave.push({
      id: `${note.id}:${topic.id}`,
      note_id: note.id,
      topic_id: topic.id,
      confidence,
      is_confirmed: confidence >= 0.78,
      created_at: timestamp,
      updated_at: timestamp
    });
  }

  if (notesToSave.length) await putMany("notes", notesToSave);
  if (relationsToSave.length) await putMany("note_topics", relationsToSave);
}

const GENERIC_RESCUE_TAGS = new Set(["收藏", "笔记", "小红书", "分享", "干货", "日常", "好物", "推荐", "攻略", "生活", "记录"]);

function otherCategory() {
  return state.categories.find((category) => category.name === "其他");
}

function otherRatio() {
  const total = activeNotes().length;
  const other = otherCategory();
  if (!total || !other) return { total, otherCount: 0, ratio: 0, otherNotes: [] };
  const otherNotes = activeNotes().filter((note) => note.category_id === other.id);
  return { total, otherCount: otherNotes.length, ratio: otherNotes.length / total, otherNotes };
}

async function createRootCategory(rawName) {
  const name = uniqueChildCategoryName("", rawName);
  const existing = state.categories.find((category) => category.name === name && !categoryParentId(category));
  if (existing) return existing;
  const timestamp = nowIso();
  const category = {
    id: uid("cat"),
    name,
    parent_id: "",
    level: 1,
    sort_order: categoryChildren("").length,
    created_at: timestamp,
    updated_at: timestamp
  };
  await putMany("categories", [category]);
  state.categories.push(category);
  return category;
}

async function assignNotesToCategory(notes, category, topicName, confidence = 0.74) {
  const timestamp = nowIso();
  const topic = await findOrCreateTopic(category.id, topicName || category.name);
  await putMany(
    "notes",
    notes.map((note) => ({
      ...note,
      category_id: category.id,
      ai_confidence: confidence,
      is_confirmed: confidence >= 0.78,
      removed_at: "",
      updated_at: timestamp
    }))
  );
  await putMany(
    "note_topics",
    notes.map((note) => ({
      id: `${note.id}:${topic.id}`,
      note_id: note.id,
      topic_id: topic.id,
      confidence,
      is_confirmed: confidence >= 0.78,
      created_at: timestamp,
      updated_at: timestamp
    }))
  );
}

async function rescueOtherNotesIfNeeded(onProgress = null) {
  let summary = { rounds: 0, moved: 0, created: 0 };

  for (let round = 0; round < 2; round += 1) {
    await loadState();
    const stats = otherRatio();
    if (stats.ratio <= 0.3 || stats.otherNotes.length < 10) break;
    summary.rounds += 1;

    onProgress?.({ phase: "rescue", done: round, total: 2, otherCount: stats.otherCount, ratio: stats.ratio });
    const prepared = await enrichNotesWithDetailTags(stats.otherNotes, onProgress);

    const reassigned = await classifyNotes(prepared, onProgress, { allowOther: false });
    await applyClassifications(reassigned);
    await loadState();

    const afterReclassify = otherRatio();
    summary.moved += Math.max(0, stats.otherCount - afterReclassify.otherCount);
    if (afterReclassify.ratio <= 0.3 || afterReclassify.otherNotes.length < 10) break;

    const tagCounts = new Map();
    for (const note of afterReclassify.otherNotes) {
      for (const tag of noteTags(note)) {
        const clean = cleanCategoryName(tag, "");
        if (!clean || clean.length < 2 || GENERIC_RESCUE_TAGS.has(clean)) continue;
        tagCounts.set(clean, (tagCounts.get(clean) || 0) + 1);
      }
    }

    const threshold = Math.max(12, Math.ceil(afterReclassify.otherNotes.length * 0.12));
    const candidates = Array.from(tagCounts.entries())
      .filter(([, count]) => count >= threshold)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    for (const [tag] of candidates) {
      if (state.categories.some((category) => category.name === tag)) continue;
      const matchedNotes = afterReclassify.otherNotes.filter((note) => noteTags(note).includes(tag));
      if (matchedNotes.length < threshold) continue;
      const category = await createRootCategory(tag);
      summary.created += 1;
      summary.moved += matchedNotes.length;
      await assignNotesToCategory(matchedNotes, category, tag, 0.7);
      await loadState();
    }
  }

  return summary;
}

async function getActiveXhsTab() {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  const tab = tabs[0];
  if (!tab?.id || !isFavoriteNotesTabUrl(tab.url || "")) {
    throw new Error("请打开小红书收藏页：个人中心 > 收藏。");
  }
  return tab;
}

function isFavoriteNotesTabUrl(url) {
  try {
    const parsed = new URL(url);
    return (
      parsed.hostname === "www.xiaohongshu.com" &&
      /\/user\/profile\/[A-Za-z0-9_-]+/.test(parsed.pathname) &&
      parsed.searchParams.get("tab") === "fav"
    );
  } catch {
    return false;
  }
}

async function sendToTab(tabId, message) {
  try {
    return await chrome.tabs.sendMessage(tabId, message);
  } catch {
    await chrome.scripting.executeScript({
      target: { tabId },
      files: ["src/content-script.js"]
    });
    return chrome.tabs.sendMessage(tabId, message);
  }
}

async function installPageApiObserver(tabId) {
  await chrome.scripting.executeScript({
    target: { tabId },
    world: "MAIN",
    files: ["src/page-api-observer.js"]
  });
}

function withTimeout(promise, ms, message, onTimeout = null, options = {}) {
  const graceMs = options.graceMs ?? 10000;
  return new Promise((resolve, reject) => {
    let settled = false;
    let graceTimer = null;

    const finish = (callback, value) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeoutTimer);
      clearTimeout(graceTimer);
      callback(value);
    };

    const timeoutTimer = setTimeout(async () => {
      if (settled) return;
      try {
        await onTimeout?.();
      } catch {
        // The original timeout message is clearer for the user.
      }

      graceTimer = setTimeout(() => {
        finish(reject, new Error(message));
      }, graceMs);
    }, ms);

    promise
      .then((result) => {
        if (settled) return;
        if (graceTimer && result?.ok && result.notes?.length) {
          finish(resolve, { ...result, timedOut: true, incomplete: true, stopReason: result.stopReason || "timeout" });
          return;
        }
        if (graceTimer && !result?.ok) {
          finish(reject, new Error(result?.error || message));
          return;
        }
        finish(resolve, result);
      })
      .catch((error) => {
        finish(reject, graceTimer ? new Error(message) : error);
      });
  });
}

function boundedNumber(value, fallback, min, max) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.max(min, Math.min(number, max));
}

function scanTimeoutMs(maxScrolls, waitMs) {
  const estimatedPerStepMs = waitMs + 2200;
  const estimatedMs = 90000 + maxScrolls * estimatedPerStepMs;
  return Math.max(MIN_SCAN_TIMEOUT_MS, Math.min(estimatedMs, MAX_SCAN_TIMEOUT_MS));
}

function progressTitle(count = 0, total = 0) {
  return total > 0 ? `采集中（${count}/${total}）` : `采集中（${count}/?）`;
}

function updateScanProgress(progress) {
  if (!state.isImporting || !state.activeImportTabId) return;
  state.scanProgress = progress;
  const count = Number(progress.count || 0);
  const total = Number(progress.total || 0);
  setImportStatus({
    ...(state.importStatus || {}),
    title: progressTitle(count, total),
    detail: "请保持网页不变动。正在读取收藏…",
    meta: "",
    canStop: true
  });
}

async function importFromCurrentTab(triggerButton = null) {
  if (state.isImporting) {
    showToast("正在刷新中，请等待本次导入完成。");
    return;
  }
  state.isImporting = true;
  setImportStatus({
    title: "准备中",
    detail: "正在连接当前小红书页面",
    meta: "导入期间已暂时锁定侧边栏操作。"
  });
  const importButton = triggerButton || $("#refreshButton");
  const previousText = importButton?.textContent;
  if (importButton) {
    importButton.disabled = true;
    importButton.textContent = "正在刷新…";
  }
  try {
    const tab = await getActiveXhsTab();
    const settings = state.settings;
    const maxScrolls = boundedNumber(settings.max_scrolls, DEFAULT_MAX_SCAN_SCROLLS, 20, 600);
    const fullScan = Boolean(settings.full_scan_missing);
    const waitMs = DEFAULT_SCAN_WAIT_MS;
    const timeoutMs = scanTimeoutMs(maxScrolls, waitMs);
    state.activeImportTabId = tab.id;
    state.stopRequested = false;
    state.scanProgress = null;
    const ping = await sendToTab(tab.id, { type: PING_TYPE });
    await installPageApiObserver(tab.id);
    if (!ping?.isFavoriteNotesPage) {
      throw new Error("请打开小红书收藏页：个人中心 > 收藏。");
    }
    if (!ping?.loggedIn) showToast("未明确检测到登录状态，仍会尝试扫描当前页面。");
    const expectedTotal = Number(ping?.expectedTotal || ping?.pageCounts?.favoriteNotes || ping?.pageCounts?.notes || 0);

    setImportStatus({
      title: progressTitle(0, expectedTotal),
      detail: "请保持网页不变动。正在读取收藏…",
      meta: "",
      canStop: true
    });
    showToast("正在通过接口读取收藏，请保持小红书标签页打开。");
    let result = await withTimeout(
      sendToTab(tab.id, {
        type: API_SCAN_TYPE,
        options: { maxPages: maxScrolls, maxScrolls, waitMs, pageSize: DEFAULT_API_PAGE_SIZE }
      }),
      timeoutMs,
      "接口获取时间较长，已停止采集；如果没有可保存结果，请刷新小红书收藏页后重试。",
      () => sendToTab(tab.id, { type: CANCEL_SCAN_TYPE })
    );
    if (!result?.ok) {
      const apiError = result?.error || "接口抓取不可用。请先在小红书页面打开收藏列表后重试。";
      setImportStatus(null);
      const fallbackConfirmed = confirm(`${apiError}\n\n是否回退到页面采集？页面采集较慢，过程中可以点击“停止采集”。`);
      if (!fallbackConfirmed) throw new Error(apiError);
      state.stopRequested = false;
      setImportStatus({
        title: "采集中",
        detail: "正在回退到页面采集",
        meta: `最多滚动 ${maxScrolls} 次，每屏等待 ${waitMs}ms。`,
        canStop: true
      });
      result = await withTimeout(
        sendToTab(tab.id, { type: SCAN_TYPE, options: { maxScrolls, waitMs } }),
        timeoutMs,
        "页面采集时间过长，已停止本次导入。",
        () => sendToTab(tab.id, { type: CANCEL_SCAN_TYPE })
      );
    }
    if (!result?.ok) throw new Error(result?.error || "扫描失败");
    if (!result.notes.length) throw new Error("当前页面没有识别到收藏笔记卡片。请进入收藏页后重试。");

    setImportStatus({
      title: "导入中",
      detail: `${result.timedOut || result.canceled ? "采集已停止，" : ""}已通过${result.source === "api" ? "接口" : "页面"}采集 ${result.notes.length} 篇，正在写入本地`,
      meta: "正在合并旧记录并保留已确认分类。"
    });
    const timestamp = nowIso();
    const existingById = new Map(state.notes.map((note) => [note.id, note]));
    const scannedIds = new Set(result.notes.map((note) => note.id));
    const importedNotes = result.notes.map((note) => {
      const old = existingById.get(note.id);
      const collectTime = note.collect_time || old?.collect_time || "";
      const tags = normalizeTags(note.tags?.length ? note.tags : old?.tags);
      return {
        ...old,
        ...note,
        tags,
        collect_time: collectTime,
        collect_time_sort: collectTime ? collectTimeSortValue(collectTime, timestamp) : old?.collect_time_sort || 0,
        source_album: note.source_album || old?.source_album || "小红书收藏",
        category_id: old?.category_id || "",
        ai_confidence: old?.ai_confidence || 0,
        is_confirmed: Boolean(old?.is_confirmed),
        removed_at: "",
        created_at: old?.created_at || timestamp,
        updated_at: timestamp
      };
    });

    const newNotes = importedNotes.filter((note) => {
      const old = existingById.get(note.id);
      if (!old) return true;
      return shouldClassifyNote(old);
    });
    await putMany("notes", importedNotes);

    const remoteNoteTotal = pageNoteTotal(result.pageCounts, result.notes.length);
    const isIncompleteScan = Boolean(result.incomplete || (remoteNoteTotal && result.notes.length < remoteNoteTotal && !result.reachedBottom));

    if (fullScan && !isIncompleteScan) {
      const removed = state.notes
        .filter((note) => !note.removed_at && !scannedIds.has(note.id))
        .map((note) => ({ ...note, removed_at: timestamp, updated_at: timestamp }));
      if (removed.length) await putMany("notes", removed);
    }

    await putMany("meta", [
      { key: "last_sync_time", value: timestamp },
      { key: "last_scan_count", value: result.notes.length },
      { key: "last_scan_url", value: result.url },
      { key: "last_scan_source", value: result.source || "dom" },
      { key: "last_scan_complete", value: !isIncompleteScan },
      { key: "remote_total_notes", value: remoteNoteTotal },
      { key: "remote_total_favorites", value: result.pageCounts?.favoriteNotes || result.pageCounts?.notes || "" },
      { key: "remote_total_albums", value: result.pageCounts?.albums || "" },
      { key: "remote_total_files", value: result.pageCounts?.files || "" }
    ]);

    await loadState();
    renderStats();
    if (newNotes.length) {
      setImportStatus({
        title: "整理中",
        detail: `正在整理 ${newNotes.length} 篇新增或待分类笔记`,
        meta: "会先读取笔记关键词，再写入分类结果。"
      });
      const classifications = await classifyNotes(newNotes, (progress) => {
        if (progress.phase === "tags") {
          setImportStatus({
            title: "整理中",
            detail: `正在读取笔记关键词 ${progress.done}/${progress.total}`,
            meta: "关键词越完整，分类越准确。"
          });
          return;
        }
        if (progress.phase === "rescue") {
          setImportStatus({
            title: "整理中",
            detail: `正在重新整理“其他”分类`,
            meta: `当前“其他”占比 ${Math.round((progress.ratio || 0) * 100)}%，正在第 ${progress.done + 1}/${progress.total} 轮优化。`
          });
          return;
        }
        if (progress.phase === "local") {
          setImportStatus({
            title: "整理中",
            detail: `正在使用本地规则分类 ${progress.done}/${progress.total}`,
            meta: "未检测到可用 AI 分类时，会先按用户大类和笔记关键词归类。"
          });
          return;
        }
        setImportStatus({
          title: "整理中",
          detail: `正在写入分类 ${progress.done}/${progress.total}`,
          meta: "分类完成后会自动刷新统计。"
        });
      });
      await applyClassifications(classifications);
      await loadState();
      const rescueSummary = await rescueOtherNotesIfNeeded((progress) => {
        if (progress.phase === "tags") {
          setImportStatus({
            title: "整理中",
            detail: `正在读取“其他”笔记关键词 ${progress.done}/${progress.total}`,
            meta: "会用关键词和用户大类再次尝试归类。"
          });
          return;
        }
        if (progress.phase === "rescue") {
          setImportStatus({
            title: "整理中",
            detail: "正在优化“其他”分类",
            meta: `当前“其他”占比 ${Math.round((progress.ratio || 0) * 100)}%，第 ${progress.done + 1}/${progress.total} 轮。`
          });
          return;
        }
        if (progress.phase === "local") {
          setImportStatus({
            title: "整理中",
            detail: `正在用本地规则重分 ${progress.done}/${progress.total}`,
            meta: "会尽量放入用户已有大类，减少“其他”。"
          });
        }
      });
      if (rescueSummary.moved || rescueSummary.created) await loadState();
    }

    setImportStatus({
      title: "完成中",
      detail: "正在刷新统计和列表",
      meta: "马上就好。"
    });
    await putMany("meta", [{ key: "local_total_notes", value: activeNotes().length }]);
    await loadState();
    render();
    const remoteTotal = remoteNoteTotal;
    const totalText = remoteTotal ? `页面共 ${remoteTotal} 篇，` : "";
    const incompleteText =
      result.timedOut || result.canceled
        ? "采集已停止，已保存本次采到的部分结果，并保留旧数据。"
        : isIncompleteScan
          ? "扫描未完整到底，已保留旧数据；请提高滚动次数后重试。"
          : "";
    showToast(`${totalText}本次识别 ${result.notes.length} 篇，其中新增/待分类 ${newNotes.length} 篇。${incompleteText}`);
  } catch (error) {
    showToast(error.message || String(error));
  } finally {
    state.isImporting = false;
    state.activeImportTabId = null;
    state.stopRequested = false;
    state.scanProgress = null;
    setImportStatus(null);
    if (importButton) {
      importButton.disabled = false;
      importButton.textContent = previousText || "刷新收藏";
    }
  }
}

function renderStats() {
  const localTotal = activeNotes().length;
  const remoteTotal = Number(state.meta.remote_total_notes || 0);
  $("#totalNotes").textContent = String(remoteTotal || localTotal);
  $("#totalCategories").textContent = String(categoryChildren("").length);
  $("#totalTopics").textContent = String(state.categories.filter((category) => categoryLevel(category) > 1).length);

  if (state.importStatus) {
    $("#syncSummary").textContent = `${state.importStatus.title}：${state.importStatus.detail}`;
    return;
  }

  const lastSync = state.meta.last_sync_time ? new Date(state.meta.last_sync_time).toLocaleString("zh-CN") : "";
  const recognizedText = localTotal ? `，已识别 ${localTotal} 篇收藏笔记` : "";
  const scanText = state.meta.last_scan_complete === false ? "，上次扫描未完整到底" : "";
  $("#syncSummary").textContent = lastSync ? `上次同步 ${lastSync}${recognizedText}${scanText}` : "本地优先，等待导入";
}

function previousCategoryPageId(categoryId) {
  const category = categoryById(categoryId);
  return category ? categoryParentId(category) : "";
}

function enterCategory(categoryId) {
  const category = categoryById(categoryId);
  if (!category) return;
  if (categoryChildren(categoryId).length && categoryLevel(category) < MAX_CATEGORY_LEVEL) {
    state.activeTab = "categories";
    state.categoryPageParentId = categoryId;
    render();
    return;
  }
  openCategoryNotes(categoryId);
}

function openCategoryPage(categoryId = "") {
  state.activeTab = "categories";
  state.categoryPageParentId = categoryById(categoryId) ? categoryId : "";
  state.filters.query = "";
  state.filters.categoryId = "";
  state.filters.topicId = "";
  state.noteReturnCategoryId = "";
  render();
}

function renderCategoryNode(category) {
  const level = categoryLevel(category);
  const children = categoryChildren(category.id);
  const hasVisibleChildren = children.length > 0 && level < MAX_CATEGORY_LEVEL;
  const subtitle = hasVisibleChildren ? `${children.length} 个子分类 · ${categoryNoteCount(category.id)} 篇` : `${categoryNoteCount(category.id)} 篇笔记`;

  return `
    <article class="category-row" style="--category-indent:0px">
      <div class="category-header">
        <button class="category-title" data-action="enter-category" data-category-id="${category.id}">
          <strong>${escapeHtml(category.name)}</strong>
          <small>${escapeHtml(subtitle)}</small>
        </button>
        <div class="category-actions">
          <button class="count-pill category-count" title="${hasVisibleChildren ? "进入下级分类" : "查看该分类笔记"}" data-action="enter-category" data-category-id="${category.id}">${categoryNoteCount(category.id)}</button>
          ${
            level < MAX_CATEGORY_LEVEL
              ? `<button class="icon-button compact ai-button" title="AI 细分该分类下的笔记" data-action="subdivide-category-ai" data-category-id="${category.id}">AI</button>
                <button class="icon-button compact" title="新增子分类" data-action="add-child-category" data-category-id="${category.id}">＋</button>`
              : ""
          }
          <button class="icon-button compact" title="重命名分类" data-action="rename-category" data-category-id="${category.id}">✎</button>
          <button class="icon-button compact danger" title="删除分类" data-action="delete-category" data-category-id="${category.id}">×</button>
        </div>
      </div>
    </article>
  `;
}

function renderCategories() {
  const view = $("#categoriesView");
  if (!state.categories.length) {
    view.innerHTML = `<div class="empty-state">暂无分类</div>`;
    return;
  }

  const parentId = categoryById(state.categoryPageParentId) ? state.categoryPageParentId : "";
  state.categoryPageParentId = parentId;
  const parentCategory = categoryById(parentId);
  const categories = categoryChildren(parentId);
  const backParentId = previousCategoryPageId(parentId);
  const headerHtml = parentCategory
    ? `<div class="scope-header">
        <button class="icon-button" title="返回上一层" data-action="open-category-page" data-category-id="${escapeHtml(backParentId)}">←</button>
        <strong>${escapeHtml(parentCategory.name)}</strong>
      </div>`
    : "";

  view.innerHTML = `
    ${headerHtml}
    <div class="toolbar ${parentCategory ? "stacked" : ""}">
      <button class="button primary" data-action="add-category-to-page">新增分类</button>
      ${parentCategory ? "" : `<button class="button" data-action="organize-all">整理未分类</button>`}
    </div>
    <div class="list category-tree">
      ${categories.length ? categories.map(renderCategoryNode).join("") : `<div class="empty-state">暂无下级分类</div>`}
    </div>
  `;
}

function openCategoryNotes(categoryId) {
  state.activeTab = "notes";
  state.filters.query = "";
  state.filters.categoryId = categoryId;
  state.filters.topicId = "";
  state.filters.sort = "collect_desc";
  state.noteReturnCategoryId = previousCategoryPageId(categoryId);
  render();
  const category = categoryById(categoryId);
  showToast(`正在显示 ${category ? categoryPath(category.id) : "该分类"} 下的笔记。`);
}

function openTopicNotes(topicId) {
  const topic = topicById(topicId);
  if (!topic) return;
  state.activeTab = "notes";
  state.filters.query = "";
  state.filters.categoryId = topic.category_id;
  state.filters.topicId = topicId;
  state.filters.sort = "collect_desc";
  state.noteReturnCategoryId = previousCategoryPageId(topic.category_id);
  render();
  const category = categoryById(topic.category_id);
  showToast(`正在显示 ${category?.name || "分类"} / ${topic.name} 下的笔记。`);
}

function clearNoteScope() {
  state.activeTab = "categories";
  state.categoryPageParentId = state.noteReturnCategoryId || "";
  state.filters.categoryId = "";
  state.filters.topicId = "";
  state.noteReturnCategoryId = "";
  render();
}

function currentScopeLabel() {
  const topic = state.filters.topicId ? topicById(state.filters.topicId) : null;
  const category = categoryById(state.filters.categoryId || topic?.category_id);
  if (category && topic) return `${category.name} / ${topic.name}`;
  if (category) return categoryPath(category.id);
  if (topic) return topic.name;
  return "";
}

function filteredNotes() {
  const query = state.filters.query.trim().toLowerCase();
  const topicNoteIds = state.filters.topicId
    ? new Set(state.noteTopics.filter((row) => row.topic_id === state.filters.topicId).map((row) => row.note_id))
    : null;

  return activeNotes()
    .filter((note) => {
      const matchesQuery =
        !query ||
        [note.title, note.author, note.collect_time, note.source_album, categoryById(note.category_id)?.name, ...topicsForNote(note.id).map((topic) => topic.name)]
          .concat(noteTags(note))
          .join(" ")
          .toLowerCase()
          .includes(query);
      const matchesCategory = !state.filters.categoryId || categoryBranchIds(state.filters.categoryId).has(note.category_id);
      const matchesTopic = !topicNoteIds || topicNoteIds.has(note.id);
      return matchesQuery && matchesCategory && matchesTopic;
    })
    .sort((a, b) => {
      if (state.filters.sort === "title_asc") return String(a.title).localeCompare(String(b.title), "zh-Hans-CN");
      const aTime = Number(a.collect_time_sort) || collectTimeSortValue(a.collect_time, a.updated_at || a.imported_at);
      const bTime = Number(b.collect_time_sort) || collectTimeSortValue(b.collect_time, b.updated_at || b.imported_at);
      if (aTime !== bTime) return bTime - aTime;
      return String(a.title || "").localeCompare(String(b.title || ""), "zh-Hans-CN");
    });
}

function renderNoteCard(note) {
  const meta = noteMetaSegments(note);
  const categoryOptions = treeCategoryOptions(note.category_id || "");
  return `
    <article class="note-row" data-note-id="${note.id}">
      ${
        note.cover
          ? `<img class="note-cover" src="${escapeHtml(note.cover)}" alt="">`
          : `<div class="note-cover placeholder">书</div>`
      }
      <div class="note-content">
        <strong title="${escapeHtml(note.title)}">${escapeHtml(note.title || "未命名笔记")}</strong>
        ${meta.length ? `<div class="note-meta">${meta.map(escapeHtml).join(" · ")}</div>` : ""}
        <div class="row-actions">
          <select class="select note-category-select" data-role="note-category" data-note-id="${escapeHtml(note.id)}" title="移动分类" aria-label="移动分类">
            ${categoryOptions}
          </select>
          <button class="button" data-action="open-note" data-note-id="${note.id}">查看</button>
        </div>
      </div>
    </article>
  `;
}

function renderNoteList() {
  const list = $("#notesList");
  if (!list) return;
  const notes = filteredNotes();
  list.innerHTML = notes.length ? notes.map(renderNoteCard).join("") : `<div class="empty-state">暂无匹配收藏</div>`;
}

function renderNotes() {
  const view = $("#notesView");
  const isScoped = Boolean(state.filters.categoryId || state.filters.topicId);
  const scopeLabel = currentScopeLabel();

  view.innerHTML = `
    <div class="scope-header">
      <button class="icon-button" title="返回上一层" data-action="${isScoped ? "clear-note-scope" : "open-categories"}">←</button>
      <strong>${escapeHtml(scopeLabel || "收藏笔记")}</strong>
    </div>
    <div class="toolbar stacked">
      <input id="searchInput" class="field" type="search" placeholder="搜索标题、作者、分类、收藏时间" value="${escapeHtml(state.filters.query)}">
    </div>
    <div id="notesList" class="list"></div>
  `;

  renderNoteList();
}

function renderCollections() {
  const view = $("#collectionsView");
  view.innerHTML = `
    <div class="toolbar stacked">
      <input id="collectionName" class="field" placeholder="收藏夹名称，例如 2027东京自由行">
      <textarea id="collectionDescription" class="textarea" placeholder="描述"></textarea>
      <button class="button primary" data-action="create-collection">创建收藏夹</button>
    </div>
    <div class="list">
      ${
        state.collections.length
          ? state.collections
              .map(
                (collection) => `
                  <article class="collection-row">
                    <div>
                      <strong>${escapeHtml(collection.name)}</strong>
                      <p>${escapeHtml(collection.description || "项目空间")} · ${collectionNoteCount(collection.id)} 篇</p>
                    </div>
                    <div class="row-actions">
                      <button class="icon-button" title="查看收藏夹" data-action="view-collection" data-collection-id="${collection.id}">◎</button>
                      <button class="icon-button" title="编辑收藏夹" data-action="rename-collection" data-collection-id="${collection.id}">✎</button>
                      <button class="icon-button" title="删除收藏夹" data-action="delete-collection" data-collection-id="${collection.id}">×</button>
                    </div>
                  </article>
                `
              )
              .join("")
          : `<div class="empty-state">还没有用户收藏夹</div>`
      }
    </div>
  `;
}

function renderSettings() {
  const view = $("#settingsView");
  const maxScrolls = boundedNumber(state.settings.max_scrolls, DEFAULT_MAX_SCAN_SCROLLS, 20, 600);
  const fullScanMissing = Boolean(state.settings.full_scan_missing);
  view.innerHTML = `
    <div class="scope-header">
      <button class="icon-button" title="返回分类" data-action="open-categories">←</button>
      <strong>设置</strong>
    </div>
    <section class="settings-block">
      <h2>刷新</h2>
      <div class="form-grid">
        <button id="refreshButton" class="button primary" data-action="refresh-import">刷新收藏</button>
      </div>
      <p>从当前小红书页面重新扫描并更新本地收藏。</p>
    </section>
    <section class="settings-block">
      <h2>同步策略</h2>
      <div class="form-grid">
        <label class="field-label" for="maxScrolls">最大采集触发次数</label>
        <input id="maxScrolls" class="field" type="number" min="20" max="600" step="20" value="${escapeHtml(maxScrolls)}">
        <label class="checkbox-row">
          <input id="fullScanMissing" type="checkbox" ${fullScanMissing ? "checked" : ""}>
          <span>完整扫描到底后，把未再出现的旧笔记标记为已移除</span>
        </label>
        <button class="button primary" data-action="save-sync-settings">保存同步设置</button>
      </div>
      <p>接口抓取依赖当前小红书页面的登录态和真实收藏接口；请先打开收藏列表再刷新。</p>
    </section>
    <section class="settings-block">
      <h2>清空重新导入</h2>
      <div class="form-grid">
        <button class="button danger" data-action="clear-and-reimport">清空所有数据重新导入</button>
      </div>
      <p>会清空本地笔记、分类、主题、收藏夹和同步统计，然后重新导入当前页面。</p>
      <p>开始前会先确认你的一级大类偏好，并按偏好标签重新分类。</p>
    </section>
    <section class="settings-block">
      <h2>AI 分类</h2>
      <div class="form-grid">
        <input id="aiEndpoint" class="field" placeholder="https://api.openai.com/v1/chat/completions" value="${escapeHtml(state.settings.ai_endpoint || "")}">
        <input id="aiModel" class="field" placeholder="模型名，例如 gpt-4o-mini" value="${escapeHtml(state.settings.ai_model || "")}">
        <input id="aiKey" class="field" type="password" placeholder="API Key，留空则使用本地分类" value="${escapeHtml(state.settings.ai_api_key || "")}">
        <button class="button primary" data-action="save-settings">保存设置</button>
      </div>
      <p>API Key 仅保存在本机浏览器 IndexedDB。</p>
    </section>
  `;
}

function render() {
  renderStats();
  $$(".tab").forEach((tab) => tab.classList.toggle("active", tab.dataset.tab === state.activeTab));
  $("#settingsButton")?.classList.toggle("active", state.activeTab === "settings");
  $$(".view").forEach((view) => view.classList.remove("active-view"));
  $(`#${state.activeTab}View`)?.classList.add("active-view");
  renderCategories();
  renderNotes();
  renderCollections();
  renderSettings();
}

function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("visible");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("visible"), 3200);
}

function setImportStatus(status = null) {
  state.importStatus = status;
  const overlay = $("#busyOverlay");
  if (overlay) {
    overlay.hidden = !status;
    document.body.classList.toggle("is-busy", Boolean(status));
    if (status) {
      $("#busyTitle").textContent = status.title || "处理中";
      $("#busyDetail").textContent = status.detail || "正在处理收藏数据。";
      $("#busyMeta").textContent = status.meta || "请不要关闭侧边栏。";
      const stopButton = $("#stopScanButton");
      if (stopButton) {
        stopButton.hidden = !status.canStop;
        stopButton.disabled = Boolean(status.stopDisabled);
        stopButton.textContent = status.stopText || "停止采集";
      }
    }
  }
  renderStats();
}

async function stopPageScan() {
  if (!state.isImporting || !state.activeImportTabId || state.stopRequested) return;
  state.stopRequested = true;
  setImportStatus({
    title: "停止中",
    detail: "正在停止当前采集",
    meta: "已发送停止请求，等待当前滚动步骤结束。",
    canStop: true,
    stopDisabled: true,
    stopText: "停止中…"
  });
  try {
    await sendToTab(state.activeImportTabId, { type: CANCEL_SCAN_TYPE });
  } catch (error) {
    showToast(error.message || String(error));
  }
}

async function addCategory(parentId = "") {
  const parent = parentId ? categoryById(parentId) : null;
  const parentLevel = parent ? categoryLevel(parent) : 0;
  if (parentLevel >= MAX_CATEGORY_LEVEL) return showToast(`最多支持 ${MAX_CATEGORY_LEVEL} 级分类。`);
  const level = parentLevel + 1;
  const name = prompt(parent ? `在「${parent.name}」下新增 ${level} 级分类` : "新增 1 级分类");
  if (!name?.trim()) return;
  const timestamp = nowIso();
  const cleanName = name.trim().slice(0, 20);
  await putMany("categories", [
    {
      id: uid("cat"),
      name: cleanName,
      parent_id: parentId,
      level,
      sort_order: categoryChildren(parentId).length,
      is_system: false,
      created_at: timestamp,
      updated_at: timestamp
    }
  ]);
  await loadState();
  if (parentId) state.expandedCategories.add(parentId);
  render();
}

async function renameCategory(id) {
  const category = categoryById(id);
  if (!category) return;
  const name = prompt("新的分类名称", category.name);
  if (!name?.trim()) return;
  await putMany("categories", [{ ...category, name: name.trim().slice(0, 20), updated_at: nowIso() }]);
  await loadState();
  render();
}

async function deleteCategory(id) {
  const category = categoryById(id);
  if (!category) return;
  if (category.name === "其他") return showToast("其他分类会作为兜底分类，暂不删除。");
  if (categoryChildren(id).length) return showToast("该分类下还有子分类，请先移动或删除子分类。");
  if (categoryNoteCount(id) > 0) return showToast("该分类下还有笔记，请先重新归类后再删除。");
  await deleteOne("categories", id);
  await loadState();
  render();
}

async function renameTopic(id) {
  const topic = topicById(id);
  if (!topic) return;
  const name = prompt("新的二级主题名称", topic.name);
  if (!name?.trim()) return;
  await putMany("topics", [{ ...topic, name: name.trim().slice(0, 24), updated_at: nowIso() }]);
  await loadState();
  render();
}

async function organizeAllUnclassified() {
  const targets = activeNotes().filter(shouldClassifyNote);
  if (!targets.length) return showToast("没有需要整理的笔记。");
  const results = await classifyNotes(targets);
  await applyClassifications(results);
  await loadState();
  render();
  showToast(`已整理 ${targets.length} 篇笔记。`);
}

async function deleteNoteTopicLinks(noteId) {
  const links = state.noteTopics.filter((row) => row.note_id === noteId);
  for (const link of links) await deleteOne("note_topics", link.id);
}

async function moveNoteCategory(noteId, categoryId) {
  const note = state.notes.find((item) => item.id === noteId);
  if (!note) return;
  const targetCategory = categoryId ? categoryById(categoryId) : null;
  if (categoryId && !targetCategory) return showToast("目标分类不存在。");
  if ((note.category_id || "") === categoryId) return;

  const timestamp = nowIso();
  await deleteNoteTopicLinks(noteId);
  await putMany("notes", [
    {
      ...note,
      category_id: categoryId,
      ai_confidence: categoryId ? 1 : 0,
      is_confirmed: Boolean(categoryId),
      updated_at: timestamp
    }
  ]);

  if (targetCategory) {
    const topic = await findOrCreateTopic(targetCategory.id, "待整理");
    await putMany("note_topics", [
      {
        id: `${note.id}:${topic.id}`,
        note_id: note.id,
        topic_id: topic.id,
        confidence: 1,
        is_confirmed: true,
        created_at: timestamp,
        updated_at: timestamp
      }
    ]);
  }

  await loadState();
  render();
  showToast(targetCategory ? `已移动到 ${targetCategory.name}。` : "已移至未分类。");
}

function openNoteDialog(noteId) {
  const note = state.notes.find((item) => item.id === noteId);
  if (!note) return;
  const collectionOptions = state.collections
    .map((collection) => `<option value="${collection.id}">${escapeHtml(collection.name)}</option>`)
    .join("");

  $("#noteDialogContent").innerHTML = `
    <h2>${escapeHtml(note.title || "未命名笔记")}</h2>
    <div class="form-grid" style="margin-top:12px">
      <select id="dialogCollection" class="select">
        <option value="">选择收藏夹</option>
        ${collectionOptions}
      </select>
      <button class="button" type="button" data-action="add-note-to-collection" data-note-id="${note.id}">添加到收藏夹</button>
      <button class="button primary" type="button" data-action="open-original" data-note-id="${note.id}">打开原笔记</button>
    </div>
  `;
  $("#noteDialog").showModal();
}

async function addNoteToCollection(noteId) {
  const collectionId = $("#dialogCollection")?.value;
  if (!collectionId) return showToast("请先选择收藏夹。");
  const timestamp = nowIso();
  await putMany("collection_notes", [
    {
      id: `${collectionId}:${noteId}`,
      collection_id: collectionId,
      note_id: noteId,
      created_at: timestamp,
      updated_at: timestamp
    }
  ]);
  await loadState();
  render();
  showToast("已添加到收藏夹。");
}

async function createCollection() {
  const name = $("#collectionName")?.value.trim();
  const description = $("#collectionDescription")?.value.trim();
  if (!name) return showToast("请输入收藏夹名称。");
  const timestamp = nowIso();
  await putMany("collections", [
    {
      id: uid("collection"),
      name: name.slice(0, 32),
      description: description.slice(0, 120),
      created_at: timestamp,
      updated_at: timestamp
    }
  ]);
  await loadState();
  render();
}

async function renameCollection(id) {
  const collection = state.collections.find((item) => item.id === id);
  if (!collection) return;
  const name = prompt("收藏夹名称", collection.name);
  if (!name?.trim()) return;
  await putMany("collections", [{ ...collection, name: name.trim().slice(0, 32), updated_at: nowIso() }]);
  await loadState();
  render();
}

async function deleteCollection(id) {
  await deleteOne("collections", id);
  const links = state.collectionNotes.filter((row) => row.collection_id === id);
  for (const link of links) await deleteOne("collection_notes", link.id);
  await loadState();
  render();
}

function viewCollection(id) {
  const noteIds = new Set(state.collectionNotes.filter((row) => row.collection_id === id).map((row) => row.note_id));
  state.activeTab = "notes";
  state.filters.query = "";
  state.filters.categoryId = "";
  state.filters.topicId = "";
  render();
  const view = $("#notesView .list");
  const notes = activeNotes().filter((note) => noteIds.has(note.id));
  view.innerHTML = notes.length ? notes.map(renderNoteCard).join("") : `<div class="empty-state">这个收藏夹还没有笔记</div>`;
}

async function saveAiSettings() {
  await putMany("settings", [
    { key: "ai_endpoint", value: $("#aiEndpoint").value.trim() },
    { key: "ai_model", value: $("#aiModel").value.trim() },
    { key: "ai_api_key", value: $("#aiKey").value.trim() }
  ]);
  await loadState();
  render();
  showToast("AI 设置已保存。");
}

async function saveSyncSettings() {
  await putMany("settings", [
    { key: "max_scrolls", value: boundedNumber($("#maxScrolls").value, DEFAULT_MAX_SCAN_SCROLLS, 20, 600) },
    { key: "full_scan_missing", value: Boolean($("#fullScanMissing").checked) }
  ]);
  await loadState();
  render();
  showToast("同步设置已保存。");
}

async function clearLocalData(rootCategoryNames = null) {
  for (const storeName of LOCAL_DATA_STORES) await clearStore(storeName);
  if (rootCategoryNames?.length) {
    await seedRootCategories(rootCategoryNames);
  } else {
    await seedDefaults();
  }
  await loadState();
  render();
}

async function clearAndReimport() {
  const preferenceInput = prompt(
    "先输入你偏好的多个大类名称，用逗号或换行分隔。重新导入会优先按这些大类给笔记分类。",
    rootCategoryPreferenceText()
  );
  if (preferenceInput === null) return;

  const rootCategoryNames = parseCategoryPreferences(preferenceInput);
  if (rootCategoryNames.length <= 1) return showToast("请至少输入 1 个大类名称。");

  const confirmed = confirm(
    `将清空本地笔记、分类、主题、收藏夹和同步统计，并按这些一级分类重新导入：\n\n${rootCategoryNames.join("、")}\n\n设置会保留。继续吗？`
  );
  if (!confirmed) return;
  await putMany("settings", [{ key: CATEGORY_PREFERENCE_KEY, value: rootCategoryNames.filter((name) => name !== "其他").join("，") }]);
  await clearLocalData(rootCategoryNames);
  showToast("本地数据已清空，开始重新导入。");
  await importFromCurrentTab();
}

document.addEventListener("click", async (event) => {
  const tabButton = event.target.closest(".tab");
  if (tabButton) {
    state.activeTab = tabButton.dataset.tab;
    render();
    return;
  }

  const actionElement = event.target.closest("[data-action]");
  if (!actionElement) return;
  const { action, categoryId, topicId, noteId, collectionId } = actionElement.dataset;

  if (action === "toggle-category") {
    state.expandedCategories.has(categoryId) ? state.expandedCategories.delete(categoryId) : state.expandedCategories.add(categoryId);
    renderCategories();
  }
  if (action === "enter-category") enterCategory(categoryId);
  if (action === "open-category-notes") openCategoryNotes(categoryId);
  if (action === "open-topic-notes") openTopicNotes(topicId);
  if (action === "open-categories") openCategoryPage(state.categoryPageParentId);
  if (action === "open-category-page") openCategoryPage(categoryId);
  if (action === "clear-note-scope") clearNoteScope();
  if (action === "add-category") await addCategory();
  if (action === "add-category-to-page") await addCategory(state.categoryPageParentId);
  if (action === "add-child-category") await addCategory(categoryId);
  if (action === "subdivide-category-ai") await subdivideCategoryWithAi(categoryId, actionElement);
  if (action === "rename-category") await renameCategory(categoryId);
  if (action === "delete-category") await deleteCategory(categoryId);
  if (action === "rename-topic") await renameTopic(topicId);
  if (action === "organize-all") await organizeAllUnclassified();
  if (action === "open-note") {
    const note = state.notes.find((item) => item.id === noteId);
    const targetUrl = resolveNoteUrl(note);
    if (targetUrl) chrome.tabs.create({ url: targetUrl });
  }
  if (action === "create-collection") await createCollection();
  if (action === "rename-collection") await renameCollection(collectionId);
  if (action === "delete-collection") await deleteCollection(collectionId);
  if (action === "view-collection") viewCollection(collectionId);
  if (action === "add-note-to-collection") await addNoteToCollection(noteId);
  if (action === "open-original") {
    const note = state.notes.find((item) => item.id === noteId);
    const targetUrl = resolveNoteUrl(note);
    if (targetUrl) chrome.tabs.create({ url: targetUrl });
  }
  if (action === "refresh-import") await importFromCurrentTab(actionElement);
  if (action === "stop-page-scan") await stopPageScan();
  if (action === "save-settings") await saveAiSettings();
  if (action === "save-sync-settings") await saveSyncSettings();
  if (action === "clear-and-reimport") await clearAndReimport();
});

document.addEventListener("input", (event) => {
  if (event.target.id === "searchInput") {
    state.filters.query = event.target.value;
    renderNoteList();
  }
});

document.addEventListener("change", async (event) => {
  const noteCategorySelect = event.target.closest("[data-role='note-category']");
  if (noteCategorySelect) {
    await moveNoteCategory(noteCategorySelect.dataset.noteId, noteCategorySelect.value);
    return;
  }
});

$("#settingsButton").addEventListener("click", () => {
  state.activeTab = state.activeTab === "settings" ? "categories" : "settings";
  render();
});

chrome.runtime.onMessage.addListener((message, sender) => {
  if (message?.type !== SCAN_PROGRESS_TYPE) return false;
  if (state.activeImportTabId && sender?.tab?.id && sender.tab.id !== state.activeImportTabId) return false;
  updateScanProgress(message);
  return false;
});

loadState()
  .then(render)
  .catch((error) => showToast(error.message || String(error)));
