import React from "react";
import cn from "classnames";
import { useDrag, useDrop } from "react-dnd";
import { ToolInfo } from "../types/toolinfo";
import { DragItemType } from "../types/drag";

type Props = {
    rawHtml?: string;
    tool: ToolInfo;
    index: number;
    moveListItem: (dragIndex: number, hoverIndex: number) => void;
    children?: React.ReactNode;
}

export function useSectionState(props: Props) {
    const {
        tool,
        index,
        moveListItem,
        rawHtml,
        children,
    } = props;

    const [isExpanded, setIsExpanded] = React.useState(true);

    const [{ isDragging }, dragRef, dragPreviewRef] = useDrag({
        type: DragItemType.Section,
        item: { tool, index },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    });
    const ref = React.useRef(null);

    const [spec, dropRef] = useDrop({
        accept: DragItemType.Section,
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

            moveListItem(dragIndex, hoverIndex);
            item.index = hoverIndex;
        },
    });

    const itemRef = dragPreviewRef(dropRef(ref));

    const onHeaderClick = React.useCallback(() => {
        setIsExpanded((prev) => !prev);
    }, [isExpanded]);

    return {
        tool,
        itemRef,
        dragRef,
        dragPreviewRef,
        isExpanded,
        setIsExpanded,
        onHeaderClick,
        isDragging,
        rawHtml,
        children,
        index, // Return index to make sure it could trigger SecionImpl to re-render after DnD
    };
}

export function SectionImpl(props: ReturnType<typeof useSectionState>) {
    const {
        tool,
        onHeaderClick,
        dragRef,
        itemRef,
        isDragging,
        rawHtml,
    } = props;

    const buttonClass = cn("dddot-expand-button", {
        "dddot-expand-button-active": props.isExpanded,
        "dddot-expand-button-inactive": !props.isExpanded,
    });

    const opacity = isDragging ? 0 : 1;

    return (
        <div data-id={tool.key} id={tool.containerId} ref={itemRef} style={{ opacity }}>
            <div class="dddot-tool-header" onClick={onHeaderClick} ref={props.dragRef}>
                <h3><i class="fas fa-bars"></i> {tool.title}</h3>
                <h3 class={buttonClass}><i class="fas fa-play"></i></h3>
            </div>
            {
                props.isExpanded && (
                    <div id={tool.contentId}>
                        {props.children}
                    </div>
                )
            }
        </div>
    );
}

export function Section(props: Props) {
    const states = useSectionState(props);
    return <SectionImpl {...states} />;
}