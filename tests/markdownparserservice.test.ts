import { MarkdownParserService } from "../src/services/markdownparser/markdownparserservice";
import { OutlineType } from "../src/types/outline";

describe("MarkdownParserService", () => {
    describe("parseOutlines", () => {
        it("It should able to parse headling", async () => {
            const service = new MarkdownParserService();
            const sample = `
# Title
123
## Subtitle 1
456
# Title 2
        `;
            const outlines = await service.parseOutlines(sample);

            expect(outlines).toStrictEqual([
                {
                    type: OutlineType.Heading,
                    title: "Title",
                    level: 1,
                    lineno: 1,
                    slug: "title",
                    children: [
                        {
                            type: OutlineType.Heading,
                            title: "Subtitle 1",
                            level: 2,
                            lineno: 3,
                            slug: "subtitle-1",
                            children: [],
                        },
                    ],
                },
                {
                    type: OutlineType.Heading,
                    title: "Title 2",
                    level: 1,
                    slug: "title-2",
                    lineno: 5,
                    children: [],
                },
            ]);
        });

        it("It should able to parse links with specific schema", async () => {
            const service = new MarkdownParserService();
            const sample = `
[Link 1](https://file1.md)

[Link 2](file://file1.md)
`;
            const outlines = await service.parseOutlines(sample, ["file"]);

            expect(outlines).toStrictEqual([
                {
                    type: OutlineType.Link,
                    title: "Link 2",
                    level: 1,
                    lineno: 3,
                    slug: "",
                    link: "file://file1.md",
                },
            ]);
        });

        it("It should able to parse links and heading together", async () => {
            const service = new MarkdownParserService();
            const sample = `
# Title 1
[Link 1](https://file1.md)
## Subtitle 1
`;
            const outlines = await service.parseOutlines(sample, ["https"]);

            expect(outlines).toStrictEqual([
                {
                    type: OutlineType.Heading,
                    title: "Title 1",
                    level: 1,
                    lineno: 1,
                    slug: "title-1",
                    children: [
                        {
                            type: OutlineType.Link,
                            title: "Link 1",
                            level: 2,
                            lineno: 2,
                            slug: "",
                            link: "https://file1.md",
                        },
                        {
                            type: OutlineType.Heading,
                            title: "Subtitle 1",
                            level: 2,
                            lineno: 3,
                            slug: "subtitle-1",
                            children: [],
                        },
                    ],
                },
            ]);
        });
    });
});

// test("parseLinks", async () => {
//     const service = new MarkdownParserService();
//     const sample = `
// [google](https://google.com)

// `;
//     const headings = await service.parseHeadings(sample);

//     expect(headings).toStrictEqual([
//     ]);
// });

test("slug", () => {
    const service = new MarkdownParserService();

    expect(service.slug("Title")).toStrictEqual("title");
    expect(service.slug("♥")).toStrictEqual("hearts");
    expect(service.slug("🔴 Important note")).toStrictEqual("red_circle-important-note");
});
