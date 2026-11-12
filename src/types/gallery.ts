import type { StaticImageData } from "next/image";

export type Look = {
	src: StaticImageData;
	alt: string;
};

export type RowDirection = 1 | -1;

export type ImageSlot = {
	kind: "image";
	look: Look;
	heightPct: number;
	opacity: number;
};

export type GapSlot = {
	kind: "gap";
	width: string;
};

export type Slot = ImageSlot | GapSlot;

export type RowConfig = {
	slots: Slot[];
	direction: RowDirection;
	speed: number;
	drag: number;
	heightClass: string;
};
