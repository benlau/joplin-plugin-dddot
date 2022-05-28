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

test("dehydrate", () => {
    const model = new LinkListModel();

    model.push(Link.createNoteLink("1", "1"));
    model.push(Link.createNoteLink("2", "2"));
    const json = model.dehydrate();
    const expected = [{ id: "1", title: "1", type: "NoteLink" }, { id: "2", title: "2", type: "NoteLink" }];
    expect(json).toStrictEqual(expected);
});

test("rehydrate", () => {
    const input = [{ id: "1", title: "1", type: "NoteLink" }, { id: "2", title: "2", type: "NoteLink" }];
    const model = new LinkListModel();

    model.rehydrate(input);

    expect(model.links.length).toBe(2);
    expect(model.links[1].id).toBe("2");
});

test("rehydrate could filter invalid data", () => {
    const input = [{}, { id: "1", title: "1", type: "NoteLink" }, { id: "2", title: "2", type: "NoteLink" }];
    const model = new LinkListModel();

    model.rehydrate(input);

    expect(model.links.length).toBe(2);
    expect(model.links[1].id).toBe("2");
});
