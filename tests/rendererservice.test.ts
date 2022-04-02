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

test("renderNoteLink", () => {
    const service = new RendererService();

    expect(service.renderNoteLink("0", "title", {
        onClick: {
            type: "message-type",
        },
    })).toBe("<div draggable=\"true\" class=\"dddot-note-item\" dddot-note-id=\"0\" dddot-note-title=\"title\" onclick=\"DDDot.postMessage('{&quot;type&quot;:&quot;message-type&quot;}'); return false;\"><div><a href=\"#\">title</a></div></div>");
});
