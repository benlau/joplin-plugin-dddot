import React from "react";
import { createRoot } from "react-dom/client";
import { MainPanel } from "./mainpanel";

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
}
  
(window as any).App = App;
