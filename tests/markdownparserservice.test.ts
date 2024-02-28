import { MarkdownParserService } from "../src/services/markdownparser/markdownparserservice";

test("parseOutlines", async () => {
    const service = new MarkdownParserService();
    const sample = `
# Title
123
## Subtitle 1
456
# Title 2
`;
    const outline = await service.parseOutlines(sample);

    expect(outline).toStrictEqual([
        {
            title: "Title",
            level: 1,
            slug: "title",
            children: [
                {
                    title: "Subtitle 1",
                    level: 2,
                    slug: "subtitle-1",
                    children: [],
                },
            ],
        },
        {
            title: "Title 2",
            level: 1,
            slug: "title-2",
            children: [],
        },
    ]);
});
