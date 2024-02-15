class CodeMirror5Manager {
    static instance = null;

    constructor(theme) {
        this.theme = theme;
    }

    init(theme) {
        this.theme = theme;
        if (CodeMirror5Manager.instance === null) {
            CodeMirror5Manager.instance = this;
        }
    }

    get themeName() {
        return this.theme.isDarkTheme ? "blackboard" : "default";
    }

    create(textArea, options) {
        return CodeMirror.fromTextArea(textArea, options);
    }

    setupResizable(cm, height, minHeight, handleName, onHeightChanged) {
        let isResizing = false;
        let lastY = 0;
        let currentHeight = height;
        const handle = $(handleName);

        handle.on("mousedown", (e) => {
            isResizing = true;
            lastY = e.clientY;
        });

        $(document).on("mousemove", (e) => {
            if (!isResizing) { return; }

            const dy = e.clientY - lastY;
            const newHeight = currentHeight + dy;
            lastY = e.clientY;

            if (newHeight >= minHeight) {
                currentHeight = newHeight;
                cm.setSize(null, `${currentHeight}px`);
                if (onHeightChanged) {
                    onHeightChanged(currentHeight);
                }
            } else {
                isResizing = false;
            }
        }).on("mouseup", () => {
            isResizing = false;
        });
    }
}

window.CodeMirror5Manager = CodeMirror5Manager;
