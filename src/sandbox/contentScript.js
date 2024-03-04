function plugin(CodeMirror) {
    CodeMirror.defineExtension("dddot.contentScript.scrollToLine", function contentScript(lineno) {
        // Ref&Credit: joplin-outline project
        // https://github.com/cqroot/joplin-outline
        this.scrollTo(null, this.charCoords({ line: lineno, ch: 0 }, "local").top);
        this.scrollTo(null, this.charCoords({ line: lineno, ch: 0 }, "local").top);
    });
}

module.exports = {
    default() {
        return {
            plugin,
        };
    },
};
