import React from "react";

export function RawHtml(props: { html: string }) {
    return (
        <div dangerouslySetInnerHTML={{ __html: props.html }} />
    );
}
