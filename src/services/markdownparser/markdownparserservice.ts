import uslug from "uslug";
import markdownit from "markdown-it";
import { Heading } from "../../types/outline";

export class MarkdownParserService {
    md: any;

    constructor() {
        this.md = markdownit();
    }

    escapeLinkText(title: string) {
        return title.replace(/(\[|\])/g, "\\$1");
    }

    slug(title: string) {
        return uslug(title);
    }

    genMarkdownLink(title: string, id: string, slug?: string) {
        if (!slug) {
            return `[${this.escapeLinkText(title)}](:/${id})`;
        }

        return `[${this.escapeLinkText(title)}](:/${id}#${slug})`;
    }

    parseHeadings(markdown: string): Heading[] {
        const result = this.md.parse(markdown, {});
        const outlines = [] as Heading[];
        let lastOutline = null;
        result.forEach((token, index) => {
            try {
                if (token.type !== "heading_open") {
                    return;
                }
                const title = result[index + 1].children.reduce((acc, cur) => acc + cur.content, "");

                const slug = uslug(title);
                const level = token.markup.length;
                const lineno = token.map[0];

                const outline = {
                    title,
                    level,
                    slug,
                    lineno,
                    children: [],
                } as Heading;
                if (lastOutline && lastOutline.level < outline.level) {
                    lastOutline.children.push(outline);
                } else {
                    outlines.push(outline);
                }
                lastOutline = outline;
            } catch (e) {
                console.error(e);
            }
        });
        return outlines;
    }
}
