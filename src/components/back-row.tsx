import Image from "next/image";
import { COPIES, EDGE_FADE, imageSlots, withRhythm } from "@/constants/gallery";
import type { RowConfig } from "@/types/gallery";

const BASE_GAP = "clamp(150px, 4vw, 12px)";
const MAJOR_GAP = "clamp(220px, 8vw, 60px)";

export const BACK_ROW: RowConfig = {
	slots: withRhythm(
		imageSlots([0, 17, 2, 8, 10, 20, 16], {
			minH: 84,
			maxH: 90,
			minO: 0.7,
			maxO: 0.9,
			seed: 7,
		}),
		[0, 1, 1, 0, 1, 0, 1], // extra major gaps after image i
		BASE_GAP,
		MAJOR_GAP,
	),
	direction: 1,
	speed: 18,
	drag: 0.95,
	heightClass: "h-[26dvh]",
};

type Props = {
	trackRef: (node: HTMLDivElement | null) => void;
	wrapperRef: (node: HTMLDivElement | null) => void;
};

export function BackRow({ trackRef, wrapperRef }: Props) {
	const row = BACK_ROW;

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
