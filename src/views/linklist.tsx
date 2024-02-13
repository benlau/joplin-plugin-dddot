import React from "react";
import { useDrag } from "react-dnd";
import { DragItemType } from "../types/drag";
import { LinkType } from "../types/link";

export type Link = {
    id: string;

    title: string;

    type: LinkType;

    isTodo: boolean | undefined;

    isTodoCompleted: boolean | undefined;
}

function LinkItem(props: {
    link: Link
    onClick: (link: Link) => void;
    onContextMenu: (link: Link) => void;
}) {
    // @FIXME note-title should be escaped

    const {
        link,
    } = props;

    const onClick = React.useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        props.onClick(link);
    }, []);

    const [_collected, drag] = useDrag({
        type: DragItemType.Link,
    });

    const onContextMenu = React.useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        props.onContextMenu(link);
    }, []);

    const onDragStart = React.useCallback((e) => {
        e.dataTransfer.clearData();
        e.dataTransfer.setData(DDDot.X_JOP_NOTE_IDS, `["${link.id}"]`);
    }, []);

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

type Props = {
    links: Link[];
    onClick: (link: Link) => void;
    onContextMenu: (link: Link) => void;
}

export function LinkList(props: Props) {
    return (
        <div className="dddot-note-list">
            {
                props.links.map((link) => (
                    <React.Fragment key={link.id}>
                        <LinkItem link={link}
                            onClick={props.onClick}
                            onContextMenu={props.onContextMenu}/>
                    </React.Fragment>
                ))
            }
        </div>
    );
}
