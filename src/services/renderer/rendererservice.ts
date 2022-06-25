export default class RendererService {
    renderInlineMarkdownLink(id: string, title: string) {
        let escapedTitle = this.escapeInline(title);
        escapedTitle = this.replaceAll(escapedTitle, "[", "\\[");
        escapedTitle = this.replaceAll(escapedTitle, "]", "\\]");
        return `[${escapedTitle}](:/${id})`;
    }

    replaceAll(text: string, from: string, to: string) {
        return text.split(from).join(to);
    }

    escapeInline(text: string) {
        return this.replaceAll(text, "\"", "&quot;");
    }

    renderInlineDDDotPostMessage(message) {
        const json = this.escapeInline(JSON.stringify(message));
        return `DDDot.postMessage('${json}')`;
    }

    renderDataTransferSetData(mime: string, value: string) {
        return `event.dataTransfer.setData('${mime}', '${this.escapeInline(value)}')`;
    }

    renderNoteLink(id: string, title: string, options: any) {
        const events = ["onClick", "onContextMenu"];
        let checkbox = "";
        const {
            isTodo,
            isTodoCompleted,
        } = options;

        const listeners = events.map((event) => {
            if (event in options) {
                return `${event.toLocaleLowerCase()}="${this.renderInlineDDDotPostMessage(options[event])}; return false;"`;
            }
            return undefined;
        }).filter((item) => item !== undefined);

        if ("onDragStart" in options) {
            const setDataFunc = options.onDragStart.map(
                (item) => this.renderDataTransferSetData(item[0], item[1]),
            );
            listeners.push(
                `ondragstart="${setDataFunc.join(";")}"`,
            );
        }

        if (isTodo === true) {
            checkbox = isTodoCompleted === true
                ? "<i class='far fa-check-square'></i> "
                : "<i class='far fa-square'></i> ";
        }

        const js = listeners.join(" ");
        const escapedTitle = this.escapeInline(title);
        return `<div draggable="true" class="dddot-note-item" dddot-note-id="${id}" dddot-note-title="${escapedTitle}" ${js}>
            <div>
                <a href="#">${checkbox}${title}</a>
            </div>
        </div>`;
    }
}
