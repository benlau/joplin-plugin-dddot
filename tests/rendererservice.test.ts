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
