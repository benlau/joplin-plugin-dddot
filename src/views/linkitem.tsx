import React from "react";
import { useDrag } from "react-dnd";
import { DragItemType } from "../types/drag";
import { LinkType } from "../types/link";

// @FIXME - move to types
export type Link = {
    id: string;

    title: string;

    type: LinkType;

    isTodo: boolean | undefined;

    isTodoCompleted: boolean | undefined;
}

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
    }, []);

    const onContextMenu = React.useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        props.onContextMenu(link);
    }, []);

    const onDragStart = React.useCallback((e) => {
        e.dataTransfer.clearData();
        e.dataTransfer.setData(DDDot.X_JOP_NOTE_IDS, `["${props.link.id}"]`);
    }, []);

    const [_collected, drag] = useDrag({
        type: DragItemType.Link,
    });

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
            <div

            >
                <a href="#">
                    {
                        link.isTodo === true
                            ? link.isTodoCompleted === true
                                ? "<i class='far fa-check-square'></i> "
                                : "<i class='far fa-square'></i> "
                            : ""
                    }
                    {link.title}
                </a>
            </div>
        </div>
    );
}
