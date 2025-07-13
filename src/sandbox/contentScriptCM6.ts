import type { ContentScriptContext, MarkdownEditorContentScriptModule } from "api/types";

// modified from: https://github.com/personalizedrefrigerator/bug-report/tree/example/plugin-scroll-to-line
// ref: https://github.com/cqroot/joplin-outline

export default (_context: ContentScriptContext): MarkdownEditorContentScriptModule => ({
    plugin: (editorControl) => {
        if (editorControl.cm6) {
            editorControl.registerCommand("dddot.contentScript.scrollToLine", (lineNo: number) => {
                const { editor } = editorControl;

                let lineNumber = lineNo;
                if (lineNumber <= 0) {
                    lineNumber = 1;
                }
                if (lineNumber >= editor.state.doc.lines) {
                    lineNumber = editor.state.doc.lines;
                }

                const lineInfo = editor.state.doc.line(lineNumber);
                editor.dispatch(editor.state.update({
                    selection: { anchor: lineInfo.from },
                    scrollIntoView: true,
                }));
            });
        }
    },
});
