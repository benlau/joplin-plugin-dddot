import React from "react";

type Props = {
    content?: string;
    height?: number;
};

type State = {
    cm: any;
}

export function ScratchpadView(props: Props) {
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);

    const state = React.useRef<State>({
        cm: null,
    });

    const updateHeight = React.useCallback((newHeight: number) => {
        if (state.current.cm && newHeight != null) {
            state.current.cm.setSize(null, `${newHeight}px`);
        }
    }, []);

    const updateContent = React.useCallback((newContent?: string) => {
        if (state.current.cm && newContent != null) {
            state.current.cm.setValue(newContent);
        }
    }, []);

    React.useEffect(() => {
        const textArea = textareaRef.current;
        const height = props.height ?? 80;

        const cm = CodeMirror5Manager.instance.create(textArea, {
            mode: "markdown",
            lineWrapping: true,
            highlightFormatting: true,
            theme: CodeMirror5Manager.instance.themeName,
        });
        state.current.cm = cm;

        cm.setSize(null, `${height}px`);
        const minHeight = 50;

        CodeMirror5Manager.instance.setupResizable(
            cm,
            height,
            minHeight,
            ".dddot-scratchpad-handle",
            (newHeight) => {
                DDDot.postMessage({
                    type: "scratchpad.tool.setHeight",
                    height: newHeight,
                });
            },
        );

        cm.on("change", async () => {
            const value = cm.getValue();
            cm.save();
            await DDDot.postMessage({
                type: "scratchpad.saveTextArea",
                value,
            });
        });

        cm.on("dragover", (_, event) => {
            const dt = event.dataTransfer;
            if (dt.types.indexOf(DDDot.X_JOP_NOTE_IDS) >= 0) {
                dt.dropEffect = "link";
                event.preventDefault();
            }
        });

        cm.on("drop", async (_, event) => {
            const dt = event.dataTransfer;
            if (dt.types.indexOf(DDDot.X_JOP_NOTE_IDS) >= 0) {
                const noteId = dt.getData(DDDot.X_JOP_NOTE_IDS).replace("[\"", "").replace("\"]", "");

                const text = `${await DDDot.createNoteLink(noteId)}\n`;
                const doc = cm.getDoc();

                const x = event.pageX;
                const y = event.pageY;
                cm.setCursor(cm.coordsChar({ left: x, top: y }));
                const cursor = cm.getCursor();
                doc.replaceRange(text, cursor);
            }
        });

        DDDot.onEvent((event) => {
            switch (event.type) {
            case DDDot.Event.SortableDragStarted:
                cm.setOption("dragDrop", false);
                break;
            case DDDot.Event.SortableDragEnded:
                cm.setOption("dragDrop", true);
                break;
            default:
                break;
            }
        });

        updateContent(props.content);
        updateHeight(props.height ?? 80);
        // TODO: Handle drop event
    }, []);

    React.useEffect(() => {
        updateContent(props.content);
    }, [props.content]);

    React.useEffect(() => {
        updateHeight(props.height ?? 80);
    }, [props.height]);

    return (
        <div>
            <textarea id="dddot-scratchpad-textarea" rows="10" ref={textareaRef}></textarea>
            <div class="fas fa-ellipsis-h dddot-scratchpad-handle"></div>
        </div>
    );
}
