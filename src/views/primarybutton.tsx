import React from "react";
import cn from "classnames";
import { t } from "i18next";

type Props = {
    tooltip?: string;
    className?: string;
    children?: React.ReactNode;
    onClick?: () => void;
}

export function PrimaryButton(props: Props) {
    const tooltip = props.tooltip != null ? t(props.tooltip) : null;
    const className = cn(props.className, {
        "tooltip-multiline": props.tooltip != null,
    }, [
        "bg-transparent",
        "hover:bg-[#ffffff7f]",
        "active:bg-[#ffffff5f]",
        "bg-transparent",
        "py-[4px]",
        "rounded-[4px]",
        "border-[1px] border-solid border-[--joplin-color]",
        "my-[4px]",
        "text-[--joplin-color]",
    ]);

    return (
        <button class={className} data-tooltip={t(tooltip)} onClick={props.onClick}>
            {props.children}
        </button>
    );
}
