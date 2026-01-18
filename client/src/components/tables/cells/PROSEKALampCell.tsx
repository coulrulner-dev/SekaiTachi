import { ChangeOpacity } from "util/color-opacity";
import React from "react";
import { GetEnumValue } from "tachi-common/types/metrics";

export default function PROSEKALampCell({
	noteLamp,
	noteLampColour,
}: {
	noteLamp: GetEnumValue<"proseka:Single", "noteLamp">;
	noteLampColour: string;
}) {
	let content = <div>{noteLamp}</div>;
	let background = ChangeOpacity(noteLampColour, 0.2);

	const noteLampLow = ChangeOpacity(noteLampColour, 0.2);

	background = `linear-gradient(-45deg, ${noteLampLow} 12%, ${noteLampLow} 100%)`;

	content = (
		<span>
			<div>{noteLamp}</div>
		</span>
	);

	return (
		<td
			style={{
				background,
				whiteSpace: "nowrap",
			}}
		>
			<strong>{content}</strong>
		</td>
	);
}
