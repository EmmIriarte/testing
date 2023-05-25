const apiKey = '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';
const organisationId = 'org-agGq4fRSifFJyzT1lsMeKHDT';

chrome.storage.local.clear();
chrome.storage.sync.clear();

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({ apiKey, organisationId });
});

chrome.action.onClicked.addListener(function() {
  chrome.tabs.create({url: 'index.html'});
});
