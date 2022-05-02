enum LinkType {
  NoteLink = "NoteLink"
}

export default class Link {
    id: String;

    title: String;

    type: LinkType;

    isTodo: Boolean | undefined;

    isTodoCompleted: Boolean | undefined;

    static createNoteLink(
        id: string,
        title: string,
    ): Link {
        const link = new Link();
        link.id = id;
        link.title = title;
        link.type = LinkType.NoteLink;
        return link;
    }

    static createNoteLinkFromRawData(data) {
        const link = new Link();
        link.id = data.id ?? "";
        link.title = data.title ?? "";
        link.isTodo = data.is_todo === 1;
        link.isTodoCompleted = data.todo_completed > 0;
        link.type = LinkType.NoteLink;
        return link;
    }
}
