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
}

window.CodeMirror5Manager = CodeMirror5Manager;
