import { FAST_SLOW_MAXCOMBO } from "./_common";
import { FmtNum, FmtPercent, FmtScoreNoCommas } from "../../utils/util";
import { ClassValue, ToDecimalPlaces, zodNonNegativeInt } from "../config-utils";
import { p } from "prudence";
import { z } from "zod";
import type { INTERNAL_GAME_CONFIG, INTERNAL_GAME_PT_CONFIG } from "../../types/internals";

export const PROSEKA_CONF = {
    name: "Project Sekai: Colorful Stage! feat. Hatsune Miku",
    playtypes: ["Single"],
    songData: z.strictObject({
		genre: z.string().optional(),
    }),
} as const satisfies INTERNAL_GAME_CONFIG;

export const PROSEKAColours = [
    ClassValue("BLUE", "青", "Blue: 0 - 9.99 Rating"),
    ClassValue("RED", "赤", "Red: 10 - 14.99 Rating"),
    ClassValue("YELLOW", "黄", "Yellow: 15 - 19.99 Rating"),
    ClassValue("ORANGE", "橙", "Orange: 20 - 24.99 Rating"),
    ClassValue("COPPER", "銅", "Copper: 25 - 28.99 Rating"),
    ClassValue("SILVER", "銀", "Silver: 29 - 31.99 Rating"),
    ClassValue("GOLD", "金", "Gold: 32 - 33.99 Rating"),
    ClassValue("PLATINUM", "鉑", "Platinum: 34 - 35.99 Rating"),
    ClassValue("BLACK", "黒", "Black: 36 - 37.99 Rating"),
    ClassValue("GRAY", "天使", "Angel: 38 - 38.99 Rating"),
    ClassValue("WHITE", "宇宙", "Cosmic: 39 - 39.99 Rating"),
    ClassValue("RAINBOW", "神", "God: >=40 Rating"),
];

export const PROSEKA_SINGLE_CONF = {
	providedMetrics: {
		noteLamp: {
			type: "ENUM",
			values: ["NONE", "FULL COMBO", "ALL PERFECT"],
			minimumRelevantValue: "FULL COMBO",
			description: "The type of combo this was.",
		},
		perfectjudgements: {
			type: "INTEGER",
			formatter: FmtScoreNoCommas,
			validate: p.isPositiveInteger,
			description: "The amount of PERFECT judgements in this score.",
		},
		greatjudgements: {
			type: "INTEGER",
			formatter: FmtScoreNoCommas,
			validate: p.isPositiveInteger,
			description: "The amount of GREAT judgements in this score.",
		},
		goodjudgements: {
			type: "INTEGER",
			formatter: FmtScoreNoCommas,
			validate: p.isPositiveInteger,
			description: "The amount of GOOD judgements in this score.",
		},
		badjudgements: {
			type: "INTEGER",
			formatter: FmtScoreNoCommas,
			validate: p.isPositiveInteger,
			description: "The amount of BAD judgements in this score.",
		},
		missjudgements: {
			type: "INTEGER",
			formatter: FmtScoreNoCommas,
			validate: p.isPositiveInteger,
			description: "The amount of MISS judgements in this score.",
		},
	},

	derivedMetrics: {
		percent: {
        	type: "DECIMAL",
        	validate: p.isBetween(0, 100),
        	formatter: FmtPercent,
        	description: "EX Score divided by the maximum possible EX Score on this chart.",
    	},
	},

	defaultMetric: "exscore",
	preferredDefaultEnum: "noteLamp",

	optionalMetrics: {
	...FAST_SLOW_MAXCOMBO,
	},

	
	scoreRatingAlgs: {
		rating: {
			description:
				"The rating value of this score. This is identical to the system used in game.",
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

	difficulties: {
        type: "FIXED",
        order: ["EASY", "NORMAL", "HARD", "EXPERT", "MASTER", "APPEND"],
        shorthand: {
            EASY: "E",
            NORMAL: "N",
            HARD: "H",
            EXPERT: "EX",
            MASTER: "M",
            APPEND: "A",
        },
        default: "MASTER",
    },

    classes: {
        colour: {
            type: "DERIVED",
            values: PROSEKAColours,
            minimumScores: 30,
            minimumRelevantValue: "SILVER",
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

	scoreMeta: z.strictObject({
	}),


	supportedMatchTypes: ["inGameID", "songTitle", "tachiSongID"],
} as const satisfies INTERNAL_GAME_PT_CONFIG;