/**
 * Gets the currently active tab in the browser window.
 *
 * @param {function} callback - Callback function receiving (url, title).
 * @returns {void}
 */
export const getActiveTab = (callback) => {
  if (typeof chrome !== "undefined" && chrome.tabs) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs && tabs[0]) {
        const link = tabs[0].url;
        const rawTitle = tabs[0].title || link;
        callback(link, rawTitle);
      }
    });
  } else {
    console.warn("Chrome API not available (getActiveTab)");
  }
};

/**
 * Gets all tabs from the current window.
 *
 * @param {function} callback - Callback function receiving an array of tab objects.
 * @returns {void}
 */
export const getAllTabs = (callback) => {
  if (typeof chrome !== "undefined" && chrome.tabs) {
    chrome.tabs.query({ currentWindow: true }, (tabs) => {
      if (tabs) {
        callback(tabs);
      }
    });
  } else {
    console.warn("Chrome API not available (getAllTabs)");
    // Mock data for development
    callback([
      { url: "https://google.com", title: "Google" },
      { url: "https://github.com", title: "GitHub" },
    ]);
  }
};
