import React from "react";

type Props = {
    children?: React.ReactNode;
    height: number;
}

export function FixedHeightContainer(props: Props) {
    const {
        children,
        height,
    } = props;

    return (
        <div style={{ height }}
            className="overflow-y-auto"
        >
            {children}
        </div>
    );
}
