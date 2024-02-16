import React from "react";
import { LinkItem } from "./linkitem";
import { Link } from "../types/link";

type Props = {
    links: Link[];
    onClick: (link: Link) => void;
    onContextMenu: (link: Link) => void;
}

export function LinkList(props: Props) {
    return (
        <div className="dddot-note-list">
            {
                props.links.map((link) => (
                    <React.Fragment key={link.id}>
                        <LinkItem link={link}
                            onClick={props.onClick}
                            onContextMenu={props.onContextMenu}/>
                    </React.Fragment>
                ))
            }
        </div>
    );
}
