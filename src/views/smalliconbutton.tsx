import React from "react";
import cntl from "cntl";

type Props = {
    icon: string
    children?: React.ReactNode;
    onClick?: () => void;
}

export function SmallIconButton(props: Props) {
    const onClick = React.useCallback((e: MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        if (props.onClick) {
            props.onClick();
        }
    }, [props.onClick]);

    return (
        <div className={cntl`bg-transparent 
            hover:opacity-70
            pressed:opacity-50
            bg-transparent
            h-[24px] w-[24px]
            text-[--joplin-color]
            flex flex-col justify-center items-center
            `} onClick={onClick}>
            {
                props.children ? (
                    props.children
                ) : (
                    <div >
                        <h3><i class={`fas ${props.icon}`}></i></h3>
                    </div>
                )
            }
        </div>
    );
}
