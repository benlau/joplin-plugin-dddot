import React from "react";
import cntl from "cntl";
import { t } from "i18next";
import { ResizableContainer } from "../../views/resizablecontainer";
import { Heading, Outline } from "../../types/outline";
import { InlineIconButton } from "../../views/inlineiconbutton";
import { FixedHeightContainer } from "../../views/fixedheightcontainer";
import { OutlineToolResizeMode } from "./types";

const OutlineLineHeight = 28;
const OutlineHeightMargin = 10;
const MinHeight = OutlineLineHeight + OutlineHeightMargin;

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

export function OutlineRow(props: {
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
    resizeMode?: OutlineToolResizeMode;
}

function Content(props: Props) {
    const {
        id,
        title,
        outlines,
    } = props;

    const flattenOutlines = React.useMemo(() => {
        // eslint-disable-next-line max-len
        const flatten = (items?: Heading[]) => items?.flatMap((outline) => [outline, ...flatten(outline.children),
        ]) ?? [];
        return flatten(outlines);
    }, [outlines]);

    return (
        <>
            {flattenOutlines.map((outline, index) => (
                <React.Fragment key={index}>
                    <OutlineRow
                        noteId={id ?? ""}
                        noteTitle={title ?? ""}
                        outline={outline} />
                </React.Fragment>
            ))}
        </>
    );
}

export function OutlineView(props: Props) {
    const {
        height,
        heightRefreshCounter,
    } = props;

    const resizeMode = props.resizeMode ?? OutlineToolResizeMode.Manual;

    const [contentHeight, setContentHeight] = React.useState(height ?? MinHeight);
    const contentHeightRef = React.useRef(contentHeight);
    contentHeightRef.current = contentHeight;

    const getHeight = React.useCallback(() => contentHeightRef.current, []);

    const updateHeight = React.useCallback((newHeight: number) => {
        setContentHeight(newHeight);
        DDDot.postMessage({
            type: "outline.setHeight",
            height: newHeight,
        });
    }, []);

    React.useEffect(() => {
        setContentHeight(height);
    }, [heightRefreshCounter, height]);

    return (
        <>
            {
                resizeMode === OutlineToolResizeMode.Manual ? (
                    <ResizableContainer
                        setHeight={updateHeight}
                        getHeight={getHeight}
                        minHeight={MinHeight}>
                        <FixedHeightContainer height={contentHeight}>
                            <Content {...props} />
                        </FixedHeightContainer>
                    </ResizableContainer>
                ) : (
                    <Content {...props} />
                )
            }
        </>
    );
}
