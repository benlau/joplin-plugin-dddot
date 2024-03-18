import uslug from "uslug";
import markdownit from "markdown-it";
import { OutlineItem, OutlineType } from "../../types/outline";

enum TokenType {
    Heading,
    Link
}

type Token = {
    type: TokenType;
}

type HeadingToken = Token & {
    type: TokenType.Heading;
    level: number;
    title: string;
    slug: string;
    lineno: number;
}

type LinkToken = Token & {
    type: TokenType.Link;
    lineno: number;
    title: string;
    url: string;
}

function parseHeadingToken(
    mdItTokens: any[],
    index: number,
): HeadingToken | undefined {
    try {
        const mdToken = mdItTokens[index];
        if (mdToken.type !== "heading_open") {
            return undefined;
        }

        const title = mdItTokens[index + 1].children.reduce((acc, cur) => acc + cur.content, "");

        const slug = uslug(title);
        const level = mdToken.markup.length;
        const lineno = mdToken.map[0];

        return {
            type: TokenType.Heading,
            title,
            level,
            slug,
            lineno,
        };
    } catch {
        return undefined;
    }
}

function parseLinkToken(mdItTokens: any[], index: number) {
    try {
        const mdItToken = mdItTokens[index];
        if (mdItToken.type !== "inline") {
            return undefined;
        }

        const rets = [] as LinkToken[];

        mdItToken.children.forEach((child, childIndex) => {
            try {
                if (child.type !== "link_open") {
                    return;
                }

                const linkOpenToken = mdItToken.children[childIndex];
                const linkTextToken = mdItToken.children[childIndex + 1];
                const url = linkOpenToken.attrs[0][1]; // [["href", "URL"]]
                const title = linkTextToken.content;
                const lineno = mdItToken.map?.[0] ?? 0;
                rets.push({
                    type: TokenType.Link,
                    title,
                    url,
                    lineno,
                } as LinkToken);
            } catch {
                // ignore
            }
        });
        return rets;
    } catch {
        return undefined;
    }
}

export class MarkdownParserService {
    md: any;

    constructor() {
        this.md = markdownit();
        this.md.validateLink = () => true;
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

    parseOutlines(markdown: string, includeLinks?: string[]): OutlineItem[] {
        let lastHeading = null;

        const handleHeading = (tokens: any[], index: number) => {
            const result = parseHeadingToken(tokens, index);
            if (!result) {
                return undefined;
            }

            const {
                title,
                slug,
                level,
                lineno,
            } = result;

            return {
                type: OutlineType.Heading,
                title,
                slug,
                level,
                lineno,
                children: [],
            } as OutlineItem;
        };

        const handleLink = (tokens: any[], index: number) => {
            const result = parseLinkToken(tokens, index);
            if (!result) {
                return undefined;
            }
            const level = lastHeading ? lastHeading.level + 1 : 1;

            return result.map((linkToken) => {
                const {
                    title,
                    url,
                    lineno,
                } = linkToken;
                return {
                    type: OutlineType.Link,
                    title,
                    slug: "",
                    level,
                    link: url,
                    lineno,
                };
            }).filter((item) => {
                const url = new URL(item.link);
                return includeLinks.includes(url.protocol.replace(":", ""));
            });
        };

        const tokens = this.md.parse(markdown, {});
        const outlines = [] as OutlineItem[];

        const handlers = [handleHeading] as any[];

        if (includeLinks && includeLinks.length > 0) {
            handlers.push(handleLink);
        }

        tokens.forEach((_token, index) => {
            handlers.forEach((handler) => {
                try {
                    const res = handler(tokens, index);
                    if (!res) {
                        return;
                    }
                    const outlineItems = Array.isArray(res) ? res : [res];
                    outlineItems.forEach((outlineItem) => {
                        if (lastHeading && lastHeading.level < outlineItem.level) {
                            lastHeading.children.push(outlineItem);
                        } else {
                            outlines.push(outlineItem);
                        }
                        if (outlineItem.type === OutlineType.Heading) {
                            lastHeading = outlineItem;
                        }
                    });
                } catch (e) {
                    console.error(e);
                }
            });
        });

        return outlines;
    }
}
