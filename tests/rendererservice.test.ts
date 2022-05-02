import RendererService from "../src/services/renderer/rendererservice";

jest.mock("../src/repo/joplinrepo");
jest.mock("../src/services/joplin/joplinservice");

test("escapeInline", () => {
    const service = new RendererService();

    expect(service.escapeInline("\"\"")).toBe("&quot;&quot;");
});

test("renderInlineMarkdownLink", () => {
    const service = new RendererService();

    expect(service.renderInlineMarkdownLink("0", "title")).toBe("[title](:/0)");

    expect(service.renderInlineMarkdownLink("0", "[title]")).toBe("[\\[title\\]](:/0)");

    expect(service.renderInlineMarkdownLink("0", "\"title\"")).toBe("[&quot;title&quot;](:/0)");
});

test("renderNoteLink set onClick should dispatch the message", () => {
    const service = new RendererService();
    const type = "message-type";

    const html = service.renderNoteLink("0", "title", {
        onClick: {
            type,
        },
    });

    expect(html).toContain(type);
});

test("renderNoteLink set isTodo without isTodoCompleted should insert fa-square", () => {
    const service = new RendererService();
    const html = service.renderNoteLink("0", "title", {
        isTodo: true,
    });

    expect(html).toContain("far fa-square");
});
