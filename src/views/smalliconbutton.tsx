import React from "react";
import cntl from "cntl";

type Props = {
    icon: string
    children?: React.ReactNode;
    tooltip?: string;
    onClick?: () => void;
}

export function SmallIconButton(props: Props) {
    const onClick = React.useCallback((e: MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        if (props.onClick) {
            props.onClick();
        }
    }, [props]);

    return (
        <div className={cntl`bg-transparent
            tooltip-bottom-right
            bg-transparent
            h-[24px] w-[24px]
            text-[--joplin-color]
            `} onClick={onClick}
        data-tooltip={props.tooltip}>
            <div
                className={cntl`hover:opacity-70 pressed:opacity-50
                w-full h-full
                flex flex-col justify-center items-center`}
            >
                {
                    props.children ? (
                        props.children
                    ) : (
                        <div>
                            <h3><i class={`fas ${props.icon}`}></i></h3>
                        </div>
                    )
                }
            </div>
        </div>
    );
}
