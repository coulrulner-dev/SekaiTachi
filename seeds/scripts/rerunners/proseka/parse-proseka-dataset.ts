import fs from "fs";
import path from "path";
import https from "https";
import { CreateChartID } from "../../util.js";

interface SekaiMusic {
	id: number;
	title: string;
	composer?: string;
	arranger?: string;
	lyricist?: string;
	publishedAt?: number;
	categories?: string[];
	assetbundleName?: string;
}

interface SekaiDifficulty {
	id: number;
	musicId: number;
	musicDifficulty: string;
	playLevel: number;
	totalNoteCount: number;
	releaseConditionId?: number;
}

interface TachiSong {
	altTitles: string[];
	artist: string;
	data: {
		genre?: string;
	};
	id: number;
	searchTerms: string[];
	title: string;
}

interface TachiChart {
	chartID: string;
	data: {
		inGameID: number;
	};
	difficulty: string;
	level: string;
	levelNum: number;
	playtype: string;
	songID: number;
	versions: string[];
	isPrimary: boolean;
}

// Fetch JSON from URL
function fetchJSON<T>(url: string): Promise<T> {
	return new Promise((resolve, reject) => {
		https
			.get(url, (res) => {
				let data = "";
				res.on("data", (chunk) => (data += chunk));
				res.on("end", () => {
					try {
						resolve(JSON.parse(data));
					} catch (err) {
						reject(err);
					}
				});
			})
			.on("error", reject);
	});
}

const outputDir = "../../../collections/";

const MUSICS_URL =
	"https://raw.githubusercontent.com/Sekai-World/sekai-master-db-diff/main/musics.json";
const DIFFICULTIES_URL =
	"https://raw.githubusercontent.com/Sekai-World/sekai-master-db-diff/main/musicDifficulties.json";

// Main function
(async () => {
	console.log("Fetching data from GitHub...");

	let musicsData: SekaiMusic[];
	let difficultiesData: SekaiDifficulty[];

	try {
		console.log("Fetching musics.json...");
		musicsData = await fetchJSON<SekaiMusic[]>(MUSICS_URL);
		console.log(`✓ Loaded ${musicsData.length} songs from GitHub`);
	} catch (err) {
		console.error(`Error fetching musics.json:`, (err as Error).message);
		process.exit(1);
	}

	try {
		console.log("Fetching musicDifficulties.json...");
		difficultiesData = await fetchJSON<SekaiDifficulty[]>(DIFFICULTIES_URL);
		console.log(`✓ Loaded ${difficultiesData.length} difficulties from GitHub`);
	} catch (err) {
		console.error(`Error fetching musicDifficulties.json:`, (err as Error).message);
		process.exit(1);
	}

	// Parse songs
	console.log("\nParsing songs...");
	const songs: TachiSong[] = musicsData.map((music) => ({
		altTitles: [],
		artist: music.composer || music.arranger || "Unknown",
		data: {
			genre:
				music.categories && music.categories.length > 0 ? music.categories[0] : undefined,
		},
		id: music.id,
		searchTerms: [],
		title: music.title,
	}));

	console.log(`✓ Parsed ${songs.length} songs`);

	// Parse charts with UPPERCASE difficulties matching your config
	console.log("\nParsing charts...");
	const difficultyMap: Record<string, string> = {
		easy: "EASY",
		normal: "NORMAL",
		hard: "HARD",
		expert: "EXPERT",
		master: "MASTER",
		append: "APPEND",
	};

	const charts: TachiChart[] = difficultiesData.map((diff) => {
		const diffName = difficultyMap[diff.musicDifficulty] || diff.musicDifficulty.toUpperCase();

		return {
			chartID: CreateChartID(),
			data: {
				inGameID: diff.id, // Using the difficulty's ID as inGameID
			},
			difficulty: diffName,
			level: String(diff.playLevel),
			levelNum: diff.playLevel,
			playtype: "Single",
			songID: diff.musicId,
			versions: ["proseka"], // Using the version key from your config
			isPrimary: true,
		};
	});

	console.log(`✓ Parsed ${charts.length} charts`);

	// Create output directory if it doesn't exist
	if (!fs.existsSync(outputDir)) {
		fs.mkdirSync(outputDir, { recursive: true });
		console.log(`\n✓ Created output directory: ${outputDir}`);
	}

	// Write output files
	const songsOutputPath = path.join(outputDir, "songs-proseka.json");
	const chartsOutputPath = path.join(outputDir, "charts-proseka.json");

	try {
		fs.writeFileSync(songsOutputPath, JSON.stringify(songs, null, "\t"));
		console.log(`\n✓ Wrote ${songs.length} songs to ${songsOutputPath}`);
	} catch (err) {
		console.error(`Error writing songs file:`, (err as Error).message);
		process.exit(1);
	}

	try {
		fs.writeFileSync(chartsOutputPath, JSON.stringify(charts, null, "\t"));
		console.log(`✓ Wrote ${charts.length} charts to ${chartsOutputPath}`);
	} catch (err) {
		console.error(`Error writing charts file:`, (err as Error).message);
		process.exit(1);
	}

	// Print summary
	console.log("\n=== Summary ===");
	console.log(`Songs: ${songs.length}`);
	console.log(`Charts: ${charts.length}`);
	console.log("\nDifficulty breakdown:");
	const diffCounts: Record<string, number> = {};
	charts.forEach((chart) => {
		diffCounts[chart.difficulty] = (diffCounts[chart.difficulty] || 0) + 1;
	});
	Object.entries(diffCounts)
		.sort()
		.forEach(([diff, count]) => {
			console.log(`  ${diff}: ${count}`);
		});

	console.log("\n✓ Done!");
})();
