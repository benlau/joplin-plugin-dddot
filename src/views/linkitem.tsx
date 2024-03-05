import React from "react";
import { useDrag } from "react-dnd";
import { DragItemType } from "../types/drag";
import { Link } from "../types/link";

export function LinkItem(props: {
    link: Link
    onClick: (link: Link) => void;
    onContextMenu: (link: Link) => void;
}) {
    const {
        link,
    } = props;

    const onClick = React.useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        props.onClick(link);
    }, [props, link]);

    const onContextMenu = React.useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        props.onContextMenu(link);
    }, [props, link]);

    const onDragStart = React.useCallback((e) => {
        e.dataTransfer.clearData();
        e.dataTransfer.setData(DDDot.X_JOP_NOTE_IDS, `["${props.link.id}"]`);
    }, [props]);

    const [_collected, drag] = useDrag({
        type: DragItemType.Link,
    });

    const checkboxClasses = link.isTodoCompleted ? "far fa-check-square" : "far fa-square";

    return (
        <div
            ref={drag}
            class="dddot-note-item"
            dddot-note-id={link.id}
            dddot-note-title={link.title}
            onClick={onClick}
            onContextMenu={
                onContextMenu
            }
            onDragStart={onDragStart}
        >
            <div>
                <a href="#">
                    {
                        link.isTodo && (
                            <>
                                <i class={checkboxClasses}></i><span>&nbsp;</span>
                            </>
                        )
                    }
                    {link.title}
                </a>
            </div>
        </div>
    );
}
