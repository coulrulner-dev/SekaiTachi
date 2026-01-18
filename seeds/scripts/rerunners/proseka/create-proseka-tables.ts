import { Command } from "commander";
import { GetGamePTConfig } from "tachi-common";
import { CreateFolderID, MutateCollection, ReadCollection } from "../../util.js";

// Levels 1-40 for ProSekai
const LEVELS: string[] = [];
for (let i = 1; i <= 40; i++) {
	LEVELS.push(String(i));
}

const DIFFICULTIES = ["EASY", "NORMAL", "HARD", "EXPERT", "MASTER", "APPEND"];

const existingFolderIDs = new Set(ReadCollection("folders.json").map((f: any) => f.folderID));

const command = new Command().requiredOption("-v, --version <version>").parse(process.argv);
const options = command.opts();
const version = options.version;

const tachiVersions = GetGamePTConfig("proseka", "Single").versions;
const versionName = tachiVersions[version];

if (!versionName) {
	throw new Error(
		`Invalid version of ${version}. Please update game config before adding tables and folders.`
	);
}

const newFolders: any[] = [];
const levelFolderIDs: string[] = [];
const difficultyFolderIDs: string[] = [];

for (const level of LEVELS) {
	const data = { level, versions: version };
	const folderID = CreateFolderID(data, "proseka", "Single");

	levelFolderIDs.push(folderID);

	if (existingFolderIDs.has(folderID)) {
		continue;
	}

	newFolders.push({
		data,
		folderID,
		game: "proseka",
		inactive: false,
		playtype: "Single",
		searchTerms: [],
		title: `Level ${level} (${versionName})`,
		type: "charts",
	});
	existingFolderIDs.add(folderID);
}

for (const difficulty of DIFFICULTIES) {
	const data = { versions: version, difficulty };

	const folderID = CreateFolderID(data, "proseka", "Single");

	difficultyFolderIDs.push(folderID);

	if (existingFolderIDs.has(folderID)) {
		continue;
	}

	newFolders.push({
		data,
		folderID,
		game: "proseka",
		inactive: false,
		playtype: "Single",
		searchTerms: [],
		title: `${difficulty} (${versionName})`,
		type: "charts",
	});

	existingFolderIDs.add(folderID);
}

MutateCollection("tables.json", (ts: any[]) => {
	const filtered = ts.filter(
		(t) =>
			t.tableID !== `proseka-Single-${version}-levels` &&
			t.tableID !== `proseka-Single-${version}-difficulties`
	);

	filtered.push(
		{
			default: false,
			description: `Levels for Project Sekai in ${versionName}.`,
			folders: levelFolderIDs,
			game: "proseka",
			inactive: false,
			playtype: "Single",
			tableID: `proseka-Single-${version}-levels`,
			title: `Project Sekai (${versionName})`,
		},
		{
			default: false,
			description: `Difficulties for Project Sekai in ${versionName}.`,
			folders: difficultyFolderIDs,
			game: "proseka",
			inactive: false,
			playtype: "Single",
			tableID: `proseka-Single-${version}-difficulties`,
			title: `Project Sekai (${versionName}) (Difficulties)`,
		}
	);

	return filtered;
});

MutateCollection("folders.json", (fs: any[]) => [...fs, ...newFolders]);

console.log(`✓ Created ${newFolders.length} new folders for ProSekai ${versionName}`);
console.log(`  - ${levelFolderIDs.length} level folders (1-40)`);
console.log(`  - ${difficultyFolderIDs.length} difficulty folders`);
console.log(`✓ Updated tables.json with 2 new tables`);

// npx tsx create-proseka-tables.ts -v proseka
// npx tsx create-proseka-tables.ts -v ourstage
