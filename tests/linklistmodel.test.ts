import LinkListModel from "../src/models/linklistmodel";
import Link from "../src/types/link";

test("push", () => {
    const model = new LinkListModel();
    expect(model.links).toStrictEqual([]);
    const link = Link.createNoteLink("id", "title");
    model.push(link);
    expect(model.links).toStrictEqual([link]);
});

test("push duplicated should remove", () => {
    const ids = ["1", "2", "3"];
    const model = new LinkListModel();
    ids.forEach((id) => {
        const link = Link.createNoteLink(id, "title");
        model.push(link);
    });

    const link = Link.createNoteLink("1", "title");
    model.push(link);

    expect(model.links.length).toBe(3);
    expect(model.links[2].id).toBe("1");
});

test("reoreder", () => {
    const ids = ["1", "2", "3"];

    const model = new LinkListModel();

    ids.forEach((id) => {
        const link = new Link();
        link.id = id;
        model.push(link);
    });

    model.reorder(["2", "3"]);

    expect(
        model.links.map((link) => link.id),
    ).toStrictEqual(
        ["2", "3", "1"],
    );
});

test("update", () => {
    const ids = ["1", "2", "3"];
    const title = "new title";

    const model = new LinkListModel();

    ids.forEach((id) => {
        const link = new Link();
        link.id = id;
        model.push(link);
    });

    const res = model.update("2", {
        title,
    });

    expect(res).toBe(true);

    expect(
        model.links[1].title,
    ).toEqual(
        title,
    );
});

test("update - return false if nothing changed", () => {
    const ids = ["1", "2", "3"];
    const title = "title";

    const model = new LinkListModel();

    ids.forEach((id) => {
        const link = new Link();
        link.id = id;
        link.title = title;
        model.push(link);
    });

    const res = model.update("2", {
        title,
    });

    expect(res).toBe(false);

    expect(
        model.links[1].title,
    ).toEqual(
        title,
    );
});
