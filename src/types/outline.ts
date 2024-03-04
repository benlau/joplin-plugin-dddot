export type Heading = {
    title: string;
    level: number;
    slug: string;
    children: Heading[];
    lineno: number;
};

export type Outline = Heading & {
    link: string;
    children: Outline[];
};
