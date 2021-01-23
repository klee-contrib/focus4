import {ReactNode} from "react";

import {ToBem} from "@focus4/styling";

import {TimelineCss} from "../__style__/timeline.css";

/** Composant pour le bouton d'ajout sur une timeline. */
export function TimelineAddItem({children, theme}: {children: ReactNode; theme: ToBem<TimelineCss>}) {
    return (
        <li className={theme.add()}>
            <div className={theme.badge()} />
            <div className={theme.panel()}>{children}</div>
        </li>
    );
}
