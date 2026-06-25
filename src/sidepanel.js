const DB_NAME = "xhs_collection_assistant";
const DB_VERSION = 1;
const PING_TYPE = "XHS_COLLECTION_PING";
const SCAN_TYPE = "XHS_COLLECTION_SCAN";

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

const CATEGORY_RULES = [
  ["旅游", ["旅行", "旅游", "东京", "日本", "京都", "大阪", "酒店", "签证", "自由行", "机票", "攻略", "民宿", "景点", "行程"]],
  ["家居", ["装修", "家居", "收纳", "软装", "厨房", "客厅", "卧室", "新房", "租房", "改造", "柜", "灯"]],
  ["育儿", ["儿童", "孩子", "宝宝", "绘本", "亲子", "幼儿", "早教", "育儿", "小学", "玩具"]],
  ["学习成长", ["托福", "雅思", "英语", "学习", "备考", "口语", "模板", "效率", "AI", "工具", "考研", "读书"]],
  ["数码", ["手机", "电脑", "相机", "镜头", "iPhone", "Mac", "App", "软件", "数码", "耳机", "平板"]],
  ["美食", ["美食", "餐厅", "菜谱", "咖啡", "烘焙", "甜品", "早餐", "晚餐", "火锅", "探店"]],
  ["健康运动", ["健身", "瑜伽", "跑步", "减脂", "健康", "运动", "训练", "睡眠", "康复"]],
  ["宠物", ["猫", "狗", "宠物", "猫粮", "狗粮", "铲屎", "猫咪", "狗狗"]],
  ["汽车", ["汽车", "买车", "车险", "自驾", "新能源", "特斯拉", "驾驶", "保养"]]
];

