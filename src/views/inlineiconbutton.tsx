import React from "react";
import cntl from "cntl";

export function InlineIconButton(props: {
    icon: string;
    onClick: () => void;
}) {
    const onClick = React.useCallback((e: MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        props.onClick();
    }, [props]);

    return (
        <div className={cntl`bg-transparent 
    hover:opacity-70
    pressed:opacity-50
    bg-transparent
    h-[24px] w-[24px]
    text-[--joplin-color]
    flex flex-col justify-center items-center
    `} onClick={onClick} >
            <div>
                <i className="fas fa-copy"></i>
            </div>
        </div>

    );
}
