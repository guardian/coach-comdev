<script lang="ts">
	import { browser } from '$app/environment';
	import { slotNameFromURL } from '$lib';
	import Request from '../lib/components/Request.svelte';
	import { derived, readable } from 'svelte/store';
	import { isGuardianUrl } from '$lib';

	const tab = readable<chrome.tabs.Tab | null>(null, (set) => {
		if (!browser) return;
		chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
			tabs[0] && set(tabs[0]);
		});
	});

	const requests = readable<Record<string, chrome.webRequest.WebResponseCacheDetails[]>>(
		{},
		(set) => {
			if (!browser) return;
			chrome.storage.local.get('requests', (result) => {
				const requests = JSON.parse(result.requests || '{}');
				set(requests);
			});
			chrome.storage.onChanged.addListener((changes, namespace) => {
				if (namespace === 'local' && changes.requests) {
					const newRequests = JSON.parse(changes.requests.newValue);
					set(newRequests);
				}
			});
		}
	);

	const currentRequests = derived([tab, requests], ([$tab, $requests]) => {
		if (!$tab?.id) return [];
		return $requests[$tab.id] || [];
	});
</script>

{#if isGuardianUrl($tab?.url || '')}
	<h2>Requests</h2>
	<ul>
		{#each $currentRequests as request}
			<li><Request {request} /></li>
		{/each}
	</ul>
{:else}
	<p>🤔 You're not on the Guardian</p>
{/if}

<style lang="scss">
	ul {
		list-style: none;
		padding: 0;
	}

	li {
		margin-bottom: 1rem;
	}
</style>
