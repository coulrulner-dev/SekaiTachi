import { FAST_SLOW_MAXCOMBO } from "./_common";
import { FmtNum } from "../../utils/util";
import { ClassValue, ToDecimalPlaces, zodNonNegativeInt } from "../config-utils";
import { p } from "prudence";
import { z } from "zod";
import type { INTERNAL_GAME_CONFIG, INTERNAL_GAME_PT_CONFIG } from "../../types/internals";

export const PROSEKA_CONF = {
	name: "Project Sekai",
	playtypes: ["Single"],
	songData: z.strictObject({
		genre: z.string(),
		displayVersion: z.string(),
		duration: z.number().optional(),
	}),
} as const satisfies INTERNAL_GAME_CONFIG;

export const PROSEKAColours = [
	ClassValue("BLUE", "青", "Blue: 0 - 9.99 Rating"),
	ClassValue("RED", "赤", "Red: 10 - 13.99 Rating"),
	ClassValue("YELLOW", "黄", "Yellow: 14 - 17.99 Rating"),
	ClassValue("ORANGE", "橙", "Orange: 18 - 21.99 Rating"),
	ClassValue("COPPER", "銅", "Copper: 22 - 25.99 Rating"),
	ClassValue("SILVER", "銀", "Silver: 26 - 29.99 Rating"),
	ClassValue("GOLD", "金", "Gold: 30 - 31.99 Rating"),
	ClassValue("PLATINUM", "鉑", "Platinum: 32 - 32.99 Rating"),
	ClassValue("RAINBOW", "虹", "Rainbow: 33 - 33.99 Rating"),
	ClassValue("WHITE", "天使", "White: 34 - 34.99 Rating"),
	ClassValue("GRAY", "宇宙", "Gray: 35 - 35.99 Rating"),
	ClassValue("BLACK", "神", "Black: >=36 Rating"),
];

export const PROSEKA_SINGLE_CONF = {
	providedMetrics: {
		noteLamp: {
			type: "ENUM",
			values: ["NONE", "FULL COMBO", "ALL PERFECT"],
			minimumRelevantValue: "FULL COMBO",
			description: "The type of combo this was.",
		},
		clearLamp: {
			type: "ENUM",
			values: ["FAILED", "CLEAR"],
			minimumRelevantValue: "CLEAR",
			description: "The type of clear this was.",
		},
	},

	// ✅ REQUIRED BY INTERNAL_GAME_PT_CONFIG
	derivedMetrics: {},

	defaultMetric: "clearLamp",
	preferredDefaultEnum: "noteLamp",

	optionalMetrics: {
		...FAST_SLOW_MAXCOMBO,
		scoreGraph: {
			type: "GRAPH",
			validate: p.isBetween(0, 1010000),
			description: "The history of the projected score, queried in one-second intervals.",
		},
		lifeGraph: {
			type: "GRAPH",
			validate: p.isBetween(0, 999),
			description: "Challenge gauge history, queried in one-second intervals.",
		},
	},

	scoreRatingAlgs: {
		rating: {
			description: "The rating value of this score.",
			formatter: ToDecimalPlaces(2),
		},
	},
	sessionRatingAlgs: {
		naiveRating: {
			description: "The average of your best 10 ratings this session.",
			formatter: ToDecimalPlaces(2),
		},
	},
	profileRatingAlgs: {
		naiveRating: {
			description: "The average of your best 30 ratings.",
			formatter: ToDecimalPlaces(2),
			associatedScoreAlgs: ["rating"],
		},
	},

	defaultScoreRatingAlg: "rating",
	defaultSessionRatingAlg: "naiveRating",
	defaultProfileRatingAlg: "naiveRating",

	// This game technically has a dynamic set of difficulties, with a chart being
	// able to have as many WORLD'S END charts as it likes. However, this is a little
	// awkward to implement, and I can't be bothered. Sorry!
	difficulties: {
		type: "FIXED",
		order: ["EASY", "NORMAL", "HARD", "EXPERT", "MASTER", "APPEND"],
		shorthand: {
			EASY: "E",
			NORMAL: "N",
			HARD: "H",
			EXPERT: "E",
			MASTER: "M",
			APPEND: "A",
		},
		default: "MASTER",
	},

	classes: {
		colour: {
			type: "DERIVED",
			values: PROSEKAColours,
			minimumScores: 50,
			minimumRelevantValue: "RAINBOW",
		},
	},

	orderedJudgements: ["perfect", "great", "good", "bad", "miss"],

	versions: {
		proseka: "PROJECT SEKAI",
		ourstage: "OURSTAGE",
	},

	chartData: z.strictObject({
		inGameID: zodNonNegativeInt,
	}),

	preferences: z.strictObject({}),

	scoreMeta: z.strictObject({}),

	supportedMatchTypes: ["inGameID", "songTitle", "tachiSongID"],
} as const satisfies INTERNAL_GAME_PT_CONFIG;
