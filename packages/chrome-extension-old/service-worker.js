const GOOGLE_ORIGIN = "https://www.google.com";

chrome.tabs.onUpdated.addListener(async (tabId, info, tab) => {
  if (!tab.url) {
    return;
  }

  const url = new URL(tab.url);

  await chrome.sidePanel.setOptions({
    tabId,
    path: "side_panel.html",
    enabled: true,
  });

  // // Enables the side panel on google.com
  // if (url.origin === GOOGLE_ORIGIN) {
  //   await chrome.sidePanel.setOptions({
  //     tabId,
  //     path: "side_panel.html",
  //     enabled: true,
  //   });
  // } else {
  //   // Disables the side panel on all other sites
  //   await chrome.sidePanel.setOptions({
  //     tabId,
  //     enabled: false,
  //   });
  // }
});
