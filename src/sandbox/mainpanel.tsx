import React from "react";
import { ToolInfo } from "src/types/toolinfo";
import { HTML5Backend } from "react-dnd-html5-backend";
import { DndProvider } from "react-dnd";
import { Section } from "./section";
import { BacklinksView } from "../tools/backlinks/view";
import { RecentNotesView } from "../tools/recentnotes/view";
import { ShortcutsView } from "../tools/shortcuts/view";
import { ShortcutsOverlay } from "../tools/shortcuts/overlay";
import { ScratchpadView } from "../tools/scratchpad/view";
import { NoteDialogView } from "../services/notedialog/notedialogview";
import { ToolbarView } from "../services/toolbar/toolbarview";

type Props = {
  tools: ToolInfo[];
  defaultToolsOrder: string[];
}

const Views = {
    backlinks: BacklinksView,
    recentnotes: RecentNotesView,
    shortcuts: ShortcutsView,
    shortcutsOverlay: ShortcutsOverlay,
    scratchpad: ScratchpadView,
    notedialog: NoteDialogView,
    toolbar: ToolbarView,
};

let singletonRef = null as null | {
  setSectionViewProp: (tool, key, value) => void;
  setOverlayVisible: (view: string, visible: boolean) => void;
};

export function MainPanel(props: Props) {
    const { tools, defaultToolsOrder } = props;
    const [viewPropsMap, setSectionViewPropMap] = React.useState(
        {} as {[key: string]: {[key:string]: any}},
    );
    const [overlayUpdateCounter, setOverlayUpdateCounter] = React.useState(
        0,
    );

    const [overlayVisibleList, setOverlayVisibleList] = React.useState([]);

    const closeOverlay = React.useCallback((overlay: string) => {
        setOverlayVisibleList((prev) => prev.filter((item) => item !== overlay));
    }, []);

    const [availableTools, setAvailableTools] = React.useState<ToolInfo[]>(
        () => tools.filter((tool) => tool.hasView).sort((a, b) => {
            let aIndex = defaultToolsOrder.indexOf(a.key);
            let bIndex = defaultToolsOrder.indexOf(b.key);
            if (aIndex < 0) {
                aIndex = defaultToolsOrder.length;
            }
            if (bIndex < 0) {
                bIndex = defaultToolsOrder.length;
            }
            return aIndex - bIndex;
        }),
    );

    const moveListItem = React.useCallback((dragIndex: number, hoverIndex: number) => {
        setAvailableTools((prev) => {
            const newValue = [...prev];
            const tmp = newValue[dragIndex];
            newValue[dragIndex] = newValue[hoverIndex];
            newValue[hoverIndex] = tmp;

            const toolIds = newValue.map((tool) => tool.key);

            DDDot.postMessage({
                type: "dddot.onToolOrderChanged",
                toolIds,
            });
            return newValue;
        });
    }, []);

    React.useEffect(() => {
        singletonRef = {
            setSectionViewProp: (tool, key, value) => {
                setSectionViewPropMap((prev) => {
                    const newViewProps = prev[tool] || {};
                    newViewProps[key] = value;
                    return {
                        ...prev,
                        [tool]: newViewProps,
                    };
                });
            },
            setOverlayVisible: (view: string, visible: boolean) => {
                setOverlayVisibleList((prev) => {
                    const items = prev.filter((overlay) => overlay !== view);
                    return visible ? items.concat(view) : items;
                });
                setOverlayUpdateCounter((prev) => prev + 1);
            },
        };
        return () => {
            singletonRef = null;
        };
    }, []);

    return (
        <DndProvider backend={HTML5Backend}>
            <div id="dddot-panel-container" className="h-screen flex flex-col">
                <ToolbarView
                    {...viewPropsMap.toolbar}
                />
                <div className="flex-1 overflow-y-auto">
                    {
                        availableTools.map((tool: ToolInfo, index: number) => {
                            const View = Views[tool.key];

                            if (!View) {
                                return null;
                            }

                            return (
                                <React.Fragment key={tool.key}>
                                    <Section tool={tool} index={index} moveListItem={moveListItem}>
                                        <View {...viewPropsMap[tool.key]}/>
                                    </Section>
                                </React.Fragment>
                            );
                        })
                    }
                </div>
            </div>
            {
                overlayVisibleList.map((overlay) => {
                    const View = Views[overlay];
                    return (
                        <div key={overlayUpdateCounter}>
                            <View
                                {...viewPropsMap[overlay]}
                                onClose={() => {
                                    closeOverlay(overlay);
                                }}
                            />
                        </div>
                    );
                })
            }
        </DndProvider>
    );
}

MainPanel.setSectionViewProp = (tool, key, value) => {
    singletonRef?.setSectionViewProp(tool, key, value);
};

MainPanel.setOverlayVisible = (view: string, visible: boolean) => {
    singletonRef?.setOverlayVisible(view, visible);
};
