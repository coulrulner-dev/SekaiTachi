import { IsNullish } from "util/misc";
import React from "react";
import { COLOUR_SET, PBScoreDocument, ScoreDocument } from "tachi-common";
import { RAINBOW_GRADIENT } from "lib/games/_util";

export default function PROSEKAJudgementCell({
    score,
}: {
    score: ScoreDocument<"proseka:Single"> | PBScoreDocument<"proseka:Single">;
}) {
    const judgements = score.scoreData.judgements;

    if (
        IsNullish(judgements.miss) ||
        IsNullish(judgements.bad) ||
        IsNullish(judgements.good) ||
        IsNullish(judgements.great) ||
        IsNullish(judgements.perfect)
    ) {
        return <td>No Data.</td>;
    }

    return (
        <td>
            <strong>
                <span style={{ color: RAINBOW_GRADIENT.background }}>{judgements.perfect}</span>-
                <span style={{ color: COLOUR_SET.pink }}>{judgements.great}</span>-
                <span style={{ color: COLOUR_SET.paleBlue }}>{judgements.good}</span>-
                <span style={{ color: COLOUR_SET.vibrantGreen }}>{judgements.bad}</span>
                <span style={{ color: COLOUR_SET.gray }}>{judgements.miss}</span>
            </strong>
        </td>
    );
}
