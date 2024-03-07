import React from "react";
import cntl from "cntl";
import { t } from "i18next";
import { Heading, Outline } from "../../types/outline";
import { InlineIconButton } from "../../views/inlineiconbutton";

const MIN_HEIGHT = 56;

function useToast() {
    const [message, setMessage] = React.useState<string | null>(null);
    const [opacity, setOpacity] = React.useState<number>(0);
    const [timer, setTimer] = React.useState<number | null>(null);

    const showToast = React.useCallback((toastMessage: string) => {
        setMessage(toastMessage);
        setOpacity(1);
        if (timer) {
            clearTimeout(timer);
        }
        setTimer(setTimeout(() => {
            setOpacity(0);
        }, 800));
    }, [timer]);

    const triggerProps = {
        opacity,
        message,
    };

    return {
        triggerProps,
        showToast,
    };
}

function Toast(props: ReturnType<typeof useToast>["triggerProps"]) {
    const {
        message,
        opacity,
    } = props;

    return (
        <div class={cntl`absolute top-0 left-0 bottom-0 right-0
                pl-[20px] pr-[20px]
                bg-[--joplin-background-color]
                text-[--joplin-color3]
                h-[28px]
                leading-[28px]
                transition-opacity
                duration-300
                `} style={{ opacity }}>
            {message}
        </div>
    );
}

export function OutlineItem(props: {
    noteId?: string;
    noteTitle?: string;
    outline: Outline }) {
    const {
        outline,
    } = props;
    const {
        level,
    } = outline;

    const onClick = React.useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        DDDot.postMessage({
            type: "outline.openOutline",
            slug: outline.slug,
            lineno: outline.lineno,
        });
    }, [outline.slug, outline.lineno]);

    const { triggerProps, showToast } = useToast();

    const onContextMenu = React.useCallback((e?) => {
        e?.preventDefault();
        e?.stopPropagation();
        showToast(t("outline.link_copied"));
        DDDot.postMessage({
            type: "outline.copyOutlineLink",
            link: outline.link,
        });
    }, [showToast, outline.link]);

    return (
        <div
            class="dddot-note-item [&_.hover-button]:hover:opacity-100 relative"
            onClick={onClick} onContextMenu={onContextMenu}>
            <div style={{ paddingLeft: `${8 * level}px` }}>
                <a href="#">
                    {outline.title}
                </a>
            </div>
            <Toast {...triggerProps}></Toast>
            <div className={cntl`
                hover-button
                absolute top-0 right-[4px] bottom-0
                opacity-0
                hover:opacity-100
                flex flex-row justify-center items-center
            `}>
                <InlineIconButton
                    onClick={onContextMenu}
                    icon="fa-copy"
                />
            </div>
        </div>
    );
}

type Props = {
    id?: string;
    title?: string;
    height?: number;
    heightRefreshCounter?: number;
    outlines?: Heading[];
}

type State = {
    isMouseDown: boolean;
    startY: number;
    height: number;
    dragStartHeight: number;
}

export function OutlineView(props: Props) {
    const {
        id,
        title,
        outlines,
        height,
        heightRefreshCounter,
    } = props;

    const flattenOutlines = React.useMemo(() => {
        // eslint-disable-next-line max-len
        const flatten = (items?: Heading[]) => items?.flatMap((outline) => [outline, ...flatten(outline.children),
        ]) ?? [];
        return flatten(outlines);
    }, [outlines]);

    const state = React.useRef<State>({
        isMouseDown: false,
        startY: -1,
        height: MIN_HEIGHT,
        dragStartHeight: 0,
    });

    const [contentHeight, setContentHeight] = React.useState(height ?? MIN_HEIGHT);

    React.useEffect(() => {
        const newHeight = height ?? MIN_HEIGHT;
        setContentHeight(newHeight);
        state.current.height = newHeight;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [height, heightRefreshCounter]);

    const contentHeightRef = React.useRef(contentHeight);
    contentHeightRef.current = contentHeight;

    const handleRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        const handle = handleRef.current;
        if (!handle) {
            return;
        }

        const updateHeight = (newHeight: number) => {
            state.current.height = newHeight;
            setContentHeight(newHeight);
            DDDot.postMessage({
                type: "outline.setHeight",
                height: newHeight,
            });
        };

        const onMouseDown = (e: MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();
            state.current.isMouseDown = true;
            state.current.startY = e.clientY;
            state.current.dragStartHeight = state.current.height;
        };

        const onMouseMove = (e: MouseEvent) => {
            if (state.current.isMouseDown) {
                e.preventDefault();
                e.stopPropagation();
                const newHeight = state.current.dragStartHeight + e.clientY - state.current.startY;
                if (newHeight >= MIN_HEIGHT) {
                    updateHeight(newHeight);
                }
            }
        };

        const onMouseUp = (e: MouseEvent) => {
            if (state.current.isMouseDown) {
                state.current.isMouseDown = false;
                e.preventDefault();
                e.stopPropagation();
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div>
            <div style={{ height: contentHeight }}
                className="overflow-y-auto"
            >
                {flattenOutlines.map((outline, index) => (
                    <React.Fragment key={index}>
                        <OutlineItem
                            noteId={id ?? ""}
                            noteTitle={title ?? ""}
                            outline={outline} />
                    </React.Fragment>
                ))}
            </div>
            <div class="fas fa-ellipsis-h dddot-scratchpad-handle" ref={handleRef}></div>
        </div>
    );
}
