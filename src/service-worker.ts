import { isGuardianUrl } from './lib';

let requests: { [key: string]: chrome.webRequest.WebResponseCacheDetails[] } = {};
const listeners: {
	[key: string]: (details: chrome.webRequest.WebResponseCacheDetails) => Promise<void>;
} = {};

// chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
// 	if (request.query === 'getRequests') {
// 		console.log('service-worker', 'getRequests', request.tabId, requests[request.tabId]);
// 		sendResponse({ requests: requests[request.tabId] });
// 	}
// });

const addTabListener = (tab: chrome.tabs.Tab) => {
	console.log('listening to', tab.id);
	const listener = async (details: chrome.webRequest.WebResponseCacheDetails) => {
		console.log('GAM request for tab', tab.id, details);
		if (tab.id) {
			requests[tab.id].push(details);

			await chrome.storage.local.set({ requests: JSON.stringify(requests) });
			updateIcon(tab);
		}
	};
	if (tab.id) {
		listeners[tab.id] = listener;
	}
	chrome.webRequest.onCompleted.addListener(
		listener,
		{ tabId: tab.id, urls: ['*://securepubads.g.doubleclick.net/gampad/ads*'] },
		['responseHeaders']
	);
};

const removeTabListener = (tabId: number) => {
	if (tabId && requests[tabId]) {
		console.log('unlistening', tabId);
		chrome.webRequest.onCompleted.removeListener(listeners[tabId]);
		delete listeners[tabId];
	}
};

const onTabChange = (tab: chrome.tabs.Tab) => {
	// url will only be specified if it has changed
	if (tab.id && tab.url) {
		if (isGuardianUrl(tab.url)) {
			requests[tab.id] = [];
			if (!listeners[tab.id]) {
				addTabListener(tab);
			}
		} else {
			delete requests[tab.id];
			removeTabListener(tab.id);
		}
	}
};

const updateIcon = (tab: chrome.tabs.Tab) => {
	if (tab.id && requests[tab.id] && isGuardianUrl(tab.url || '')) {
		chrome.action.setIcon({ path: 'favicon.png', tabId: tab.id });
		chrome.action.setBadgeText({ text: requests[tab.id].length.toString(), tabId: tab.id });
	} else {
		chrome.action.setIcon({ path: 'inactive.png', tabId: tab.id });
		chrome.action.setBadgeText({ text: '', tabId: tab.id });
	}
};

const init = async () => {
	chrome.action.setIcon({ path: 'inactive.png' });
	chrome.action.setBadgeText({ text: '' });

	const localStorage = await chrome.storage.local.get('requests');

	requests = JSON.parse(localStorage['requests'] || '{}');

	const tabs = await chrome.tabs.query({ url: '*://*.theguardian.com/*' });

	tabs.forEach((tab) => {
		tab.id && (requests[tab.id] = []);
		if (isGuardianUrl(tab.url || '')) {
			addTabListener(tab);
			updateIcon(tab);
		}
	});

	chrome.tabs.onCreated.addListener((tab) => onTabChange(tab));

	chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
		console.log('tab updated', tabId, changeInfo);
		updateIcon(tab);
		onTabChange(tab);
	});

	chrome.tabs.onRemoved.addListener((tabId) => {
		if (requests[tabId]) {
			delete requests[tabId];
			removeTabListener(tabId);
		}
	});
};

init();
