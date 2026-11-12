import { images } from "@/assets/images";
import type { GapSlot, ImageSlot, Look, Slot } from "@/types/gallery";

export const COPIES = 4;

export const LOOKS: Look[] = Object.values(images).map((src, index) => ({
	src,
	alt: `Ember Lace look ${index + 1}`,
}));

export const pick = (indices: number[]) => indices.map((index) => LOOKS[index]);

export const EDGE_FADE = {
	maskImage:
		"linear-gradient(to right, transparent 0%, #000 7%, #000 93%, transparent 100%)",
	WebkitMaskImage:
		"linear-gradient(to right, transparent 0%, #000 7%, #000 93%, transparent 100%)",
} as const;

/** Deterministic [0, 1) random — same on server and client. */
export const hash01 = (n: number) => {
	const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
	return x - Math.floor(x);
};

export const gap = (width: string): GapSlot => ({ kind: "gap", width });

export const imageSlots = (
	indices: number[],
	opts: {
		minH: number;
		maxH: number;
		minO: number;
		maxO: number;
		seed: number;
	},
): ImageSlot[] =>
	pick(indices).map((look, i) => ({
		kind: "image",
		look,
		heightPct: opts.minH + hash01(opts.seed + i) * (opts.maxH - opts.minH),
		opacity:
			opts.minO + hash01(opts.seed + i + 100) * (opts.maxO - opts.minO),
	}));

/** Base gap after every image; rhythm[i] adds that many extra major gaps. */
export const withRhythm = (
	slots: ImageSlot[],
	rhythm: number[],
	baseGap: string,
	majorGap: string,
): Slot[] => {
	const out: Slot[] = [];
	slots.forEach((slot, i) => {
		out.push(slot);
		out.push(gap(baseGap));
		const extras = rhythm[i] ?? 0;
		for (let u = 0; u < extras; u++) {
			out.push(gap(majorGap));
		}
	});
	return out;
};
