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
    });

    return (
        <div class={className} data-tooltip={t(tooltip)} onClick={props.onClick}>
            <button class="dddot-clickable">
                {props.children}
            </button>
        </div>
    );
}
