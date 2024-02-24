import React from "react";
import { useDrag, useDrop } from "react-dnd";
import { t } from "i18next";
import { Link, LinkType } from "../../types/link";
import { DragItemType } from "../../types/drag";

export function ShortcutItem(props: {
    link: Link
    index: number;
    onClick: (link: Link) => void;
    onContextMenu: (link: Link) => void;
    moveRow: (dragIndex: number, hoverIndex: number) => void;
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
            // eslint-disable-next-line no-param-reassign
            item.index = hoverIndex;
        },
        drop: () => {
            // If the item is not dropped, it won't be called
            // Therefore, to save the changed order, it should do it in the hover event
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
    const [isLinkDragging, setIsLinkDragging] = React.useState(false);

    const linkRef = React.useRef(null);
    linkRef.current = links;

    React.useEffect(() => {
        setLinks(props.links ?? []);
    }, [props.links]);

    const onClick = React.useCallback((link: Link) => {
        if (link.type === LinkType.FolderLink) {
            DDDot.postMessage({
                type: "panel.openFolder",
                folderId: link.id,
            });
        } else {
            DDDot.postMessage({
                type: "dddot.openNote",
                noteId: link.id,
            });
        }
    }, []);

    const onContextMenu = React.useCallback((link: Link) => {
        DDDot.postMessage({
            type: "shortcuts.tool.removeLink",
            id: link.id,
        });
    }, []);

    const onOrderChanged = React.useCallback((linkIds: string[]) => {
        DDDot.postMessage({
            type: "shortcuts.onOrderChanged",
            linkIds,
        });
    }, []);

    const moveRow = React.useCallback((dragIndex: number, hoverIndex: number) => {
        setLinks((prev) => {
            const newValue = [...prev];
            const tmp = newValue[dragIndex];
            newValue[dragIndex] = newValue[hoverIndex];
            newValue[hoverIndex] = tmp;
            onOrderChanged(newValue.map((link) => link.id));
            return newValue;
        });
    }, []);

    const isEmpty = (links?.length ?? 0) === 0;

    const ref = React.useRef(null);

    React.useEffect(() => {
        const dragover = (e: DragEvent) => {
            const dt = e.dataTransfer;
            if (
                (dt.types.indexOf(DDDot.X_JOP_NOTE_IDS) >= 0)
                 || dt.types.indexOf(DDDot.X_JOP_FOLDER_IDS) >= 0
            ) {
                setIsLinkDragging(true);
                dt.dropEffect = "link";
                e.stopPropagation();
                e.preventDefault();
            }
        };

        const dragleave = () => {
            setIsLinkDragging(false);
        };

        const drop = (e: DragEvent) => {
            e.stopPropagation();
            e.preventDefault();
            setIsLinkDragging(false);

            const noteData = e.dataTransfer.getData(DDDot.X_JOP_NOTE_IDS);
            if (noteData !== "") {
                const noteId = noteData.replace("[\"", "").replace("\"]", "");
                DDDot.postMessage({
                    type: "shortcuts.onNoteDropped",
                    noteId,
                });
            }

            const folderData = e.dataTransfer.getData(DDDot.X_JOP_FOLDER_IDS);
            if (folderData !== "") {
                const folderId = folderData.replace("[\"", "").replace("\"]", "");
                DDDot.postMessage({
                    type: "shortcuts.tool.pushFolder",
                    folderId,
                });
            }
        };

        const el = ref.current;
        el.addEventListener("dragover", dragover);
        el.addEventListener("dragleave", dragleave);
        el.addEventListener("drop", drop);

        return () => {
            el.removeEventListener("dragover", dragover);
            el.removeEventListener("dragleave", dragleave);
            el.removeEventListener("drop", drop);
        };
    }, []);

    const className = isLinkDragging ? "dddot-note-list dddot-note-dragging" : "dddot-note-list";

    return (
        <div className={className} ref={ref}>
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
                                onContextMenu={onContextMenu}/>
                        </React.Fragment>
                    ))
                )
            }
        </div>
    );
}
