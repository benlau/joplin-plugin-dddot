import React from "react";
import {RawHtml} from "../../sandbox/rawhtml";

type Props = {
    html: string|undefined;
}

export function BacklinksView(props: Props) {
    return (
        <RawHtml html={props.html} />
    )
}
