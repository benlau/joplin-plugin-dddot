import React from "react";
import { t } from "i18next";
import { Overlay } from "../../views/overlay";
import { PrimaryButton } from "../../views/primarybutton";

import { Link } from "../../types/link";

export type ShortcutsStorage = {
    version: "v1",
    shortcuts: Link[],
}

export function ShortcutsOverlay(props: {
    links?: Link[];
    onClose: () => void;
}) {
    const {
        links,
    } = props;

    const exportShortcuts = React.useCallback(() => {
        const storage = {
            version: "v1",
            shortcuts: links ?? [],
        } as ShortcutsStorage;

        const data = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(storage, null, 4))}`;
        const elem = document.createElement("a");
        elem.setAttribute("href", data);
        elem.setAttribute("download", "shortcuts.json");
        elem.click();
    }, [links]);

    return (
        <Overlay
            header={
                (
                    <h3>{t("shortcuts.title")}</h3>)}
            onClose={props.onClose}
        >
            <div className="flex flex-row gap-2">
                <PrimaryButton>
                    {t("shortcuts.import")}
                </PrimaryButton>
                <PrimaryButton onClick={exportShortcuts}>
                    {t("shortcuts.export")}
                </PrimaryButton>
            </div>
        </Overlay>
    );
}
