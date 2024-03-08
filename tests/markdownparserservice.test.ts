import { MarkdownParserService } from "../src/services/markdownparser/markdownparserservice";

test("parseHeadings", async () => {
    const service = new MarkdownParserService();
    const sample = `
# Title
123
## Subtitle 1
456
# Title 2
`;
    const headings = await service.parseHeadings(sample);

    expect(headings).toStrictEqual([
        {
            title: "Title",
            level: 1,
            lineno: 1,
            slug: "title",
            children: [
                {
                    title: "Subtitle 1",
                    level: 2,
                    lineno: 3,
                    slug: "subtitle-1",
                    children: [],
                },
            ],
        },
        {
            title: "Title 2",
            level: 1,
            slug: "title-2",
            lineno: 5,
            children: [],
        },
    ]);
});

test("slug", () => {
    const service = new MarkdownParserService();

    expect(service.slug("Title")).toStrictEqual("title");
    expect(service.slug("♥")).toStrictEqual("hearts");
    expect(service.slug("🔴 Important note")).toStrictEqual("red_circle-important-note");
});
