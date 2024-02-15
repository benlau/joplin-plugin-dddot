import React from "react";

type Props = {
    title: string;
    noteId: string;
}

export function NoteLink(props: Props) {
    const {
        title, noteId,
    } = props;

    const escapedTitle = title.split("\"").join("&quot;");

    const onClick = React.useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        DDDot.postMessage({
            type: "dddot.openNote",
            noteId,
        });
    }, [noteId]);

    return (
        <div draggable="true"
            class="dddot-text-decoration-none dddot-note-dialog-title"
            dddot-note-title={escapedTitle}
            onClick={onClick}>
            <div>
                <h3 class="dddot-note-dialog-title-text">
                    <a href="#">{title}</a>
                </h3>
            </div>
        </div>
    );
}