const TOPIC_RULES = {
  "旅游": [
    ["日本旅行", ["日本", "东京", "京都", "大阪", "北海道", "冲绳"]],
    ["国内旅行", ["国内", "云南", "新疆", "成都", "上海", "北京", "杭州", "三亚"]],
    ["酒店推荐", ["酒店", "民宿", "住宿"]],
    ["签证攻略", ["签证", "入境", "护照"]],
    ["旅行攻略", ["行程", "攻略", "路线", "自由行"]]
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
    ["早教成长", ["早教", "幼儿", "宝宝"]]
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
    sort: "updated_desc"
  },
  expandedCategories: new Set(DEFAULT_CATEGORIES.map(([id]) => id))
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

function canonicalNoteUrl(note) {
  if (!note?.id) return note?.url || "";
  return `https://www.xiaohongshu.com/explore/${note.id}`;
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

async function seedDefaults() {
  const existing = await getAll("categories");
  if (existing.length) return;
  const timestamp = nowIso();
  await putMany(
    "categories",
    DEFAULT_CATEGORIES.map(([id, name], index) => ({
      id,
      name,
      sort_order: index,
      is_system: true,
      created_at: timestamp,
      updated_at: timestamp
    }))
  );
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
  state.categories = categories.sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0) || a.name.localeCompare(b.name, "zh-Hans-CN"));
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

function categoryNoteCount(categoryId) {
  return activeNotes().filter((note) => note.category_id === categoryId).length;
}

function topicNoteCount(topicId) {
  const noteIds = new Set(state.noteTopics.filter((row) => row.topic_id === topicId).map((row) => row.note_id));
  return activeNotes().filter((note) => noteIds.has(note.id)).length;
}

function collectionNoteCount(collectionId) {
  return state.collectionNotes.filter((row) => row.collection_id === collectionId).length;
}

function scoreKeywords(text, keywords) {
  const lower = text.toLowerCase();
  return keywords.reduce((score, keyword) => score + (lower.includes(keyword.toLowerCase()) ? 1 : 0), 0);
}

function fallbackClassify(note) {
  const text = `${note.title || ""} ${note.author || ""} ${note.source_album || ""}`;
  let winner = { category: "其他", score: 0 };
  for (const [category, keywords] of CATEGORY_RULES) {
    const score = scoreKeywords(text, keywords);
    if (score > winner.score) winner = { category, score };
  }

  const topicRules = TOPIC_RULES[winner.category] || TOPIC_RULES["其他"];
  let topic = topicRules[topicRules.length - 1]?.[0] || "待整理";
  let topicScore = 0;
  for (const [name, keywords] of topicRules) {
    const score = scoreKeywords(text, keywords);
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

async function remoteClassify(notes, categories) {
  const apiKey = state.settings.ai_api_key;
  const endpoint = state.settings.ai_endpoint || "https://api.openai.com/v1/chat/completions";
  const model = state.settings.ai_model || "gpt-4o-mini";
  if (!apiKey || !endpoint || !model) return null;

  const input = notes.map((note) => ({
    id: note.id,
    title: note.title,
    author: note.author,
    source_album: note.source_album
  }));

  const body = {
    model,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content:
          "你是小红书收藏分类助手。只返回 JSON。把每条笔记归入给定一级分类之一，并生成简短二级主题。输出格式为 {\"items\":[{\"note_id\":\"...\",\"category\":\"...\",\"topic\":\"...\",\"confidence\":0.0}]}。confidence 取 0 到 1。"
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

async function classifyNotes(notes) {
  const results = [];
  const categories = state.categories;
  const chunks = [];
  for (let index = 0; index < notes.length; index += 25) chunks.push(notes.slice(index, index + 25));

  for (const chunk of chunks) {
    let chunkResult = null;
    try {
      chunkResult = await remoteClassify(chunk, categories);
    } catch (error) {
      showToast(`AI 接口不可用，已使用本地分类：${error.message}`);
    }
    results.push(...(chunkResult || chunk.map(fallbackClassify)));
  }

  return results;
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

async function getActiveXhsTab() {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  const tab = tabs[0];
  if (!tab?.id || !/^https:\/\/www\.xiaohongshu\.com\//.test(tab.url || "")) {
    throw new Error("请先打开已登录的小红书页面，再点击导入。");
  }
  return tab;
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

async function importFromCurrentTab() {
  const importButton = $("#importButton");
  importButton.disabled = true;
  importButton.textContent = "…";
  try {
    const tab = await getActiveXhsTab();
    const settings = state.settings;
    const maxScrolls = Number(settings.max_scrolls ?? 10);
    const fullScan = Boolean(settings.full_scan_missing);
    const ping = await sendToTab(tab.id, { type: PING_TYPE });
    if (!ping?.loggedIn) showToast("未明确检测到登录状态，仍会尝试扫描当前页面。");

    const result = await sendToTab(tab.id, { type: SCAN_TYPE, options: { maxScrolls } });
    if (!result?.ok) throw new Error(result?.error || "扫描失败");
    if (!result.notes.length) throw new Error("当前页面没有识别到收藏笔记卡片。请进入收藏页后重试。");

    const timestamp = nowIso();
    const existingById = new Map(state.notes.map((note) => [note.id, note]));
    const scannedIds = new Set(result.notes.map((note) => note.id));
    const importedNotes = result.notes.map((note) => {
      const old = existingById.get(note.id);
      return {
        ...old,
        ...note,
        collect_time: note.collect_time || old?.collect_time || "",
        source_album: note.source_album || old?.source_album || "小红书收藏",
        category_id: old?.category_id || "",
        ai_confidence: old?.ai_confidence || 0,
        is_confirmed: Boolean(old?.is_confirmed),
        removed_at: "",
        created_at: old?.created_at || timestamp,
        updated_at: timestamp
      };
    });

    const newNotes = importedNotes.filter((note) => !existingById.has(note.id) || !existingById.get(note.id)?.category_id);
    await putMany("notes", importedNotes);

    if (fullScan) {
      const removed = state.notes
        .filter((note) => !note.removed_at && !scannedIds.has(note.id))
        .map((note) => ({ ...note, removed_at: timestamp, updated_at: timestamp }));
      if (removed.length) await putMany("notes", removed);
    }

    await putMany("meta", [
      { key: "last_sync_time", value: timestamp },
      { key: "last_scan_count", value: result.notes.length },
      { key: "last_scan_url", value: result.url },
      { key: "remote_total_notes", value: result.pageCounts?.notes || result.notes.length },
      { key: "remote_total_albums", value: result.pageCounts?.albums || "" },
      { key: "remote_total_files", value: result.pageCounts?.files || "" }
    ]);

    await loadState();
    if (newNotes.length) {
      const classifications = await classifyNotes(newNotes);
      await applyClassifications(classifications);
      await loadState();
    }

    await putMany("meta", [{ key: "local_total_notes", value: activeNotes().length }]);
    await loadState();
    render();
    const remoteTotal = result.pageCounts?.notes;
    const totalText = remoteTotal ? `页面共 ${remoteTotal} 篇，` : "";
    showToast(`${totalText}本次识别 ${result.notes.length} 篇，其中新增/待分类 ${newNotes.length} 篇。`);
  } catch (error) {
    showToast(error.message || String(error));
  } finally {
    importButton.disabled = false;
    importButton.textContent = "↻";
  }
}

function renderStats() {
  const localTotal = activeNotes().length;
  const remoteTotal = Number(state.meta.remote_total_notes || 0);
  $("#totalNotes").textContent = String(remoteTotal || localTotal);
  $("#totalCategories").textContent = String(state.categories.length);
  $("#totalTopics").textContent = String(state.topics.length);

  const lastSync = state.meta.last_sync_time ? new Date(state.meta.last_sync_time).toLocaleString("zh-CN") : "";
  const localText = remoteTotal && remoteTotal !== localTotal ? `，本地已识别 ${localTotal}` : "";
  $("#syncSummary").textContent = lastSync ? `上次同步 ${lastSync}${localText}` : "本地优先，等待导入";
}

function renderCategories() {
  const view = $("#categoriesView");
  if (!state.categories.length) {
    view.innerHTML = `<div class="empty-state">暂无分类</div>`;
    return;
  }

  view.innerHTML = `
    <div class="toolbar">
      <button class="button primary" data-action="add-category">新增分类</button>
      <button class="button" data-action="organize-all">整理未分类</button>
    </div>
    <div class="list">
      ${state.categories
        .map((category) => {
          const expanded = state.expandedCategories.has(category.id);
          const topics = topicsForCategory(category.id);
          const topicHtml = topics.length
            ? topics
                .map(
                  (topic) => `
                    <div class="topic-row">
                      <button class="topic-main" data-action="open-topic-notes" data-topic-id="${topic.id}">
                        <strong>${escapeHtml(topic.name)}（${topicNoteCount(topic.id)}）</strong>
                      </button>
                      <div class="row-actions">
                        <button class="icon-button" title="重命名主题" data-action="rename-topic" data-topic-id="${topic.id}">✎</button>
                      </div>
                    </div>
                  `
                )
                .join("")
            : `<div class="empty-state">暂无二级主题</div>`;
          return `
            <article class="category-row">
              <div class="category-header">
                <button class="category-title" data-action="open-category-notes" data-category-id="${category.id}">
                  <strong>${escapeHtml(category.name)}</strong>
                </button>
                <div class="category-actions">
                  <button class="count-pill category-count" title="${expanded ? "收起" : "展开"}分类" data-action="toggle-category" data-category-id="${category.id}">${categoryNoteCount(category.id)}</button>
                  <button class="icon-button compact" title="重命名分类" data-action="rename-category" data-category-id="${category.id}">✎</button>
                  <button class="icon-button compact danger" title="删除分类" data-action="delete-category" data-category-id="${category.id}">×</button>
                </div>
              </div>
              ${
                expanded
                  ? `<div class="topic-list">${topicHtml}</div>`
                  : ""
              }
            </article>
          `;
        })
        .join("")}
    </div>
  `;
}

function openCategoryNotes(categoryId) {
  state.activeTab = "notes";
  state.filters.query = "";
  state.filters.categoryId = categoryId;
  state.filters.topicId = "";
  state.filters.sort = "updated_desc";
  render();
  const category = categoryById(categoryId);
  showToast(`正在显示 ${category?.name || "该分类"} 下的笔记。`);
}

function openTopicNotes(topicId) {
  const topic = topicById(topicId);
  if (!topic) return;
  state.activeTab = "notes";
  state.filters.query = "";
  state.filters.categoryId = topic.category_id;
  state.filters.topicId = topicId;
  state.filters.sort = "updated_desc";
  render();
  const category = categoryById(topic.category_id);
  showToast(`正在显示 ${category?.name || "分类"} / ${topic.name} 下的笔记。`);
}

function clearNoteScope() {
  state.filters.categoryId = "";
  state.filters.topicId = "";
  renderNotes();
}

function currentScopeLabel() {
  const topic = state.filters.topicId ? topicById(state.filters.topicId) : null;
  const category = categoryById(state.filters.categoryId || topic?.category_id);
  if (category && topic) return `${category.name} / ${topic.name}`;
  if (category) return category.name;
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
        [note.title, note.author, note.source_album, categoryById(note.category_id)?.name, ...topicsForNote(note.id).map((topic) => topic.name)]
          .join(" ")
          .toLowerCase()
          .includes(query);
      const matchesCategory = !state.filters.categoryId || note.category_id === state.filters.categoryId;
      const matchesTopic = !topicNoteIds || topicNoteIds.has(note.id);
      return matchesQuery && matchesCategory && matchesTopic;
    })
    .sort((a, b) => {
      if (state.filters.sort === "title_asc") return String(a.title).localeCompare(String(b.title), "zh-Hans-CN");
      return String(b.updated_at || b.imported_at).localeCompare(String(a.updated_at || a.imported_at));
    });
}

function renderNoteCard(note) {
  return `
    <article class="note-row" data-note-id="${note.id}">
      ${
        note.cover
          ? `<img class="note-cover" src="${escapeHtml(note.cover)}" alt="">`
          : `<div class="note-cover placeholder">书</div>`
      }
      <div class="note-content">
        <strong title="${escapeHtml(note.title)}">${escapeHtml(note.title || "未命名笔记")}</strong>
        ${note.author ? `<div class="note-meta">${escapeHtml(note.author)}</div>` : ""}
        <div class="row-actions">
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
  const categoryOptions = state.categories.map((category) => `<option value="${category.id}">${escapeHtml(category.name)}</option>`).join("");
  const topicOptions = state.topics.map((topic) => `<option value="${topic.id}">${escapeHtml(topic.name)}</option>`).join("");

  view.innerHTML = `
    ${
      isScoped
        ? `<div class="scope-header">
            <button class="icon-button" title="返回全部收藏" data-action="clear-note-scope">←</button>
            <strong>${escapeHtml(scopeLabel)}</strong>
          </div>`
        : `<div class="toolbar stacked">
            <input id="searchInput" class="field" type="search" placeholder="搜索标题、分类、主题" value="${escapeHtml(state.filters.query)}">
            <select id="categoryFilter" class="select">
              <option value="">全部一级分类</option>
              ${categoryOptions}
            </select>
            <select id="topicFilter" class="select">
              <option value="">全部二级主题</option>
              ${topicOptions}
            </select>
            <select id="sortFilter" class="select">
              <option value="updated_desc">最近导入</option>
              <option value="title_asc">标题 A-Z</option>
            </select>
          </div>`
    }
    <div id="notesList" class="list"></div>
  `;

  if (!isScoped) {
    $("#categoryFilter").value = state.filters.categoryId;
    $("#topicFilter").value = state.filters.topicId;
    $("#sortFilter").value = state.filters.sort;
  }
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
  view.innerHTML = `
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
    <section class="settings-block">
      <h2>同步</h2>
      <div class="form-grid">
        <input id="maxScrolls" class="field" type="number" min="0" max="80" value="${escapeHtml(state.settings.max_scrolls ?? 10)}">
        <label class="checkbox-row">
          <input id="fullScanMissing" type="checkbox" ${state.settings.full_scan_missing ? "checked" : ""}>
          完整扫描时标记取消收藏
        </label>
        <button class="button" data-action="save-sync-settings">保存同步设置</button>
      </div>
      <p>导入时会从当前小红书页面向下滚动并识别笔记卡片。</p>
    </section>
  `;
}

function render() {
  renderStats();
  $$(".tab").forEach((tab) => tab.classList.toggle("active", tab.dataset.tab === state.activeTab));
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

async function addCategory() {
  const name = prompt("一级分类名称");
  if (!name?.trim()) return;
  const timestamp = nowIso();
  await putMany("categories", [
    {
      id: uid("cat"),
      name: name.trim().slice(0, 20),
      sort_order: state.categories.length,
      is_system: false,
      created_at: timestamp,
      updated_at: timestamp
    }
  ]);
  await loadState();
  render();
}

async function renameCategory(id) {
  const category = categoryById(id);
  if (!category) return;
  const name = prompt("新的一级分类名称", category.name);
  if (!name?.trim()) return;
  await putMany("categories", [{ ...category, name: name.trim().slice(0, 20), updated_at: nowIso() }]);
  await loadState();
  render();
}

async function deleteCategory(id) {
  const category = categoryById(id);
  if (!category) return;
  if (category.name === "其他") return showToast("其他分类会作为兜底分类，暂不删除。");
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
  const targets = activeNotes().filter((note) => !note.category_id || !state.noteTopics.some((row) => row.note_id === note.id));
  if (!targets.length) return showToast("没有需要整理的笔记。");
  const results = await classifyNotes(targets);
  await applyClassifications(results);
  await loadState();
  render();
  showToast(`已整理 ${targets.length} 篇笔记。`);
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
      <button class="button primary" type="button" data-action="open-original" data-url="${escapeHtml(note.url)}">打开原笔记</button>
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
    { key: "max_scrolls", value: Number($("#maxScrolls").value || 10) },
    { key: "full_scan_missing", value: Boolean($("#fullScanMissing").checked) }
  ]);
  await loadState();
  render();
  showToast("同步设置已保存。");
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
  const { action, categoryId, topicId, noteId, collectionId, url } = actionElement.dataset;

  if (action === "toggle-category") {
    state.expandedCategories.has(categoryId) ? state.expandedCategories.delete(categoryId) : state.expandedCategories.add(categoryId);
    renderCategories();
  }
  if (action === "open-category-notes") openCategoryNotes(categoryId);
  if (action === "open-topic-notes") openTopicNotes(topicId);
  if (action === "clear-note-scope") clearNoteScope();
  if (action === "add-category") await addCategory();
  if (action === "rename-category") await renameCategory(categoryId);
  if (action === "delete-category") await deleteCategory(categoryId);
  if (action === "rename-topic") await renameTopic(topicId);
  if (action === "organize-all") await organizeAllUnclassified();
  if (action === "open-note") {
    const note = state.notes.find((item) => item.id === noteId);
    const targetUrl = canonicalNoteUrl(note);
    if (targetUrl) chrome.tabs.create({ url: targetUrl });
  }
  if (action === "create-collection") await createCollection();
  if (action === "rename-collection") await renameCollection(collectionId);
  if (action === "delete-collection") await deleteCollection(collectionId);
  if (action === "view-collection") viewCollection(collectionId);
  if (action === "add-note-to-collection") await addNoteToCollection(noteId);
  if (action === "open-original" && url) chrome.tabs.create({ url });
  if (action === "save-settings") await saveAiSettings();
  if (action === "save-sync-settings") await saveSyncSettings();
});

document.addEventListener("input", (event) => {
  if (event.target.id === "searchInput") {
    state.filters.query = event.target.value;
    renderNoteList();
  }
});

document.addEventListener("change", (event) => {
  if (event.target.id === "categoryFilter") {
    state.filters.categoryId = event.target.value;
    state.filters.topicId = "";
    renderNotes();
  }
  if (event.target.id === "topicFilter") {
    state.filters.topicId = event.target.value;
    renderNotes();
  }
  if (event.target.id === "sortFilter") {
    state.filters.sort = event.target.value;
    renderNotes();
  }
});

$("#importButton").addEventListener("click", importFromCurrentTab);

loadState()
  .then(render)
  .catch((error) => showToast(error.message || String(error)));
