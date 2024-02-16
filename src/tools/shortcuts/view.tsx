import React from "react";
import { useDrag, useDrop } from "react-dnd";
import { t } from "i18next";
import { LinkType } from "../../types/link";
import { DragItemType } from "../../types/drag";

// @FIXME - move to types
export type Link = {
    id: string;

    title: string;

    type: LinkType;

    isTodo: boolean | undefined;

    isTodoCompleted: boolean | undefined;
}

export function ShortcutItem(props: {
    link: Link
    index: number;
    onClick: (link: Link) => void;
    onContextMenu: (link: Link) => void;
    moveRow: (dragIndex: number, hoverIndex: number) => void;
    onDragged: () => void;
}) {
    const {
        link,
        index,
        moveRow,
    } = props;

    const ref = React.useRef(null);

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

    const [{ isDragging }, dragRef] = useDrag({
        type: DragItemType.Link,
        item: { index },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    });

    const [_spec, dropRef] = useDrop({
        accept: DragItemType.Link,
        hover: (item: any, monitor) => {
            // Ref: https://dev.to/crishanks/transfer-lists-with-react-dnd-3ifo
            const dragIndex = item.index;
            const hoverIndex = index;
            if (dragIndex === undefined) return;
            if (dragIndex === hoverIndex) return;
            const hoverBoundingRect = ref.current?.getBoundingClientRect();
            const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
            const hoverActualY = monitor.getClientOffset().y - hoverBoundingRect.top;

            // if dragging down, continue only when hover is smaller than middle Y
            if (dragIndex < hoverIndex && hoverActualY < hoverMiddleY) return;
            // if dragging up, continue only when hover is bigger than middle Y
            if (dragIndex > hoverIndex && hoverActualY > hoverMiddleY) return;

            moveRow(dragIndex, hoverIndex);
            item.index = hoverIndex;
        },
        drop: () => {
            props.onDragged();
        },
    });

    const itemRef = dragRef(dropRef(ref));
    const opacity = isDragging ? 0 : 1;
    const checkboxClasses = link.isTodoCompleted ? "far fa-check-square" : "far fa-square";

    return (
        <div
            class="dddot-note-item"
            dddot-note-id={link.id}
            dddot-note-title={link.title}
            onClick={onClick}
            onContextMenu={
                onContextMenu
            }
            style={{ opacity }}
        >
            <div
                ref={itemRef}
            >
                <a href="#">
                    {
                        link.isTodo && (
                            <>
                                <i class={checkboxClasses}></i><span>&nbsp;</span>
                            </>
                        )}
                    {link.title}
                </a>
            </div>
        </div>
    );
}

type Props = {
    links?: Link[];
}

export function ShortcutsView(props: Props) {
    const [links, setLinks] = React.useState<Link[]>(props.links ?? []);

    const linkRef = React.useRef(null);
    linkRef.current = links;

    React.useEffect(() => {
        setLinks(props.links ?? []);
    }, [props.links]);

    const onClick = React.useCallback((link: Link) => {
        const type = link.type === LinkType.FolderLink ? "panel.openFolder" : "dddot.openLink";
        DDDot.postMessage({
            type,
            noteId: link.id,
        });
    }, []);

    const onContextMenu = React.useCallback((link: Link) => {
        DDDot.postMessage({
            type: "shortcuts.tool.removeLink",
            id: link.id,
        });
    }, []);

    const moveRow = React.useCallback((dragIndex: number, hoverIndex: number) => {
        setLinks((prev) => {
            const newValue = [...prev];
            const tmp = newValue[dragIndex];
            newValue[dragIndex] = newValue[hoverIndex];
            newValue[hoverIndex] = tmp;
            return newValue;
        });
    }, []);

    const onDragged = React.useCallback(() => {
        DDDot.postMessage({
            type: "shortcuts.onOrderChanged",
            linkIds: linkRef.current?.map((link) => link.id) ?? [],
        });
    }, []);

    const isEmpty = (links?.length ?? 0) === 0;

    return (
        <div className="dddot-note-list">
            {
                isEmpty ? (
                    <div class='dddot-tool-help-text'>
                        {t("shortcuts.drag_note_here")}
                    </div>
                ) : (
                    links?.map((link, index) => (
                        <React.Fragment key={link.id}>
                            <ShortcutItem link={link}
                                moveRow={moveRow}
                                index={index}
                                onClick={onClick}
                                onDragged={onDragged}
                                onContextMenu={onContextMenu}/>
                        </React.Fragment>
                    ))
                )
            }
        </div>
    );
}
