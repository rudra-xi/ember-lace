import type { Metadata } from "next";
import { Bodoni_Moda, Manrope } from "next/font/google";
import "./globals.css";

const bodoniModa = Bodoni_Moda({
	subsets: ["latin"],
	variable: "--font-display",
	display: "swap",
	weight: ["400", "500", "600", "700"],
});

const manrope = Manrope({
	subsets: ["latin"],
	variable: "--font-sans",
	display: "swap",
	weight: ["300", "400", "500", "600"],
});

export const metadata: Metadata = {
	title: {
		absolute: "Ember Lace — Gallery",
	},
	description:
		"Ember Lace is a layered, endless visual gallery exploring texture, silhouette, and restrained editorial aesthetics. Selected looks drift in three offset rows—drag, scroll, or let them move.",
	icons: {
		icon: [
			{ url: "/icon.svg", type: "image/svg+xml" },
			{ url: "/favicon.ico", sizes: "any" },
		],
		apple: "/apple-icon.png",
	},
	authors: [{ name: "rudra-xi", url: "https://rudra-geek-nook.vercel.app/" }],
	creator: "rudra-xi",
	keywords: [
		"Ember Lace",
		"fashion gallery",
		"editorial photography",
		"layered gallery",
		"minimal fashion",
		"endless scroll gallery",
		"monochrome fashion",
		"visual lookbook",
	],
	openGraph: {
		title: "Ember Lace — Selected Looks",
		description:
			"Three rows drift in opposite directions. Drag, scroll, or let the composition move on its own. A restrained study in layering, texture, and endless motion.",
		url: "https://ember-lace.vercel.app/",
		type: "website",
		siteName: "Ember Lace",
		images: [
			{
				url: "https://ember-lace.vercel.app/og-image.jpg",
				width: 1200,
				height: 630,
				alt: "Ember Lace – Layered fashion gallery with drifting rows",
			},
		],
	},
	twitter: {
		card: "summary_large_image",
		title: "Ember Lace — Layered Gallery",
		description:
			"An endless, draggable gallery of selected looks. Three offset rows, one continuous motion.",
		creator: "rudra-xi",
		images: ["https://ember-lace.vercel.app/og-image.jpg"],
	},
};

export default function RootLayout({ children }: LayoutProps<"/">) {
	return (
		<html
			lang="en"
			className={`${bodoniModa.variable} ${manrope.variable} h-full antialiased`}
		>
			<body className="min-h-full flex flex-col font-sans">
				{children}
			</body>
		</html>
	);
}
