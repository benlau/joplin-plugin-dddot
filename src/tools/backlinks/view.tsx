import React from "react";
import { LinkList } from "../../views/linklist";
import { Link } from "../../views/linkitem";

type Props = {
    links?: Link[];
}

export function BacklinksView(props: Props) {
    const onClick = React.useCallback((link: Link) => {
        DDDot.postMessage({
            type: "dddot.openNote",
            noteId: link.id,
        });
    }, []);

    const onContextMenu = React.useCallback((link: Link) => {
        DDDot.postMessage({
            type: "backlinks.tool.openNoteDetailDialog",
            noteId: link.id,
        });
    }, []);

    return (
        <LinkList links={props.links ?? []} onClick={onClick} onContextMenu={onContextMenu}/>
    );
}
