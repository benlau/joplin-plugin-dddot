import React from "react";
import { LinkList } from "../../views/linklist";
import { Link } from "../../types/link";

type Props = {
    links?: Link[];
}

export function RecentNotesView(props: Props) {
    const onClick = React.useCallback((link: Link) => {
        DDDot.postMessage({
            type: "dddot.openNote",
            noteId: link.id,
        });
    }, []);

    const onContextMenu = React.useCallback((link: Link) => {
        DDDot.postMessage({
            type: "recentnotes.tool.openNoteDetailDialog",
            noteId: link.id,
        });
    }, []);

    return (
        <LinkList links={props.links ?? []} onClick={onClick} onContextMenu={onContextMenu}/>
    );
}
