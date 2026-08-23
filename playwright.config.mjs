import { defineConfig } from "@playwright/test";

export default defineConfig({
	testDir: "./tests",
	fullyParallel: true,
	forbidOnly: Boolean(process.env.CI),
	retries: process.env.CI ? 1 : 0,
	reporter: "line",
	use: {
		colorScheme: "light",
		reducedMotion: "reduce",
	},
	projects: [
		{
			name: "webkit",
			grep: /@webkit/,
			use: { browserName: "webkit" },
		},
		{
			name: "chromium-visual",
			grep: /@visual/,
			use: {
				browserName: "chromium",
				channel: process.env.CI ? undefined : "chrome",
			},
		},
		...(process.env.CI
			? []
			: [
					{
						name: "chromium-smoke",
						grep: /@webkit/,
						use: { browserName: "chromium", channel: "chrome" },
					},
				]),
	],
});
