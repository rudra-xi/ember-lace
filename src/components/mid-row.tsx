import Image from "next/image";
import { COPIES, EDGE_FADE, imageSlots, withRhythm } from "@/constants/gallery";
import type { RowConfig } from "@/types/gallery";

const BASE_GAP = "clamp(150px, 6vw, 100px)";
const MAJOR_GAP = "clamp(218px, 8vw, 144px)";

export const MID_ROW: RowConfig = {
	slots: withRhythm(
		imageSlots([3, 1, 4, 11, 9, 5, 6], {
			minH: 90,
			maxH: 98,
			minO: 0.6,
			maxO: 0.8,
			seed: 3,
		}),
		[1, 0, 0, 1, 0, 1, 0], // extra major gaps after image i
		BASE_GAP,
		MAJOR_GAP,
	),
	direction: -1,
	speed: 26,
	drag: 0.8,
	heightClass: "h-[26dvh]",
};

type Props = {
	trackRef: (node: HTMLDivElement | null) => void;
	wrapperRef: (node: HTMLDivElement | null) => void;
};

export function MidRow({ trackRef, wrapperRef }: Props) {
	const row = MID_ROW;

	return (
		<div
			ref={wrapperRef}
			className={`${row.heightClass} overflow-hidden`}
			style={EDGE_FADE}
		>
			<div
				ref={trackRef}
				className="grid h-full w-max grid-flow-col auto-cols-max items-center will-change-transform"
			>
				{Array.from({ length: COPIES }, (_, copy) =>
					row.slots.map((slot, i) => {
						if (slot.kind === "gap") {
							return (
								<div
									key={`${copy}-${i}-gap`}
									aria-hidden
									className="h-full"
									style={{ width: slot.width }}
								/>
							);
						}
						const { look, heightPct, opacity } = slot;
						return (
							<figure
								key={`${copy}-${i}`}
								aria-hidden={copy > 0}
								className="relative overflow-hidden"
								style={{
									height: `${heightPct}%`,
									aspectRatio: `${look.src.width} / ${look.src.height}`,
									opacity,
								}}
							>
								<Image
									src={look.src}
									alt={copy === 0 ? look.alt : ""}
									fill
									draggable={false}
									sizes="(max-width: 640px) 45vw, 32vw"
									className="object-cover grayscale"
								/>
							</figure>
						);
					}),
				)}
			</div>
		</div>
	);
}
