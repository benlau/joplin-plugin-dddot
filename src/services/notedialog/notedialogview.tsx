import React from "react";
import { t } from "i18next";
import { NoteLink } from "../../views/notelink";
import { PrimaryButton } from "../../views/primarybutton";
import { Overlay } from "../../views/overlay";

type Props = {
    title?: string;
    noteId?: string;
    content?: string;
    onClose: () => void;
}

type State = {
    cm: any;
}

export function CommandButton(props: {
    noteId: string,
    command: string, title: string, tooltip: string, alignment: string}) {
    const {
        noteId,
        command,
        title,
        tooltip,
    } = props;

    const { alignment } = props;
    const position = alignment !== "" ? `tooltip-${alignment}` : "";

    const className = `${position}`;

    const onClick = React.useCallback(() => {
        DDDot.postMessage({
            type: "notedialog.service.command",
            command,
            noteId,
        });
    }, [noteId, command]);

    return (
        <PrimaryButton className={className} onClick={onClick} tooltip={tooltip}>
            {t(title)}
        </PrimaryButton>
    );
}

const commands = [
    ["append-selected-text",
        "notedialog.cut_append_selected_text",
        "notedialog.cut_append_selected_text_tooltip"],
    ["append-note-link",
        "notedialog.append_note_link",
        "notedialog.append_note_link_tooltip"],
];

export function NoteDialogView(props: Props) {
    const {
        title,
        noteId,
        content,
    } = props;

    const textareaRef = React.useRef<HTMLTextAreaElement>(null);

    const state = React.useRef<State>({
        cm: null,
    });

    const updateContent = React.useCallback((newContent?: string) => {
        const { cm } = state.current;

        if (cm && newContent != null) {
            const originalContent = state.current.cm.getValue();
            cm.setValue(newContent);

            if (originalContent !== "") {
                const lastLine = cm.lastLine();
                const rect = cm.charCoords({ line: lastLine, ch: 0 });
                const height = rect.bottom;
                cm.scrollTo(null, height);
            }
        }
    }, []);

    React.useEffect(() => {
        const textArea = textareaRef.current;
        const cm = CodeMirror5Manager.instance.create(textArea, {
            mode: "markdown",
            lineWrapping: true,
            highlightFormatting: true,
            readOnly: true,
            theme: CodeMirror5Manager.instance.themeName,
        });
        cm.setSize(null, "100%");
        state.current.cm = cm;
    }, []);

    React.useEffect(() => {
        updateContent(content);
    }, [content]);

    return (
        <Overlay
            header={
                (<NoteLink title={title} noteId={noteId}/>)
            }
            onClose={props.onClose}>
            <>
                <div class="dddot-notedialog-editor">
                    <div class="dddot-notedialog-editor-content">
                        <textarea rows="10" ref={textareaRef}></textarea>
                    </div>
                </div>
                <div class="dddot-notedialog-tool-panel">
                    <CommandButton
                        noteId={noteId}
                        command="swap"
                        title="notedialog.swap"
                        tooltip="notedialog.swap_tooltip"
                        alignment="right"
                    />
                </div>
                <div class="dddot-note-dialog-command-panel">
                    <div class="dddot-note-dialog-command-panel-content">
                        <h3>{t("notedialog.note_editor")} ⮕ {t("notedialog.quick_view")}</h3>
                        {
                            // eslint-disable-next-line @typescript-eslint/no-shadow
                            commands.map(([command, title, tooltip], index) => (
                                <div key={index}>
                                    <CommandButton
                                        noteId={noteId}
                                        command={command}
                                        title={title}
                                        tooltip={tooltip}
                                        alignment="left"/>
                                </div>
                            ))
                        }
                    </div>
                </div>
            </>
        </Overlay>
    );
}
