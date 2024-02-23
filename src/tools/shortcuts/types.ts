import { Link } from "../../types/link";

export type ShortcutsStorage = {
    version: 1,
    shortcuts: Link[],
}

export class ShortcutsStorageValidator {
    validateLink(link: Link) {
        return link.id !== undefined
            && link.title !== undefined
            && link.type !== undefined
            && link.isTodo !== undefined
            && link.isTodoCompleted !== undefined;
    }

    validate(storage: any) {
        try {
            return storage.version === 1 && storage.shortcuts.every(this.validateLink);
        } catch (e) {
            return false;
        }
    }
}
