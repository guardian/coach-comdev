<script lang="ts">
	import { onMount } from 'svelte';
	import { derived, readable, writable } from 'svelte/store';

	const i = 1;

	interface SlotPosition {
		x: number;
		y: number;
		width: number;
		height: number;
	}

	const slotPositions = readable<Record<string, SlotPosition>>({}, (set) => {
		const elements = document.querySelectorAll<HTMLElement>('.js-ad-slot');
		const positions: Record<string, SlotPosition> = Array.from(elements).reduce((acc, slot) => {
			const rect = slot.getBoundingClientRect();
			return {
				...acc,
				[slot.id]: {
					x: rect.x,
					y: rect.y,
					width: rect.width,
					height: rect.height
				}
			};
		}, {});

		set(positions);

		const resizeObserver = new ResizeObserver((entries) => {
			// console.log('resizeObserver', entries);
			entries.forEach((entry) => {
				const slot = entry.target as HTMLElement;
				const rect = slot.getBoundingClientRect();
				// console.log('dfp-ad--top-above-nav resized', rect);

				set({
					...positions,
					[slot.id]: {
						x: rect.x,
						y: rect.y,
						width: rect.width,
						height: rect.height
					}
				});
			});
		});

		Object.values(elements).forEach((element) => {
			resizeObserver.observe(element);
		});

		const observer = new MutationObserver(function (mutations) {
			mutations.forEach(function (mutation) {
				mutation.addedNodes.forEach(function (addedNode) {
					if (addedNode instanceof HTMLElement) {
						if (addedNode.classList.contains('js-ad-slot')) {
							// console.log('found new slot', addedNode.id);
							// const rect = addedNode.getBoundingClientRect();
							resizeObserver.observe(addedNode);
							// set({
							// 	...positions,
							// 	[addedNode.firstChild.id]: {
							// 		x: rect.x,
							// 		y: rect.y,
							// 		width: rect.width,
							// 		height: rect.height
							// 	}
							// });
						}
					}
				});
			});
		});

		observer.observe(document.body, { childList: true, subtree: true });

		return () => {
			// observer.disconnect();
		};
	});

	const pageSize = readable<DOMRect | undefined>(undefined, (set) => {
		const page = document.querySelector('body');
		const rect = page?.getBoundingClientRect();
		rect && set(rect);
	});

	const miniMapCanvas = writable<HTMLCanvasElement | null>(null);

	const draw = derived(
		[slotPositions, pageSize, miniMapCanvas],
		([$slotPositions, $pageSize, $miniMapCanvas]) => {
			if (!$pageSize || !$miniMapCanvas) return;
			const ctx = $miniMapCanvas.getContext('2d');
			if (!ctx) return;

			console.log('draw');
			ctx.clearRect(0, 0, $miniMapCanvas.width, $miniMapCanvas.height);
			ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';

			const scaledPageSize = {
				width: $pageSize.width * 0.1,
				height: $pageSize.height * 0.1
			};

			ctx.fillRect(0, 0, scaledPageSize.width, scaledPageSize.height);
			Object.entries($slotPositions).forEach(([id, rect]) => {
				console.log('drawing', id, rect);

				const x = (rect.x / $pageSize.width) * scaledPageSize.width;
				const y = (rect.y / $pageSize.height) * scaledPageSize.height;
				const width = (rect.width / $pageSize.width) * scaledPageSize.width;
				const height = (rect.height / $pageSize.height) * scaledPageSize.height;

				ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
				ctx.fillRect(x, y, width, height);
				ctx.fillText(id, x, y);
			});
		}
	);

	slotPositions.subscribe((positions) => {
		console.log('top-above-nav', positions['dfp-ad--top-above-nav']);
	});

	draw.subscribe(() => {
		//
	});
</script>

<main>
	<!-- <canvas id="canvas" width="300" height="600" bind:this={$miniMapCanvas} /> -->
</main>

<style lang="scss">
	main {
		/* position: fixed;
		top: calc(100vh - 600px);
		left: 0;
		width: 300px;
		height: 600px;
		background: #f0f0f0;
		padding: 1rem;
    */
		z-index: 999999;
	}
</style>
