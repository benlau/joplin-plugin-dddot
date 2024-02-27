import React from "react";
import { SmallIconButton } from "../views/smalliconbutton";

type Props = {
    isExpanded: boolean;
    onClick: () => void;
}

export function ExpandButton(props: Props) {
    const styles = props.isExpanded ? {
        transformOrigin: "center center",
        transform: "translate(2px,2px) rotate(90deg)",
    } : {
        transformOrigin: "center center",
        transform: "translate(0px,4px) rotate(180deg)",
    };

    return (
        <SmallIconButton
            icon="fa-play"
            onClick={props.onClick}
        >
            <div
                style={styles}
                className="w-full h-fil flex flex-col justify-center items-center">
                <h3>
                    <i class="fas fa-play"></i>
                </h3>
            </div>
        </SmallIconButton>
    );
}
