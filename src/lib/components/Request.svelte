<script lang="ts">
	import { slide } from 'svelte/transition';

	export let request: chrome.webRequest.WebResponseCacheDetails;

	const { url, responseHeaders, timeStamp } = request;

	interface Targeting {
		[key: string]: string | Record<string, string>;
		cust_params: Record<string, string>;
		prev_scp: Record<string, string>;
		prev_iu_szs: string;
	}

	const adRequest = new URL(url);
	const adRequestParams = adRequest.searchParams;

	const custParams = new URLSearchParams(adRequestParams.get('cust_params') || '');
	const prevScp = new URLSearchParams(adRequestParams.get('prev_scp') || '');

	const obj = Object.fromEntries(adRequestParams.entries()) as Targeting;

	obj.cust_params = Object.fromEntries(custParams.entries());
	obj.prev_scp = Object.fromEntries(prevScp.entries());

	const slot = obj.prev_scp.slot;

	const sizes = obj.prev_iu_szs.split('|');

	const lineItemId = responseHeaders?.find((header) => header.name === 'google-lineitem-id')?.value;

	const creativeId = responseHeaders?.find((header) => header.name === 'google-creative-id')?.value;

	const time = new Date(timeStamp);

	let showTargeting = false;
</script>

<div class={slot}>
	<table class="table">
		<tbody>
			<tr>
				<th>Time</th>
				<td>{time.toLocaleTimeString()}</td>
			</tr>
			<tr>
				<th>Slot</th>
				<td>{slot}</td>
			</tr>
			<tr>
				<th>Sizes</th>
				<td>{sizes.join(', ')}</td>
			</tr>
			{#if obj.cust_params.ab?.length}
				<tr>
					<th>AB tests</th>
					<td>{obj.cust_params.ab}</td>
				</tr>
			{/if}
			{#if obj.prev_scp.refreshed}
				<tr>
					<th>Refreshed</th>
					<td>{obj.prev_scp.refreshed}</td>
				</tr>
			{/if}
			<tr>
				<th>Line Item</th>
				<td>
					<a
						href="https://admanager.google.com/59666047#delivery/line_item/detail/line_item_id={lineItemId}"
						target="_blank">{lineItemId}</a
					>
				</td>
			</tr>
			<tr>
				<th>Creative</th>
				<td>
					<a
						href="https://admanager.google.com/59666047#creatives/creative/detail/line_item_id={lineItemId}&creative_id={creativeId}"
						target="_blank">{creativeId}</a
					>
				</td>
			</tr>
			<tr>
				<th>Targeting</th>
				<td>
					<button on:click={() => (showTargeting = !showTargeting)}
						>{showTargeting ? 'Hide' : 'Show'}</button
					>
					{#if showTargeting}
						<pre transition:slide={{ duration: 300 }}>
              {JSON.stringify(obj, null, 2)}
            </pre>
					{/if}
				</td>
			</tr>
		</tbody>
	</table>
</div>
