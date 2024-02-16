export default class RendererService {
    renderInlineMarkdownLink(id: string, title: string) {
        let escapedTitle = this.escapeInline(title);
        escapedTitle = this.replaceAll(escapedTitle, "[", "\\[");
        escapedTitle = this.replaceAll(escapedTitle, "]", "\\]");
        return `[${escapedTitle}](:/${id})`;
    }

    replaceAll(text: string, from: string, to: string) {
        return text.split(from).join(to);
    }

    escapeInline(text: string) {
        return this.replaceAll(text, "\"", "&quot;");
    }
}
