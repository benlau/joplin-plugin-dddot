import React from "react";
import { PrimaryButton } from "./primarybutton";

type Props = {
    header?: React.ReactNode;
    onClose: () => void;
    children?: React.ReactNode;
}

export function Overlay(props: Props) {
    const onClick = React.useCallback((e: MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
    }, []);

    return (
        <div className="absolute top-0 right-0 left-0 bottom-0 bg-[--joplin-background-color] z-[100] flex flex-col"
            onClick={onClick}>
            <div className="height-[26px] flex flex-row justify-between center">
                <div>
                    {props.header}
                </div>
                <div className="flex flex-col justify-center">
                    <PrimaryButton onClick={props.onClose}>
                        <i class="fas fa-times"></i>
                    </PrimaryButton>
                </div>
            </div>
            <div className="flex-1 flex flex-col">
                {props.children}
            </div>
        </div>
    );
}
