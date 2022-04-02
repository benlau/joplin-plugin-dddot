enum LinkType {
  NoteLink = "NoteLink"
}

export default class Link {
    id: String;

    title: String;

    type: LinkType;

    static createNoteLink(id, title): Link {
        const link = new Link();
        link.id = id;
        link.title = title;
        link.type = LinkType.NoteLink;
        return link;
    }
}
