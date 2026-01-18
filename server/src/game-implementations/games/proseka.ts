import { GoalFmtPercent, GoalOutOfFmtPercent } from "./_common";
import { CreatePBMergeFor } from "game-implementations/utils/pb-merge";
import { ProfileAvgBestN } from "game-implementations/utils/profile-calc";
import { SessionAvgBest10For } from "game-implementations/utils/session-calc";
import { IsNullish } from "utils/misc";
import { PROSEKARating } from "sekai-rg-stats";
import type { GPTServerImplementation } from "game-implementations/types";
import { FmtNum, FmtPercent } from "tachi-common/utils/util";

export const PROSEKA_IMPL: GPTServerImplementation<"proseka:Single"> = {
    chartSpecificValidators: {},
    derivers: {
        percent: ({perfectjudgements, greatjudgements, goodjudgements, badjudgements, missjudgements}) => {
            const totalJudgements = perfectjudgements + greatjudgements + goodjudgements + badjudgements + missjudgements;
            if (totalJudgements === 0) return 0;
            return ((perfectjudgements*3 + greatjudgements*2 + goodjudgements*1 + badjudgements*0 + missjudgements*0) / totalJudgements*3) * 100;
        },
    },
    scoreCalcs: {
        rating: (scoreData, chart) => PROSEKARating.calculate(scoreData.perfectjudgements, scoreData.greatjudgements, scoreData.goodjudgements, scoreData.badjudgements, scoreData.missjudgements, chart.levelNum, (scoreData.perfectjudgements + scoreData.greatjudgements + scoreData.goodjudgements + scoreData.badjudgements + scoreData.missjudgements)*3),
    },
    sessionCalcs: { naiveRating: SessionAvgBest10For("rating") },
    profileCalcs: { naiveRating: ProfileAvgBestN("rating", 30, false, 100) },
    classDerivers: {
        colour: (ratings) => {
            const rating = ratings.naiveRating;
            if (IsNullish(rating)) {
                return null;
            }
            if (rating >= 36){
                return "RAINBOW";
            } else if (rating >= 35){
                return "WHITE";
            } else if (rating >= 34){
                return "GRAY";
            } else if (rating >= 33){
                return "BLACK";
            } else if (rating >= 32){
                return "PLATINUM";
            } else if (rating >= 30){
                return "GOLD";
            } else if (rating >= 26){
                return "SILVER";
            } else if (rating >= 22){
                return "COPPER";
            } else if (rating >= 18){
                return "ORANGE";
            } else if (rating >= 14){
                return "YELLOW";
            } else if (rating >= 10){
                return "RED";
            } 
            return "BLUE";
        },
    },
    goalCriteriaFormatters: {
        percent: GoalFmtPercent,
    },
    goalProgressFormatters: {
        noteLamp: (pb) => pb.scoreData.noteLamp,
        percent: (pb) => FmtPercent(pb.scoreData.percent),
    },
    goalOutOfFormatters: {
        percent: GoalOutOfFmtPercent,
    },
    pbMergeFunctions: [
        CreatePBMergeFor("largest", "enumIndexes.noteLamp", "Best Note Lamp", (base, score) => {
            base.scoreData.noteLamp = score.scoreData.noteLamp;
        }),
    ],
    defaultMergeRefName: "Best Score",
    scoreValidators: [
		(s) => {
			if (
				s.scoreData.noteLamp === "ALL PERFECT" &&
				s.scoreData.percent !== 100
			) {
				return "An AP must have a percent of 100.";
			}

			if (
				s.scoreData.noteLamp !== "ALL PERFECT" &&
				s.scoreData.percent === 100
			) {
				return "A percent of 100 must have a lamp of ALL PERFECT.";
			}

			if (s.scoreData.noteLamp === "FULL COMBO" && s.scoreData.missjudgements > 0 || s.scoreData.badjudgements > 0) {
				return `A score with ${s.scoreData.missjudgements} misses or ${s.scoreData.badjudgements} bad judgements cannot be a FULL COMBO.`;
			}
		},
		(s) => {
			let { great, good, bad, miss } = s.scoreData.judgements;

			great ??= 0;
			good ??= 0;
			bad ??= 0;
			miss ??= 0;

			if (s.scoreData.noteLamp === "ALL PERFECT") {
				if (great + good + bad + miss > 0) {
					return "Cannot have an ALL PERFECT with any non-perfect judgements.";
				}
			}

			if (s.scoreData.noteLamp === "FULL COMBO") {
				if (miss > 0) {
					return "Cannot have a FULL COMBO if the score has misses.";
				}
			}
		},
		(s) => {
			const { maxCombo } = s.scoreData.optional;
			const { perfect, great, good, bad, miss } = s.scoreData.judgements;

			if (
				IsNullish(maxCombo) ||
				IsNullish(perfect) ||
				IsNullish(great) ||
				IsNullish(good) ||
				IsNullish(bad) ||
				IsNullish(miss)
			) {
				return;
			}

			if (s.scoreData.noteLamp !== "NONE" && perfect + great + good + bad + miss !== maxCombo) {
				const article = s.scoreData.noteLamp === "FULL COMBO" ? "a" : "an";

				return `Cannot have ${article} ${s.scoreData.noteLamp} if maxCombo is not equal to the sum of judgements.`;
			}
		},
	],
}