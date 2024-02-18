export type ToolButton = {
    tooltip: string;
    icon: string;
    message: any;
}

export type ToolInfo = {
    key: string;
    title: string;
    containerId: string;
    contentId: string;
    viewComponentName?: string;
    enabled: boolean;
    hasView: boolean;
    extraButtons: ToolButton[];
}
