import { Marked } from "marked";
import { Outline } from "../../types/outline";

export class MarkdownParserService {
    marked: Marked;

    constructor() {
        this.marked = new Marked({
            async: true,
        });
    }

    async parseOutlines(markdown: string): Promise<Outline[]> {
        const result = await this.marked.lexer(markdown);
        const outlines = [] as Outline[];
        let lastOutline = null;
        result.forEach((token) => {
            if (token.type !== "heading") {
                return;
            }
            const outline = {
                title: token.text,
                level: token.depth,
                slug: token.text.toLowerCase().replace(/ /g, "-"),
                children: [],
            } as Outline;
            if (lastOutline && lastOutline.level < outline.level) {
                lastOutline.children.push(outline);
            } else {
                outlines.push(outline);
            }
            lastOutline = outline;
        });
        return outlines;
    }
}
