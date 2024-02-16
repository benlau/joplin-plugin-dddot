import React from "react";

type Props = {
    content?: string;
    height?: number;
};

const MIN_HEIGHT = 50;

type State = {
    cm: any;
    isMouseDown: boolean;
    startY: number;
    height: number;
    dragStartHeight: number;
}

// Bug: Drag link to scratchpad is not working

export function ScratchpadView(props: Props) {
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);
    const handleRef = React.useRef<HTMLDivElement>(null);

    const state = React.useRef<State>({
        cm: null,
        isMouseDown: false,
        startY: -1,
        height: MIN_HEIGHT,
        dragStartHeight: 0,
    });

    const updateHeight = React.useCallback((newHeight: number) => {
        if (state.current.cm && newHeight != null) {
            state.current.cm.setSize(null, `${newHeight}px`);
        }
        state.current.height = newHeight;
    }, []);

    const updateContent = React.useCallback((newContent?: string) => {
        if (state.current.cm && newContent != null) {
            state.current.cm.setValue(newContent);
        }
    }, []);

    React.useEffect(() => {
        const textArea = textareaRef.current;
        const height = props.height ?? MIN_HEIGHT;

        const cm = CodeMirror5Manager.instance.create(textArea, {
            mode: "markdown",
            lineWrapping: true,
            highlightFormatting: true,
            theme: CodeMirror5Manager.instance.themeName,
        });
        state.current.cm = cm;

        cm.setSize(null, `${height}px`);

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

        DDDot.onMessage("scratchpad.worker.toggleFocus", (_) => {
            const currentEditor = state.current.cm;
            if (!currentEditor.hasFocus()) {
                currentEditor.focus();
            } else {
                DDDot.postMessage({
                    type: "dddot.focusNoteBody",
                });
            }
        });

        updateContent(props.content);
        updateHeight(props.height ?? MIN_HEIGHT);
    }, []);

    React.useEffect(() => {
        updateContent(props.content);
    }, [props.content]);

    React.useEffect(() => {
        updateHeight(props.height ?? MIN_HEIGHT);
    }, [props.height]);

    /* Drag and drop */
    React.useEffect(() => {
        updateHeight(props.height ?? MIN_HEIGHT);

        const handle = handleRef.current;
        if (!handle || props.height == null) {
            return;
        }

        const onMouseDown = (e: MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();
            state.current.isMouseDown = true;
            state.current.startY = e.clientY;
            state.current.dragStartHeight = state.current.height;
        };

        const onMouseMove = (e: MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();
            if (state.current.isMouseDown) {
                const newHeight = state.current.dragStartHeight + e.clientY - state.current.startY;
                if (newHeight >= MIN_HEIGHT) {
                    updateHeight(newHeight);
                }
            }
        };

        const onMouseUp = (e: MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();
            if (state.current.isMouseDown) {
                state.current.isMouseDown = false;

                const newHeight = Math.max(
                    state.current.dragStartHeight + e.clientY - state.current.startY,
                    MIN_HEIGHT,
                );

                DDDot.postMessage({
                    type: "scratchpad.tool.setHeight",
                    height: newHeight,
                });
            }
        };

        handle.addEventListener("mousedown", onMouseDown);
        document.addEventListener("mouseup", onMouseUp);
        document.addEventListener("mousemove", onMouseMove);

        // eslint-disable-next-line consistent-return
        return () => {
            handle.removeEventListener("mousedown", onMouseDown);
            document.removeEventListener("mouseup", onMouseUp);
            document.removeEventListener("mousemove", onMouseMove);
        };
    }, [props.height]);

    return (
        <div>
            <textarea id="dddot-scratchpad-textarea" rows="10" ref={textareaRef}></textarea>
            <div class="fas fa-ellipsis-h dddot-scratchpad-handle" ref={handleRef}></div>
        </div>
    );
}
