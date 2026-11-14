import gsap from "gsap";
import type { RowConfig } from "@/types/gallery";

type Layer = {
	track: HTMLDivElement;
	wrapper: HTMLDivElement;
	config: RowConfig;
	period: number;
	x: number;
	velocity: number;
	auto: number;
	direction: number;
	speed: number;
	drag: number;
};

export type GalleryEngineOptions = {
	section: HTMLElement;
	/** One wrapper + track per row, in the same order as `configs`. */
	wrappers: HTMLDivElement[];
	tracks: HTMLDivElement[];
	/** Row configs, in the same order as `wrappers` / `tracks`. */
	configs: RowConfig[];
};

export type GalleryEngine = {
	destroy: () => void;
};

export function createGalleryEngine({
	section,
	wrappers,
	tracks,
	configs,
}: GalleryEngineOptions): GalleryEngine {
	const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

	const layers: Layer[] = configs.map((config, index) => ({
		track: tracks[index],
		wrapper: wrappers[index],
		config,
		period: 0,
		x: 0,
		velocity: 0,
		auto: reduceMotion.matches ? 0 : 1,
		direction: config.direction,
		speed: config.speed,
		drag: config.drag,
	}));

	const measure = (layer: Layer) => {
		// Distance between the first slot of two copies = the loop period.
		const first = layer.track.children[0] as HTMLElement | undefined;
		const next = layer.track.children[layer.config.slots.length] as
			| HTMLElement
			| undefined;
		if (!first || !next) return;

		const period = next.offsetLeft - first.offsetLeft;
		if (period <= 0 || Math.abs(period - layer.period) < 0.5) return;

		layer.period = period;
		// Re-wrap the current offset so a resize doesn't jump the row.
		layer.x = layer.x % period;
	};

	layers.forEach(measure);

	let dragging = false;
	let activePointer: number | null = null;
	let lastPointerX = 0;
	let lastPointerTime = 0;
	let pointerVelocity = 0;
	let lastInteraction = performance.now() - 5000;

	const tick = (_time: number, deltaTime: number) => {
		// Cap dt so a stalled frame can't teleport the rows.
		const dt = Math.min(deltaTime / 1000, 0.05);
		const idle = performance.now() - lastInteraction > 700;
		const velocityDecay = Math.exp(-2.6 * dt);

		for (const layer of layers) {
			// Auto-scroll fades in only when idle and not dragging.
			const autoTarget =
				!dragging && idle && !reduceMotion.matches ? 1 : 0;
			// Ease toward the target instead of snapping, for a smooth resume.
			layer.auto += (autoTarget - layer.auto) * (1 - Math.exp(-5 * dt));
			layer.velocity *= velocityDecay;
			if (Math.abs(layer.velocity) < 1) layer.velocity = 0;

			// Momentum plus the auto-scroll drift.
			layer.x +=
				(layer.velocity + layer.direction * layer.speed * layer.auto) *
				dt;

			// Keep x inside one period: [period, 0).
			if (layer.period > 0) {
				layer.x =
					(((layer.x % layer.period) + layer.period) % layer.period) -
					layer.period;
			}

			gsap.set(layer.track, { x: layer.x });
		}
	};

	const isPrimary = (event: PointerEvent) =>
		event.pointerType !== "mouse" || event.button === 0;

	const onPointerDown = (event: PointerEvent) => {
		if (dragging || !isPrimary(event)) return;

		const target = event.target as HTMLElement | null;
		if (target?.closest("a, button, [role='link'], [data-no-drag]")) return;

		dragging = true;
		activePointer = event.pointerId;
		lastPointerX = event.clientX;
		lastPointerTime = performance.now();
		pointerVelocity = 0;
		lastInteraction = lastPointerTime;
		section.setPointerCapture(event.pointerId);
		section.classList.add("cursor-grabbing");
	};

	const onPointerMove = (event: PointerEvent) => {
		if (!dragging || event.pointerId !== activePointer) return;

		const now = performance.now();
		const dx = event.clientX - lastPointerX;
		// Guard against zero dt, which would divide by zero below.
		const dt = Math.max((now - lastPointerTime) / 1000, 0.001);

		lastPointerX = event.clientX;
		lastPointerTime = now;
		// Pixels per second, used as the release fling.
		pointerVelocity = dx / dt;
		lastInteraction = now;

		for (const layer of layers) {
			layer.x += dx * layer.drag;
			layer.velocity = 0;
		}
	};

	const onPointerUp = (event: PointerEvent) => {
		if (!dragging || event.pointerId !== activePointer) return;

		dragging = false;
		activePointer = null;
		lastInteraction = performance.now();

		// Hand the pointer speed to the rows as momentum.
		const fling = gsap.utils.clamp(-2600, 2600, pointerVelocity);
		for (const layer of layers) {
			layer.velocity = fling * 0.55 * layer.drag;
		}

		if (section.hasPointerCapture(event.pointerId)) {
			section.releasePointerCapture(event.pointerId);
		}
		section.classList.remove("cursor-grabbing");
	};

	const onWheel = (event: WheelEvent) => {
		if (dragging) return;
		event.preventDefault();

		// Normalize wheel deltas to pixels (1 = lines, 2 = pages).
		const unit =
			event.deltaMode === 1
				? 16
				: event.deltaMode === 2
					? window.innerHeight
					: 1;
		const delta =
			(Math.abs(event.deltaX) > Math.abs(event.deltaY)
				? event.deltaX
				: event.deltaY) * unit;

		lastInteraction = performance.now();
		for (const layer of layers) {
			layer.velocity = gsap.utils.clamp(
				-3200,
				3200,
				layer.velocity - delta * 3 * layer.drag,
			);
		}
	};

	// Row markup or image sizes can change; re-measure the loop distance.
	const resizeObserver = new ResizeObserver(() => {
		layers.forEach(measure);
	});
	for (const layer of layers) resizeObserver.observe(layer.track);

	section.addEventListener("pointerdown", onPointerDown);
	section.addEventListener("pointermove", onPointerMove);
	section.addEventListener("pointerup", onPointerUp);
	section.addEventListener("pointercancel", onPointerUp);
	section.addEventListener("wheel", onWheel, { passive: false });
	gsap.ticker.add(tick);

	const intro = reduceMotion.matches
		? null
		: gsap.from(
				layers.map((layer) => layer.wrapper),
				{
					yPercent: 8,
					opacity: 1,
					duration: 1.1,
					stagger: 1.14,
					ease: "bounce.inOut",
				},
			);

	return {
		destroy: () => {
			intro?.kill();
			gsap.ticker.remove(tick);
			resizeObserver.disconnect();
			section.removeEventListener("pointerdown", onPointerDown);
			section.removeEventListener("pointermove", onPointerMove);
			section.removeEventListener("pointerup", onPointerUp);
			section.removeEventListener("pointercancel", onPointerUp);
			section.removeEventListener("wheel", onWheel);
		},
	};
}
