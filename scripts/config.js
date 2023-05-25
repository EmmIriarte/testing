let API_KEY;
let ORGANISATION_ID;

chrome.storage.sync.get('apiKey', ({ apiKey }) => {
    API_KEY = apiKey;
});
chrome.storage.sync.get('organisationId', ({ organisationId }) => {
    ORGANISATION_ID = organisationId;
});