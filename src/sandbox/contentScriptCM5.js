function plugin(context) {
    if (context.cm6) {
        return;
    }

    context.defineExtension("dddot.contentScript.scrollToLine", function contentScript(lineno) {
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
