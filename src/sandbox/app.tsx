import React from "react";
import { createRoot } from "react-dom/client";
import { MainPanel } from "./mainpanel";
import { initializeI18N } from "../i18n";

class App {
    static toolsOrder = [] as string[];

    static render(id: string, tools: any[]) {
        const domNode = document.getElementById(id);
        const root = createRoot(domNode);

        root.render(<MainPanel tools={tools} defaultToolsOrder={this.toolsOrder}/>);
    }

    static setSectionViewProp(toolId: string, key: string, value: any) {
        MainPanel.setSectionViewProp(toolId, key, value);
    }

    static setToolsOrder(order: string[]) {
        App.toolsOrder = order;
    }

    static setupLocale(locale: string) {
        initializeI18N(locale);
    }
}

(window as any).App = App;
