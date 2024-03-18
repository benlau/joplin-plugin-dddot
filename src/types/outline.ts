export enum OutlineType {
    Heading,
    Link
}

export type OutlineItem = {
    title: string;
    level: number;
    slug: string;
    lineno: number;
    type: OutlineType;
    link?: string;
    children: OutlineItem[];
};
