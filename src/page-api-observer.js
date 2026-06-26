(() => {
  const OBSERVER_VERSION = "response-v2";
  if (window.__xhsCollectionApiObserverVersion === OBSERVER_VERSION) return;
  window.__xhsCollectionApiObserverInstalled = true;
  window.__xhsCollectionApiObserverVersion = OBSERVER_VERSION;

  const STORAGE_KEY = "__xhsCollectionApiEntries";
  const MAX_ENTRIES = 96;
  const BODY_LIMIT = 4000;
  const RESPONSE_LIMIT = 360000;

  const isCollectionPage = () => /[?&]tab=fav(?:&|$)/.test(location.search) || /收藏/.test(document.title);

  const isCollectionApiUrl = (url) => {
    const rawUrl = String(url || "");
    if (!/\/api\/sns\/web\//.test(rawUrl)) return false;
    if (/collect|favorite|fav/i.test(rawUrl)) return true;
    if (/\/api\/sns\/web\/v\d+\/user_posted/i.test(rawUrl)) return isCollectionPage() || /xsec_?source=pc_collect/i.test(rawUrl);
    return false;
  };

  const readEntries = () => {
    try {
      return JSON.parse(sessionStorage.getItem(STORAGE_KEY) || document.documentElement.dataset.xhsCollectionApis || "[]");
    } catch {
      return [];
    }
  };

  const writeEntries = (entries) => {
    const nextEntries = entries.slice(0, MAX_ENTRIES);
    const text = JSON.stringify(nextEntries);
    try {
      sessionStorage.setItem(STORAGE_KEY, text);
    } catch {
      // Fall back to the DOM dataset when storage quota is unavailable.
    }
    document.documentElement.dataset.xhsCollectionApis = text.slice(0, 120000);
  };

  const publish = (detail) => {
    try {
      const url = String(detail.url || "");
      if (!isCollectionApiUrl(url)) return;
      const entry = {
        url,
        method: detail.method || "GET",
        body: typeof detail.body === "string" ? detail.body.slice(0, BODY_LIMIT) : "",
        status: detail.status || 0,
        response: typeof detail.response === "string" ? detail.response.slice(0, RESPONSE_LIMIT) : "",
        observed_at: Date.now()
      };
      const key = `${entry.method} ${entry.url} ${entry.body} ${entry.response ? entry.response.length : 0}`;
      const entries = readEntries().filter((item) => {
        const itemKey = `${item.method || "GET"} ${item.url} ${item.body || ""} ${item.response ? item.response.length : 0}`;
        return itemKey !== key;
      });
      writeEntries([entry, ...entries]);
      window.dispatchEvent(new CustomEvent("XHS_COLLECTION_API_OBSERVED", { detail: entry }));
    } catch {
      // Network observation must never break the host page.
    }
  };

  const originalFetch = window.fetch;
  if (typeof originalFetch === "function") {
    window.fetch = function(input, init = {}) {
      const url = typeof input === "string" ? input : input && input.url;
      publish({
        url,
        method: init.method || (input && input.method) || "GET",
        body: typeof init.body === "string" ? init.body : ""
      });
      const responsePromise = originalFetch.apply(this, arguments);
      responsePromise
        .then((response) => {
          if (!isCollectionApiUrl(url)) return;
          response
            .clone()
            .text()
            .then((text) =>
              publish({
                url,
                method: init.method || (input && input.method) || "GET",
                body: typeof init.body === "string" ? init.body : "",
                status: response.status,
                response: text
              })
            )
            .catch(() => {});
        })
        .catch(() => {});
      return responsePromise;
    };
  }

  const originalOpen = XMLHttpRequest.prototype.open;
  const originalSend = XMLHttpRequest.prototype.send;
  XMLHttpRequest.prototype.open = function(method, url) {
    this.__xhsCollectionRequest = { method, url };
    return originalOpen.apply(this, arguments);
  };
  XMLHttpRequest.prototype.send = function(body) {
    const request = this.__xhsCollectionRequest || {};
    if (isCollectionApiUrl(request.url)) {
      this.addEventListener("loadend", () => {
        let response = "";
        try {
          response = typeof this.responseText === "string" ? this.responseText : "";
        } catch {
          response = "";
        }
        publish({
          ...request,
          body: typeof body === "string" ? body : "",
          status: this.status,
          response
        });
      });
    }
    publish({
      ...request,
      body: typeof body === "string" ? body : ""
    });
    return originalSend.apply(this, arguments);
  };
})();
