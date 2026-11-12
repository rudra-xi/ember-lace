"use client";

import gsap from "gsap";
import Link from "next/link";
import { useEffect, useRef } from "react";
import type { RowConfig } from "@/types/gallery";
import { BACK_ROW, BackRow } from "./back-row";
import { FRONT_ROW, FrontRow } from "./front-row";
import { MID_ROW, MidRow } from "./mid-row";

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

export function ImageGallery() {
	const sectionRef = useRef<HTMLElement>(null);
	const rowRefs = useRef<Array<HTMLDivElement | null>>([]);
	const trackRefs = useRef<Array<HTMLDivElement | null>>([]);

	useEffect(() => {
		const section = sectionRef.current;
		if (!section) return;

		const wrappers = rowRefs.current;
		const tracks = trackRefs.current;
		if (wrappers.some((node) => !node) || tracks.some((node) => !node))
			return;

		const reduceMotion = window.matchMedia(
			"(prefers-reduced-motion: reduce)",
		);

		const configs = [MID_ROW, FRONT_ROW, BACK_ROW]; // order matches ref indices below

		const layers: Layer[] = configs.map((config, index) => ({
			track: tracks[index] as HTMLDivElement,
			wrapper: wrappers[index] as HTMLDivElement,
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
			const dt = Math.min(deltaTime / 1000, 0.05);
			const idle = performance.now() - lastInteraction > 700;
			const velocityDecay = Math.exp(-2.6 * dt);

			for (const layer of layers) {
				const autoTarget =
					!dragging && idle && !reduceMotion.matches ? 1 : 0;
				layer.auto +=
					(autoTarget - layer.auto) * (1 - Math.exp(-5 * dt));
				layer.velocity *= velocityDecay;
				if (Math.abs(layer.velocity) < 1) layer.velocity = 0;

				layer.x +=
					(layer.velocity +
						layer.direction * layer.speed * layer.auto) *
					dt;

				if (layer.period > 0) {
					layer.x =
						(((layer.x % layer.period) + layer.period) %
							layer.period) -
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
			if (target?.closest("a, button, [role='link'], [data-no-drag]"))
				return;

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
			const dt = Math.max((now - lastPointerTime) / 1000, 0.001);

			lastPointerX = event.clientX;
			lastPointerTime = now;
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

		return () => {
			intro?.kill();
			gsap.ticker.remove(tick);
			resizeObserver.disconnect();
			section.removeEventListener("pointerdown", onPointerDown);
			section.removeEventListener("pointermove", onPointerMove);
			section.removeEventListener("pointerup", onPointerUp);
			section.removeEventListener("pointercancel", onPointerUp);
			section.removeEventListener("wheel", onWheel);
		};
	}, []);

	return (
		<section
			ref={sectionRef}
			aria-label="Ember Lace image gallery"
			className="relative h-dvh w-full touch-none select-none overflow-hidden bg-background text-foreground cursor-grab"
		>
			<div className="absolute inset-0">
				{/* Back row */}
				<div
					className="absolute left-0 right-0 top-1/2 -translate-y-1/2 z-10"
					style={{
						transform:
							"translateY(calc(-50% - clamp(40px, 9dvh, 110px)))",
					}}
				>
					<BackRow
						wrapperRef={(node) => {
							rowRefs.current[2] = node;
						}}
						trackRef={(node) => {
							trackRefs.current[2] = node;
						}}
					/>
				</div>

				{/* Mid row */}
				<div
					className="absolute left-0 right-0 top-1/2 -translate-y-1/3 z-20"
					style={{
						transform:
							"translateY(calc(-50% + clamp(10px, 3dvh, 40px)))",
					}}
				>
					<MidRow
						wrapperRef={(node) => {
							rowRefs.current[0] = node;
						}}
						trackRef={(node) => {
							trackRefs.current[0] = node;
						}}
					/>
				</div>

				{/* Front row */}
				<div className="absolute left-0 right-0 top-1/2 -translate-y-1/4 z-30">
					<FrontRow
						wrapperRef={(node) => {
							rowRefs.current[1] = node;
						}}
						trackRef={(node) => {
							trackRefs.current[1] = node;
						}}
					/>
				</div>
			</div>

			<div className="pointer-events-none absolute inset-0 z-20 flex flex-col justify-between p-8">
				<div className="flex items-start justify-between gap-4 text-xl uppercase tracking-widest2">
					<h1 className="underline underline-offset-4">Ember Lace</h1>
					<p className="text-xs">Dressed in clouds of spun pearl.</p>
				</div>
				<div className="flex items-end justify-between gap-4 text-xs uppercase tracking-widest2">
					<p className="w-2/4">
						She is a beam of silver moonlight resting upon a sea of
						midnight blue, draped in clouds of white silk and lace,
						looking through twin windows of twilight sky.
					</p>
					<div className="pointer-events-auto flex gap-4 z-50 font-display">
						<Link
							href="https://github.com/rudra-xi"
							target="_blank"
							rel="noreferrer"
							className="hover:underline underline-offset-4"
						>
							Github
						</Link>
						<Link
							href="https://www.linkedin.com/in/goutam-rudraxi/"
							target="_blank"
							rel="noreferrer"
							className="hover:underline underline-offset-4"
						>
							LinkedIn
						</Link>
					</div>
				</div>
			</div>
		</section>
	);
}

export default ImageGallery;
