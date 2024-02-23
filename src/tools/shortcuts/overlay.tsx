import React from "react";
import { t } from "i18next";
import { Overlay } from "../../views/overlay";
import { PrimaryButton } from "../../views/primarybutton";

import { Link } from "../../types/link";
import { ShortcutsStorage, ShortcutsStorageValidator } from "./types";

export function ShortcutsOverlay(props: {
    links?: Link[];
    onClose: () => void;
}) {
    const {
        links,
    } = props;

    const exportShortcuts = React.useCallback(() => {
        const storage = {
            version: 1,
            shortcuts: links ?? [],
        } as ShortcutsStorage;

        const data = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(storage, null, 4))}`;
        const elem = document.createElement("a");
        elem.setAttribute("href", data);
        elem.setAttribute("download", "shortcuts.json");
        elem.click();
        elem.remove();
    }, [links]);

    const importShortcuts = React.useCallback(() => {
        const elem = document.createElement("input") as HTMLInputElement;
        elem.type = "file";
        elem.style.display = "none";
        document.body.appendChild(elem);
        elem.accept = "application/json";
        elem.onchange = (e: Event) => {
            if (e.target instanceof HTMLInputElement) {
                const { files } = e.target;
                const file = files[0];

                const reader = new FileReader();
                reader.addEventListener(
                    "load",
                    () => {
                        try {
                            const content = JSON.parse(reader.result as string);
                            const validator = new ShortcutsStorageValidator();
                            const res = validator.validate(content);
                            if (!res) {
                                throw new Error();
                            }
                            DDDot.postMessage({
                                type: "shortcuts.importShortcuts",
                                shortcuts: content.shortcuts,
                            });
                            alert(t("shortcuts.imported"));
                            props.onClose();
                        } catch {
                            alert(t("shortcuts.import_error"));
                        }
                    },
                );
                reader.readAsText(file);
            }
        };
        elem.click();
    }, []);

    return (
        <Overlay
            header={(<h3>{t("shortcuts.title")}</h3>)}
            onClose={props.onClose}
        >
            <div className="flex flex-row gap-2">
                <PrimaryButton onClick={importShortcuts}>
                    {t("shortcuts.import")}
                </PrimaryButton>
                <PrimaryButton onClick={exportShortcuts}>
                    {t("shortcuts.export")}
                </PrimaryButton>
            </div>
        </Overlay>
    );
}
