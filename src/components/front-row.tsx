import Image from "next/image";
import { COPIES, EDGE_FADE, imageSlots, withRhythm } from "@/constants/gallery";
import type { RowConfig } from "@/types/gallery";

const BASE_GAP = "clamp(156px, 1vw, 180px)";
const MAJOR_GAP = "clamp(422px, 9vw, 520px)";

export const FRONT_ROW: RowConfig = {
	slots: withRhythm(
		imageSlots([12, 18, 13, 7, 14, 19, 15], {
			minH: 84,
			maxH: 94,
			minO: 0.65,
			maxO: 0.7,
			seed: 21,
		}),
		[0, 1, 0, 0, 1, 0, 1], // extra major gaps after image i
		BASE_GAP,
		MAJOR_GAP,
	),
	direction: 1,
	speed: 28,
	drag: 1.15,
	heightClass: "h-[32dvh]",
};

type Props = {
	trackRef: (node: HTMLDivElement | null) => void;
	wrapperRef: (node: HTMLDivElement | null) => void;
};

export function FrontRow({ trackRef, wrapperRef }: Props) {
	const row = FRONT_ROW;

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
									sizes="(max-width: 670px) 55vw, 36vw"
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
