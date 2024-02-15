import React from "react";

type ToolbarItem = {
    name: string;
    icon: string;
    tooltip: string;
    onClick: any;
    onContextMenu?: any;
}

export function IconButton(props: {
    name: string;
    icon: string;
    tooltip: string;
    onClick?: object;
    onContextMenu?: object;
}) {
    const {
        icon,
        tooltip,
    } = props;

    const onClick = React.useCallback(() => {
        DDDot.postMessage(props.onClick);
    }, [props.onClick]);

    const onContextMenu = React.useCallback(() => {
        DDDot.postMessage(props.onContextMenu);
    }, [props.onContextMenu]);

    return (
        <div class="dddot-toolbar-item tooltip-bottom-left" data-tooltip={tooltip}>
            <div class="dddot-toolbar-item-icon dddot-clickable"
                onClick={onClick} onContextMenu={onContextMenu}
            >
                <i class={`${icon} fas`}></i>
            </div>
        </div>
    );
}

type Props = {
    toolbarItems?: ToolbarItem[];
}

export function ToolbarView(props: Props) {
    const {
        toolbarItems,
    } = props;
    return (
        <div class="dddot-toolbar-content">
            {
                toolbarItems?.map((item) => (
                    <IconButton name={item.name}
                        icon={item.icon}
                        tooltip={item.tooltip}
                        onClick={item.onClick}
                        onContextMenu={item.onContextMenu}
                    />
                ))
            }
        </div>
    );
}
