"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { createGalleryEngine } from "@/lib/gallery-engine";
import { BACK_ROW, BackRow } from "./back-row";
import { FRONT_ROW, FrontRow } from "./front-row";
import { MID_ROW, MidRow } from "./mid-row";

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

		// Order must match the ref indices assigned in JSX below.
		const configs = [MID_ROW, FRONT_ROW, BACK_ROW];

		const engine = createGalleryEngine({
			section,
			wrappers: wrappers as HTMLDivElement[],
			tracks: tracks as HTMLDivElement[],
			configs,
		});

		return () => engine.destroy();
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
