export enum LinkType {
  NoteLink = "NoteLink",
  FolderLink = "FolderLink"
}

export type Link = {
    id: string;

    title: string;

    type: LinkType;

    isTodo: boolean | undefined;

    isTodoCompleted: boolean | undefined;
}

export class LinkMonad {
    static createNoteLink(
        id: string,
        title: string,
    ): Link {
        return {
            id,
            title,
            isTodo: false,
            isTodoCompleted: false,
            type: LinkType.NoteLink,
        };
    }

    static createFolderLink(id: string, title: string): Link {
        return {
            id,
            title,
            isTodo: false,
            isTodoCompleted: false,
            type: LinkType.FolderLink,
        };
    }

    static createNoteLinkFromRawData(data): Link {
        return {
            id: data.id ?? "",
            title: data.title ?? "",
            isTodo: data.is_todo === 1,
            isTodoCompleted: data.todo_completed > 0,
            type: LinkType.NoteLink,
        };
    }
}
