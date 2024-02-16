import LinkListModel from "../src/models/linklistmodel";
import { LinkMonad } from "../src/types/link";

test("push", () => {
    const model = new LinkListModel();
    expect(model.links).toStrictEqual([]);
    const link = LinkMonad.createNoteLink("id", "title");
    model.push(link);
    expect(model.links).toStrictEqual([link]);
});

test("push duplicated should remove", () => {
    const ids = ["1", "2", "3"];
    const model = new LinkListModel();
    ids.forEach((id) => {
        const link = LinkMonad.createNoteLink(id, "title");
        model.push(link);
    });

    const link = LinkMonad.createNoteLink("1", "title");
    model.push(link);

    expect(model.links.length).toBe(3);
    expect(model.links[2].id).toBe("1");
});

test("reoreder", () => {
    const ids = ["1", "2", "3"];

    const model = new LinkListModel();

    ids.forEach((id) => {
        const link = LinkMonad.createNoteLink(id, "title");
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
        const link = LinkMonad.createNoteLink(id, "title");
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
        const link = LinkMonad.createNoteLink(id, "title");
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

    model.push(LinkMonad.createNoteLink("1", "1"));
    model.push(LinkMonad.createNoteLink("2", "2"));
    const json = model.dehydrate();
    const expected = [
        {
            id: "1", title: "1", type: "NoteLink", isTodo: false, isTodoCompleted: false,
        },
        {
            id: "2", title: "2", type: "NoteLink", isTodo: false, isTodoCompleted: false,
        },
    ];
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
