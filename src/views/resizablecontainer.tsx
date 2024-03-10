import React from "react";

type Props = {
    minHeight: number;
    setHeight: (height: number) => void;
    getHeight: () => number;
    children?: React.ReactNode;
}

type State = {
    isMouseDown: boolean;
    startY: number;
    height: number;
    dragStartHeight: number;
}

export function ResizableContainer(props: Props) {
    const {
        minHeight,
        children,
    } = props;

    const handleRef = React.useRef<HTMLDivElement>(null);

    const state = React.useRef<State>({
        isMouseDown: false,
        startY: -1,
        dragStartHeight: 0,
    });

    const setHeightRef = React.useRef(props.setHeight);
    setHeightRef.current = props.setHeight;

    const getHeightRef = React.useRef(props.getHeight);
    getHeightRef.current = props.getHeight;

    React.useEffect(() => {
        const handle = handleRef.current;
        if (!handle) {
            return;
        }

        const updateHeight = (newHeight: number) => {
            state.current.height = newHeight;
            setHeightRef.current(newHeight);
        };

        const onMouseDown = (e: MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();
            state.current.isMouseDown = true;
            state.current.startY = e.clientY;
            state.current.dragStartHeight = getHeightRef.current();
        };

        const onMouseMove = (e: MouseEvent) => {
            if (state.current.isMouseDown) {
                e.preventDefault();
                e.stopPropagation();
                const newHeight = state.current.dragStartHeight + e.clientY - state.current.startY;
                if (newHeight >= minHeight) {
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
            {children}
            <div class="fas fa-ellipsis-h dddot-scratchpad-handle" ref={handleRef}></div>
        </div>
    );
}
